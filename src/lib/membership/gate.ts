/**
 * Membership Gate
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * The two non-negotiable business rules from the REVAMP BUILD, in one place:
 *
 *   1. "No quotes or bookings until a visitor creates a FREE DSN membership"
 *      (BUILD section 6 / Absolute Rule 1).
 *   2. "All quotes and bookings must be associated with a vehicle that exists
 *      in the member's vehicle profile" (BUILD section 10 / Absolute Rule 2).
 *
 * Every quote or booking entry point MUST call requireQuoteEligibility. Both
 * rules are enforced server-side; client-side gating is presentation only.
 */
import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type GateOutcome =
  | { allowed: true; userId: string; vehicleCount: number }
  | { allowed: false; reason: "NO_MEMBERSHIP"; redirectTo: string; message: string }
  | { allowed: false; reason: "NO_VEHICLE"; redirectTo: string; message: string };

/**
 * BUILD section 6: the member must never be told "please log in" without
 * context. The copy below preserves intent — the visitor is told what happens
 * next and why, and is returned to what they were doing.
 */
export async function requireQuoteEligibility(
  returnTo = "/book"
): Promise<GateOutcome> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      allowed: false,
      reason: "NO_MEMBERSHIP",
      redirectTo: `/membership/join?returnTo=${encodeURIComponent(returnTo)}`,
      message:
        "Create your free Drive Service Network membership to see pricing and book service. It takes about a minute, and there is no charge.",
    };
  }

  const vehicleCount = await prisma.vehicle.count({
    where: { userId: session.user.id, status: { not: "REMOVED" } },
  });

  if (vehicleCount === 0) {
    return {
      allowed: false,
      reason: "NO_VEHICLE",
      redirectTo: `/dashboard/vehicles/new?returnTo=${encodeURIComponent(returnTo)}`,
      message:
        "Add a vehicle to your profile first. Every quote and booking is tied to a specific vehicle so pricing and service history stay accurate.",
    };
  }

  return { allowed: true, userId: session.user.id, vehicleCount };
}

/**
 * BUILD Absolute Rule 2 — verifies that a specific vehicle belongs to the
 * member before any quote or booking is created against it.
 */
export async function assertVehicleOwnership(
  userId: string,
  vehicleId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId, status: { not: "REMOVED" } },
    select: { id: true },
  });

  if (!vehicle) {
    return {
      ok: false,
      message:
        "That vehicle is not in your profile. Please select a vehicle you have registered.",
    };
  }

  return { ok: true };
}
