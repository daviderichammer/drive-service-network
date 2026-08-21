/**
 * POST /api/service-requests — create a member-owned request for real facility estimates.
 *
 * The request is first recorded in DSN, then created through the Openbay Platform
 * API. The resulting Openbay id is used by the offers route to poll the network
 * for competitive facility estimates. DSN remains the system of record and never
 * exposes the upstream service outside the branded member experience.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertVehicleOwnership } from "@/lib/membership/gate";
import { ensureOpenbayDriver, trackFunnelEvent } from "@/lib/membership/service";
import { ensureOpenbayVehicle } from "@/lib/vehicles/service";
import {
  getPlatformClient,
  memberFacingError,
  PlatformApiRequestError,
} from "@/lib/platform";

export const dynamic = "force-dynamic";

const schema = z.object({
  vehicleId: z.string().min(1, "Please choose a vehicle"),
  serviceZipCode: z.string().regex(/^\d{5}$/, "A five-digit ZIP code is required"),
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
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Create your free Drive Service Network membership to request pricing." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
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

  // Preserve the member's request even when a legacy account needs upstream
  // linkage repaired before it can be sent for competitive estimates.
  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      userId: session.user.id,
      vehicleId: input.vehicleId,
      status: "DRAFT",
      serviceZipCode: input.serviceZipCode,
      requestedServices: input.services as unknown as object,
      interviewAnswers: input.services
        .flatMap((service) => service.interview ?? [])
        .filter(Boolean) as unknown as object,
      notes: input.notes || null,
    },
    select: { id: true },
  });

  await trackFunnelEvent("quote_requested", {
    userId: session.user.id,
    metadata: { vehicleId: input.vehicleId, serviceCount: input.services.length },
  });

  // New registrations already provision this identifier. The same helper
  // gracefully repairs older DSN accounts that predate the Openbay linkage.
  const openbayUserId = await ensureOpenbayDriver(session.user.id);
  if (!openbayUserId) {
    return NextResponse.json(
      {
        id: serviceRequest.id,
        status: "DRAFT",
        pricingStatus: "PREPARING_MEMBER",
        retryable: true,
        message:
          "We are preparing your member profile for facility estimates. Please check again in a moment.",
      },
      { status: 202 }
    );
  }

  // Older vehicles can also predate upstream mirroring. Recreate the upstream
  // vehicle where DSN has sufficient VIN or catalog information; never fail the
  // local membership or booking record when that repair needs member attention.
  const openbayVehicleId = await ensureOpenbayVehicle(
    session.user.id,
    input.vehicleId,
    input.serviceZipCode
  );
  if (!openbayVehicleId) {
    return NextResponse.json(
      {
        id: serviceRequest.id,
        status: "DRAFT",
        pricingStatus: "PREPARING_VEHICLE",
        retryable: true,
        message:
          "We are preparing this vehicle for facility estimates. Please confirm its VIN or vehicle details and check again in a moment.",
      },
      { status: 202 }
    );
  }

  try {
    const created = await getPlatformClient().createServiceRequest({
      userId: Number(openbayUserId),
      ownedVehicleId: Number(openbayVehicleId),
      zipcode: input.serviceZipCode,
      services: input.services.map((service) => ({
        serviceId: service.serviceId,
        interview: service.interview,
      })),
      notes: input.notes,
    });

    await prisma.serviceRequest.update({
      where: { id: serviceRequest.id },
      data: {
        openbayServiceRequestId: String(created.id),
        status: "OPEN_FOR_OFFERS",
      },
    });

    return NextResponse.json(
      {
        id: serviceRequest.id,
        status: "OPEN_FOR_OFFERS",
        pricingStatus: "COLLECTING_OFFERS",
        automatedEstimatesAvailable: true,
        message: "We are collecting competitive estimates from nearby service facilities.",
      },
      { status: 201 }
    );
  } catch (error) {
    const mapped = memberFacingError(error);
    const entitlementBlocked =
      error instanceof PlatformApiRequestError && error.entitlement;
    console.error("[ServiceRequest] Platform API creation failed", {
      serviceRequestId: serviceRequest.id,
      entitlementBlocked,
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        id: serviceRequest.id,
        status: "DRAFT",
        retryable: true,
        error: mapped.message,
      },
      { status: mapped.status }
    );
  }
}
