/**
 * POST /api/bookings — create a real appointment (Priority 2).
 * GET  /api/bookings — the member's appointments (Priority 4).
 *
 * Both of the REVAMP BUILD's absolute rules are enforced server-side before
 * anything reaches the Platform API:
 *
 *   1. No booking without a FREE Drive Service Network membership.
 *   2. Every booking is associated with a vehicle in the member's profile.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertVehicleOwnership } from "@/lib/membership/gate";
import { createBooking } from "@/lib/booking/service";
import { getPlatformClient, memberFacingError } from "@/lib/platform";

export const dynamic = "force-dynamic";

const bookingSchema = z.object({
  vehicleId: z.string().min(1, "Please choose a vehicle"),
  facilitySlug: z.string().min(1, "Please choose a service facility"),
  facilityLocationId: z.number().int().positive().optional(),
  scheduledTime: z
    .string()
    .min(1, "Please choose an appointment time")
    // Offset-bearing ISO-8601, exactly as the availability feed returns it.
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?([+-]\d{2}:\d{2}|Z)$/,
      "That appointment time is not valid"
    ),
  services: z
    .array(
      z.object({
        serviceId: z.number().int().positive(),
        serviceName: z.string().optional(),
        interview: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
    )
    .min(1, "Please choose at least one service"),
  notes: z.string().max(2000).optional(),
  phone: z.string().max(32).optional(),
  /** Price is never trusted from the browser; it is verified from this offer. */
  serviceRequestId: z.string().min(1).optional(),
  openbayOfferId: z.number().int().positive().optional(),
  quotedPriceCents: z.number().int().nonnegative().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Create your free Drive Service Network membership to book service." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the highlighted fields.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const ownership = await assertVehicleOwnership(session.user.id, input.vehicleId);
  if (!ownership.ok) {
    return NextResponse.json({ error: ownership.message }, { status: 403 });
  }

  let verifiedPriceCents: number | null = null;
  let serviceRequestId: string | undefined;
  let openbayOfferId: string | undefined;

  // A real estimate must be verified server-side immediately before booking. The
  // caller may still use the established no-offer appointment path, but no price
  // value supplied by the browser is ever stored as a facility quote on its own.
  if (input.serviceRequestId || input.openbayOfferId) {
    if (!input.serviceRequestId || !input.openbayOfferId) {
      return NextResponse.json(
        { error: "Please choose a facility estimate before booking." },
        { status: 400 }
      );
    }

    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        id: input.serviceRequestId,
        userId: session.user.id,
        vehicleId: input.vehicleId,
      },
      select: { id: true, openbayServiceRequestId: true },
    });
    if (!serviceRequest?.openbayServiceRequestId) {
      return NextResponse.json(
        { error: "This facility estimate is not ready to book yet. Please refresh estimates." },
        { status: 409 }
      );
    }

    try {
      const offers = await getPlatformClient().getOffers(
        Number(serviceRequest.openbayServiceRequestId)
      );
      const offer = Array.isArray(offers)
        ? offers.find(
            (candidate) =>
              candidate.id === input.openbayOfferId &&
              (!input.facilityLocationId || candidate.locationId === input.facilityLocationId)
          )
        : undefined;
      if (!offer || !Number.isFinite(offer.totalPriceCents) || offer.totalPriceCents <= 0) {
        return NextResponse.json(
          { error: "That facility estimate is no longer available. Please refresh estimates." },
          { status: 409 }
        );
      }

      verifiedPriceCents = offer.totalPriceCents;
      serviceRequestId = serviceRequest.id;
      openbayOfferId = String(offer.id);
    } catch (error) {
      const mapped = memberFacingError(error);
      return NextResponse.json({ error: mapped.message }, { status: mapped.status });
    }
  }

  const result = await createBooking({
    userId: session.user.id,
    vehicleId: input.vehicleId,
    facilitySlug: input.facilitySlug,
    facilityLocationId: input.facilityLocationId,
    scheduledTime: input.scheduledTime,
    services: input.services,
    notes: input.notes,
    phone: input.phone,
    quotedPriceCents: verifiedPriceCents,
    serviceRequestId,
    openbayOfferId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      appointmentId: result.appointmentId,
      status: result.status,
      confirmed: result.confirmed,
      message: result.message,
      pendingManualConfirmation: result.pendingManualConfirmation ?? false,
    },
    { status: 201 }
  );
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { userId: session.user.id },
    orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      serviceType: true,
      scheduledAt: true,
      completedAt: true,
      status: true,
      shopName: true,
      shopAddress: true,
      shopCity: true,
      shopState: true,
      shopZipCode: true,
      shopPhone: true,
      shopRating: true,
      quotedPriceCents: true,
      finalPriceCents: true,
      dsnPlusSavingsCents: true,
      customerNotes: true,
      createdAt: true,
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          nickname: true,
          licensePlate: true,
          programStatus: true,
        },
      },
    },
  });

  return NextResponse.json({ appointments });
}
