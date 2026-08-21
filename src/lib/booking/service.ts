/**
 * DSN Booking Service — Priority 2 (Core Transaction)
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Owns the transaction chain:
 *
 *   MEMBER → VEHICLE → SERVICE SELECTION (+ Platform interview)
 *          → FACILITY COMPARISON → AVAILABILITY → APPOINTMENT → HISTORY
 *
 * ARCHITECTURAL NOTE — how P2 was unblocked
 * -----------------------------------------
 * Priority 1 recorded FLAG F-1: Partner 116 is not entitled to
 * `POST /service-requests/v2/service-requests` (403), which appeared to block
 * the entire quote-to-booking workflow.
 *
 * Live probing on 21 August 2026 established that the STANDALONE APPOINTMENTS
 * surface is fully entitled for Partner 116:
 *
 *   POST /appointments/v2/appointments        → 201, appointmentStatus "confirmed"
 *   GET  /appointments/v2/appointments/slots  → real availability, 14 days
 *   GET  /appointments/v2/appointments/{id}   → the booked record
 *   PUT/DELETE .../{id}                       → reschedule and cancel
 *
 * DSN therefore books real appointments at real facilities against real
 * availability, without the service-request entitlement. What remains blocked
 * by F-1 is competitive OFFERS — the multi-shop priced estimates. DSN presents
 * facility comparison on the real attributes it can obtain (rating, review
 * count, distance, amenities, certifications, hours, warranty, live
 * availability) and never fabricates a price.
 *
 * ID DISCIPLINE: appointments endpoints key on the facility's public
 * `openbay_id` SLUG. `locations/v2` exposes both a numeric id and the slug.
 * Passing the numeric id to appointments returns 422. Both are persisted.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import {
  getPlatformClient,
  PlatformApiRequestError,
  engineFromStyleName,
} from "@/lib/platform";
import type {
  PlatformAppointmentSlot,
  PlatformCreateAppointmentRequest,
} from "@/lib/platform";
import { trackFunnelEvent } from "@/lib/membership/service";
import { applyMemberDiscount } from "@/lib/dsn-plus/discount";

export interface SelectedService {
  serviceId: number;
  serviceName?: string;
  interview?: Array<{ question: string; answer: string }>;
}

export interface CreateBookingInput {
  userId: string;
  vehicleId: string;
  /** Facility public slug (openbay_id) — required by the appointments API. */
  facilitySlug: string;
  /** Numeric locations/v2 id, retained for facility detail lookups. */
  facilityLocationId?: number;
  /** Offset-bearing ISO-8601 slot time from the availability response. */
  scheduledTime: string;
  services: SelectedService[];
  notes?: string;
  phone?: string;
  /** Quoted standard price in cents where a facility has supplied one. */
  quotedPriceCents?: number | null;
}

export interface BookingResult {
  ok: boolean;
  appointmentId?: string;
  openbayAppointmentId?: string;
  status: string;
  confirmed: boolean;
  message: string;
  /** True when the appointment exists only in DSN and needs manual follow-up. */
  pendingManualConfirmation?: boolean;
}

/**
 * Creates the appointment in Openbay and mirrors it into DSN.
 *
 * DSN's record is written FIRST and is authoritative (BUILD section 8). If the
 * Platform API call fails, the DSN appointment survives in PENDING so no member
 * request is ever lost, and the failure is surfaced honestly rather than being
 * presented as a confirmed booking.
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  const [user, vehicle] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.userId },
      select: { openbayUserId: true, phone: true, membershipTier: true },
    }),
    prisma.vehicle.findFirst({
      where: { id: input.vehicleId, userId: input.userId, status: { not: "REMOVED" } },
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        vin: true,
        trim: true,
        engine: true,
        mileage: true,
        openbayVehicleId: true,
        openbayStyleName: true,
        programStatus: true,
      },
    }),
  ]);

  if (!vehicle) {
    return {
      ok: false,
      status: "REJECTED",
      confirmed: false,
      message:
        "That vehicle is not in your profile. Please select a vehicle you have registered.",
    };
  }

  const serviceNames = input.services
    .map((s) => s.serviceName)
    .filter(Boolean)
    .join(", ");

  // DSN+ savings are recorded against the appointment so history and the
  // savings dashboard can report them without recomputation drift.
  const vehicleEnrolled = vehicle.programStatus === "DSN_PLUS";
  const pricing = applyMemberDiscount(input.quotedPriceCents ?? null);

  // Facility detail enriches the DSN record; a failure here must not stop a booking.
  let facilityName: string | null = null;
  let facilityAddress: string | null = null;
  let facilityCity: string | null = null;
  let facilityState: string | null = null;
  let facilityZip: string | null = null;
  let facilityPhone: string | null = null;
  let facilityRating: number | null = null;

  if (input.facilityLocationId) {
    try {
      const detail = await getPlatformClient().getLocation(input.facilityLocationId);
      facilityName = detail.name ?? null;
      facilityAddress = [detail.address_1, detail.address_2].filter(Boolean).join(" ").trim() || null;
      facilityCity = detail.city ?? null;
      facilityState = detail.state ?? null;
      facilityZip = detail.zipcode ?? null;
      facilityPhone = detail.phone_number ?? null;
      facilityRating = detail.internal_rating_average ?? null;
    } catch {
      // Non-fatal.
    }
  }

  const dsnAppointment = await prisma.appointment.create({
    data: {
      userId: input.userId,
      vehicleId: vehicle.id,
      serviceType: serviceNames || "Service appointment",
      serviceDescription: JSON.stringify(input.services),
      scheduledAt: new Date(input.scheduledTime),
      status: "PENDING",
      shopName: facilityName,
      shopAddress: facilityAddress,
      shopCity: facilityCity,
      shopState: facilityState,
      shopZipCode: facilityZip,
      shopPhone: facilityPhone,
      shopRating: facilityRating ?? undefined,
      openbayLocationId: input.facilitySlug,
      quotedPriceCents: pricing.standardCents ?? undefined,
      dsnPlusSavingsCents: vehicleEnrolled ? pricing.savingsCents ?? undefined : undefined,
      customerNotes: input.notes || null,
    },
    select: { id: true },
  });

  await trackFunnelEvent("booking_submitted", {
    userId: input.userId,
    metadata: {
      vehicleId: vehicle.id,
      facilitySlug: input.facilitySlug,
      serviceCount: input.services.length,
      dsnPlusVehicle: vehicleEnrolled,
    },
  });

  if (!user?.openbayUserId) {
    return {
      ok: true,
      appointmentId: dsnAppointment.id,
      status: "PENDING",
      confirmed: false,
      pendingManualConfirmation: true,
      message:
        "Your appointment request has been received. A Drive Service Network representative will confirm the time with the facility shortly.",
    };
  }

  const payload: PlatformCreateAppointmentRequest = {
    userId: Number(user.openbayUserId),
    locationId: input.facilitySlug,
    scheduledTime: input.scheduledTime,
    appointmentType: "service",
    services: input.services.map((s) => s.serviceId),
    phoneNumber: input.phone || user.phone || undefined,
    notes: buildFacilityNotes(input),
    ...(vehicle.openbayVehicleId
      ? { vehicleId: Number(vehicle.openbayVehicleId) }
      : {
          vehicleYear: vehicle.year,
          vehicleMake: vehicle.make,
          vehicleModel: vehicle.model,
          vehicleEngine:
            vehicle.engine ?? engineFromStyleName(vehicle.openbayStyleName) ?? undefined,
          vehicleTrim: vehicle.trim ?? undefined,
          vehicleVin: vehicle.vin ?? undefined,
          vehicleMileage: vehicle.mileage ?? undefined,
        }),
  };

  try {
    const created = await getPlatformClient().createAppointment(payload);
    const confirmed = String(created.appointmentStatus).toLowerCase() === "confirmed";

    await prisma.appointment.update({
      where: { id: dsnAppointment.id },
      data: {
        openbayAppointmentId: String(created.id),
        status: confirmed ? "CONFIRMED" : "PENDING",
      },
    });

    await trackFunnelEvent("booking_confirmed", {
      userId: input.userId,
      metadata: {
        appointmentId: dsnAppointment.id,
        openbayAppointmentId: created.id,
        status: created.appointmentStatus,
      },
    });

    return {
      ok: true,
      appointmentId: dsnAppointment.id,
      openbayAppointmentId: String(created.id),
      status: confirmed ? "CONFIRMED" : "PENDING",
      confirmed,
      message: confirmed
        ? "Your appointment is confirmed. The facility has your vehicle and service details."
        : "Your appointment has been submitted to the facility and is awaiting confirmation.",
    };
  } catch (err) {
    const detail =
      err instanceof PlatformApiRequestError
        ? { status: err.statusCode, entitlement: err.entitlement, message: err.message }
        : { message: String(err) };
    console.error("[Booking] appointment creation failed", {
      dsnAppointmentId: dsnAppointment.id,
      ...detail,
    });

    return {
      ok: true,
      appointmentId: dsnAppointment.id,
      status: "PENDING",
      confirmed: false,
      pendingManualConfirmation: true,
      message:
        "We have your appointment request, but the facility's scheduling system did not respond. A Drive Service Network representative will confirm your time shortly.",
    };
  }
}

/**
 * Composes the note the facility receives. The Platform interview answers are
 * included verbatim so the shop sees exactly what the member reported — DSN
 * authors no interview logic of its own (BUILD section 12).
 */
function buildFacilityNotes(input: CreateBookingInput): string {
  const parts: string[] = [];
  if (input.notes?.trim()) parts.push(input.notes.trim());

  const interview = input.services.flatMap((s) =>
    (s.interview ?? []).map((qa) => `${qa.question} — ${qa.answer}`)
  );
  if (interview.length > 0) {
    parts.push(`Reported by the member: ${interview.join("; ")}`);
  }

  parts.push("Booked via Drive Service Network.");
  return parts.join("\n").slice(0, 1800);
}

/**
 * Cancels a booking in Openbay and in DSN. History is preserved: the record is
 * marked CANCELLED, never deleted (BUILD section K).
 */
export async function cancelBooking(
  userId: string,
  appointmentId: string
): Promise<{ ok: boolean; message: string }> {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, userId },
    select: { id: true, openbayAppointmentId: true, status: true },
  });

  if (!appointment) {
    return { ok: false, message: "We could not find that appointment on your account." };
  }
  if (appointment.status === "CANCELLED") {
    return { ok: true, message: "That appointment is already cancelled." };
  }
  if (appointment.status === "COMPLETED") {
    return { ok: false, message: "Completed appointments cannot be cancelled." };
  }

  if (appointment.openbayAppointmentId) {
    try {
      await getPlatformClient().cancelAppointment(Number(appointment.openbayAppointmentId));
    } catch (err) {
      console.error("[Booking] upstream cancellation failed", {
        appointmentId,
        err: String(err),
      });
    }
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CANCELLED" },
  });

  await trackFunnelEvent("booking_cancelled", { userId, metadata: { appointmentId } });
  return { ok: true, message: "Your appointment has been cancelled." };
}

/** Reschedules an existing booking to a new slot. */
export async function rescheduleBooking(
  userId: string,
  appointmentId: string,
  scheduledTime: string
): Promise<{ ok: boolean; message: string }> {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, userId },
    select: { id: true, openbayAppointmentId: true, status: true },
  });

  if (!appointment) {
    return { ok: false, message: "We could not find that appointment on your account." };
  }
  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    return {
      ok: false,
      message: "That appointment can no longer be changed. Please book a new one.",
    };
  }

  if (appointment.openbayAppointmentId) {
    try {
      await getPlatformClient().rescheduleAppointment(
        Number(appointment.openbayAppointmentId),
        scheduledTime
      );
    } catch (err) {
      console.error("[Booking] upstream reschedule failed", {
        appointmentId,
        err: String(err),
      });
      return {
        ok: false,
        message:
          "The facility's scheduling system did not accept that time. Please choose another slot.",
      };
    }
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { scheduledAt: new Date(scheduledTime), status: "CONFIRMED" },
  });

  await trackFunnelEvent("booking_rescheduled", {
    userId,
    metadata: { appointmentId, scheduledTime },
  });
  return { ok: true, message: "Your appointment has been rescheduled." };
}

/**
 * Real availability for a facility. Returns an empty array rather than throwing
 * so the comparison grid can degrade to "call for availability" honestly.
 */
export async function getFacilityAvailability(
  facilitySlug: string,
  numberOfDays = 14
): Promise<PlatformAppointmentSlot[]> {
  try {
    const slots = await getPlatformClient().getLocationSlots(facilitySlug, numberOfDays);
    return Array.isArray(slots) ? slots : [];
  } catch (err) {
    console.error("[Booking] availability lookup failed", {
      facilitySlug,
      err: String(err),
    });
    return [];
  }
}
