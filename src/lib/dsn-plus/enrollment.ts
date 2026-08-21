/**
 * DSN+ Enrollment Service — Priority 3
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * ENROLLMENT IS A PROPERTY OF THE VEHICLE, NOT THE MEMBER.
 *
 * FLAG F-9 established that Openbay subscriptions attach to a user rather than
 * a vehicle, which cannot express DSN's programme: a member may run four
 * vehicles and enrol only one. DSN therefore owns enrolment entirely in its own
 * database — `VehicleEnrollment` rows against `Vehicle.programStatus` — and
 * does not attempt to mirror it upstream. The member's `membershipTier` is a
 * derived convenience, recalculated from the vehicles, never authoritative on
 * its own (BUILD section J).
 *
 * PAYMENT: no card is taken. BUILD section P reserves the payment architecture
 * for David's decision, so an enrolment is created in PENDING_PAYMENT and the
 * discount does not apply until the DSN team activates it. Nothing here charges
 * anyone or implies that it has.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { trackFunnelEvent, recalculateMembershipTier } from "@/lib/membership/service";
import { calculateEnrollment, nextBillingDate } from "./pricing";
import type { PaymentPlanId } from "./pricing";

export interface EnrollmentRequest {
  userId: string;
  vehicleIds: string[];
  plan: PaymentPlanId;
}

export interface EnrollmentOutcome {
  ok: boolean;
  message: string;
  enrolledVehicleIds: string[];
  alreadyEnrolledVehicleIds: string[];
  quote?: ReturnType<typeof calculateEnrollment>;
}

/**
 * Registers the member's intent to enrol specific vehicles.
 *
 * The tier is resolved from the number of vehicles that WILL be enrolled once
 * this request completes — including vehicles already active — because the
 * BUILD prices on enrolled count, not on request size.
 */
export async function requestEnrollment(
  input: EnrollmentRequest
): Promise<EnrollmentOutcome> {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      id: { in: input.vehicleIds },
      userId: input.userId,
      status: { not: "REMOVED" },
    },
    select: { id: true, vin: true, programStatus: true },
  });

  if (vehicles.length === 0) {
    return {
      ok: false,
      message:
        "Please choose at least one vehicle from your profile to enroll in DSN+.",
      enrolledVehicleIds: [],
      alreadyEnrolledVehicleIds: [],
    };
  }

  const alreadyEnrolled = vehicles
    .filter((v) => v.programStatus === "DSN_PLUS")
    .map((v) => v.id);
  const toEnroll = vehicles.filter((v) => v.programStatus !== "DSN_PLUS");

  if (toEnroll.length === 0) {
    return {
      ok: true,
      message: "Those vehicles are already enrolled in DSN+.",
      enrolledVehicleIds: [],
      alreadyEnrolledVehicleIds: alreadyEnrolled,
    };
  }

  // Billing-date snapshot: the tier reflects the member's total active enrolled
  // vehicles once this request is applied (BUILD "Fleet Pricing").
  const existingActive = await prisma.vehicle.count({
    where: {
      userId: input.userId,
      status: { not: "REMOVED" },
      programStatus: "DSN_PLUS",
    },
  });
  const totalAfter = existingActive + toEnroll.length;
  const quote = calculateEnrollment(totalAfter, input.plan);

  const now = new Date();

  await prisma.$transaction(
    toEnroll.map((vehicle) =>
      prisma.vehicleEnrollment.create({
        data: {
          vehicleId: vehicle.id,
          userId: input.userId,
          vinAtEnrollment: vehicle.vin,
          plan: input.plan,
          // No payment has been taken; activation is a DSN operations action.
          status: "PENDING_PAYMENT",
          enrollmentDate: now,
          nextBillingDate: nextBillingDate(now, 1),
          fleetTierId: quote.tier.id,
          monthlyPerVehicleCents: quote.monthlyPerVehicleCents,
          activeVehicleCountAtSnapshot: totalAfter,
        },
      })
    )
  );

  await trackFunnelEvent("dsn_plus_enrollment_requested", {
    userId: input.userId,
    metadata: {
      vehicleCount: toEnroll.length,
      plan: input.plan,
      tier: quote.tier.id,
      monthlyPerVehicleCents: quote.monthlyPerVehicleCents,
    },
  });

  return {
    ok: true,
    message:
      "Your DSN+ enrollment request has been recorded. A Drive Service Network representative will complete activation and confirm your billing details.",
    enrolledVehicleIds: toEnroll.map((v) => v.id),
    alreadyEnrolledVehicleIds: alreadyEnrolled,
    quote,
  };
}

/**
 * Activates a pending enrolment. Called by DSN operations once payment is
 * arranged; this is the only place a vehicle becomes discount-eligible.
 */
export async function activateEnrollment(
  enrollmentId: string
): Promise<{ ok: boolean; message: string }> {
  const enrollment = await prisma.vehicleEnrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, vehicleId: true, userId: true, status: true, plan: true },
  });
  if (!enrollment) return { ok: false, message: "Enrollment not found." };
  if (enrollment.status === "ACTIVE") {
    return { ok: true, message: "That enrollment is already active." };
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.vehicleEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "ACTIVE",
        effectiveDate: now,
        nextBillingDate: nextBillingDate(now, 1),
      },
    }),
    prisma.vehicle.update({
      where: { id: enrollment.vehicleId },
      data: { programStatus: "DSN_PLUS" },
    }),
  ]);

  await recalculateMembershipTier(enrollment.userId);
  await trackFunnelEvent("dsn_plus_enrollment_completed", {
    userId: enrollment.userId,
    metadata: { enrollmentId: enrollment.id, vehicleId: enrollment.vehicleId },
  });

  return { ok: true, message: "DSN+ is now active on this vehicle." };
}

/**
 * Cancels an enrolment.
 *
 * BUILD section Q: DSN+ is never a permanent yes/no. Cancellation ends the
 * discount eligibility of the vehicle and the record is retained so the history
 * of what the vehicle was entitled to, and when, remains auditable.
 */
export async function cancelEnrollment(
  userId: string,
  vehicleId: string
): Promise<{ ok: boolean; message: string }> {
  const enrollment = await prisma.vehicleEnrollment.findFirst({
    where: {
      vehicleId,
      userId,
      status: { in: ["ACTIVE", "EXPIRING", "PENDING_PAYMENT"] },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (!enrollment) {
    return { ok: false, message: "That vehicle is not currently enrolled in DSN+." };
  }

  await prisma.$transaction([
    prisma.vehicleEnrollment.update({
      where: { id: enrollment.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    }),
    prisma.vehicle.update({
      where: { id: vehicleId },
      data: { programStatus: "FREE" },
    }),
  ]);

  await recalculateMembershipTier(userId);
  await trackFunnelEvent("dsn_plus_enrollment_cancelled", {
    userId,
    metadata: { vehicleId },
  });

  return {
    ok: true,
    message:
      "DSN+ has been cancelled for this vehicle. It remains registered under your free membership.",
  };
}

export interface MembershipSnapshot {
  membershipTier: "FREE" | "DSN_PLUS";
  memberSince: Date;
  registeredVehicles: number;
  enrolledVehicles: number;
  pendingEnrollments: number;
  /** Lifetime DSN+ savings recorded against completed appointments, in cents. */
  lifetimeSavingsCents: number;
  /** Savings the member would have made had every vehicle been enrolled. */
  forgoneSavingsCents: number;
}

/**
 * The membership status surface used by the dashboard and by every DSN+ call
 * to action, so the member always sees one consistent picture (BUILD "Dashboard
 * visibility" and section Q).
 */
export async function getMembershipSnapshot(userId: string): Promise<MembershipSnapshot> {
  const [user, registered, enrolled, pending, savings, allAppointments] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { membershipTier: true, memberSince: true },
      }),
      prisma.vehicle.count({ where: { userId, status: { not: "REMOVED" } } }),
      prisma.vehicle.count({
        where: { userId, status: { not: "REMOVED" }, programStatus: "DSN_PLUS" },
      }),
      prisma.vehicleEnrollment.count({
        where: { userId, status: "PENDING_PAYMENT" },
      }),
      prisma.appointment.aggregate({
        where: { userId, dsnPlusSavingsCents: { not: null } },
        _sum: { dsnPlusSavingsCents: true },
      }),
      prisma.appointment.findMany({
        where: {
          userId,
          quotedPriceCents: { not: null },
          dsnPlusSavingsCents: null,
        },
        select: { quotedPriceCents: true },
      }),
    ]);

  // What the member left on the table by not enrolling — computed from real
  // recorded prices only, never from an assumed average.
  const { totalSavings } = await import("./discount");
  const forgone = totalSavings(allAppointments.map((a) => a.quotedPriceCents));

  return {
    membershipTier: (user?.membershipTier as "FREE" | "DSN_PLUS") ?? "FREE",
    memberSince: user?.memberSince ?? new Date(),
    registeredVehicles: registered,
    enrolledVehicles: enrolled,
    pendingEnrollments: pending,
    lifetimeSavingsCents: savings._sum.dsnPlusSavingsCents ?? 0,
    forgoneSavingsCents: forgone,
  };
}
