/**
 * DSN Membership Service
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Owns the FREE membership lifecycle:
 *   register → DSN member record → Openbay driver → Google Sheet mirror
 *
 * REVAMP BUILD rules enforced here:
 *   - No payment is required for FREE membership (section 7).
 *   - DSN's database is the system of record (section 8).
 *   - Membership status is separate from vehicle status (section J).
 *   - The member never sees Openbay (section 5) — no Openbay-branded mail is
 *     triggered (sendActivationEmail is always false; see FLAGS F-2).
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { getPlatformClient, PlatformApiRequestError } from "@/lib/platform";
import { syncMemberToSheet } from "@/lib/google-sheets/membership-sync";

export interface RegisterMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
  operatorType?: string;
  fleetSizeBand?: string;
  primaryMarket?: string;
  zipCode?: string;
  city?: string;
  state?: string;
}

/**
 * Provisions the member's Openbay driver record. Best-effort: a failure here
 * must not prevent the member from joining DSN, because DSN owns the member
 * relationship. The reconciliation path will retry on first vehicle add.
 */
export async function ensureOpenbayDriver(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      openbayUserId: true,
    },
  });
  if (!user) return null;
  if (user.openbayUserId) return user.openbayUserId;

  try {
    const client = getPlatformClient();
    const result = await client.createUser({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phone ?? undefined,
      // DSN owns all member communication — never trigger Openbay-branded mail.
      sendActivationEmail: false,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { openbayUserId: String(result.userId) },
    });
    return String(result.userId);
  } catch (err) {
    const detail =
      err instanceof PlatformApiRequestError
        ? { status: err.statusCode, message: err.message, endpoint: err.endpoint }
        : { message: String(err) };
    console.error("[Membership] Openbay driver provisioning failed", {
      userId,
      ...detail,
    });
    return null;
  }
}

/**
 * Recomputes the member's tier from their vehicles.
 *
 * BUILD section J and "Fundamental rule": a member is DSN_PLUS only while at
 * least one of their vehicles is actively enrolled. This never grants discount
 * eligibility to any other vehicle.
 */
export async function recalculateMembershipTier(userId: string): Promise<void> {
  const enrolledCount = await prisma.vehicle.count({
    where: {
      userId,
      status: { not: "REMOVED" },
      programStatus: "DSN_PLUS",
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { membershipTier: enrolledCount > 0 ? "DSN_PLUS" : "FREE" },
  });
}

/** Records a conversion-funnel event (BUILD sections 37 and T). */
export async function trackFunnelEvent(
  event: string,
  options: { userId?: string | null; metadata?: Record<string, unknown>; sessionId?: string } = {}
): Promise<void> {
  try {
    await prisma.funnelEvent.create({
      data: {
        event,
        userId: options.userId ?? null,
        metadata: (options.metadata ?? {}) as object,
        sessionId: options.sessionId ?? null,
      },
    });
  } catch (err) {
    // Analytics must never break a member workflow.
    console.error("[Funnel] failed to record event", { event, err: String(err) });
  }
}

/**
 * Post-registration side effects. Deliberately sequential and fully
 * non-blocking with respect to failures, so the member always lands on
 * "Add Your Vehicles" (BUILD section 9) regardless of downstream state.
 */
export async function completeMembershipProvisioning(userId: string): Promise<{
  openbayUserId: string | null;
  sheetStatus: string;
}> {
  const openbayUserId = await ensureOpenbayDriver(userId);
  const sheet = await syncMemberToSheet(userId, "CREATE");
  await trackFunnelEvent("membership_completed", {
    userId,
    metadata: { openbayLinked: Boolean(openbayUserId), sheetStatus: sheet.status },
  });
  return { openbayUserId, sheetStatus: sheet.status };
}

/** Dashboard fleet counters (BUILD "Dashboard visibility"). */
export async function getFleetSummary(userId: string): Promise<{
  registered: number;
  enrolled: number;
  eligibleToEnroll: number;
}> {
  const [registered, enrolled] = await Promise.all([
    prisma.vehicle.count({
      where: { userId, status: { not: "REMOVED" } },
    }),
    prisma.vehicle.count({
      where: { userId, status: { not: "REMOVED" }, programStatus: "DSN_PLUS" },
    }),
  ]);

  return {
    registered,
    enrolled,
    eligibleToEnroll: Math.max(0, registered - enrolled),
  };
}
