/**
 * POST /api/service-requests — record a member's request for pricing.
 *
 * BUILD Absolute Rules 1 and 2 are enforced through the membership gate: the
 * caller must be a member, and the vehicle must belong to them.
 *
 * The request is attempted against the Platform API first. Partner 116 is
 * currently not entitled to service-request generation (FLAG F-1), so the
 * request is persisted in DSN's database and marked DRAFT for the DSN team to
 * action. No pricing, availability or facility estimate is ever fabricated
 * (BUILD sections G and I).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertVehicleOwnership } from "@/lib/membership/gate";
import { trackFunnelEvent } from "@/lib/membership/service";
import { getPlatformClient, PlatformApiRequestError } from "@/lib/platform";

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
  preferredLocationId: z.number().int().positive().optional(),
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

  // BUILD Absolute Rule 2.
  const ownership = await assertVehicleOwnership(session.user.id, input.vehicleId);
  if (!ownership.ok) {
    return NextResponse.json({ error: ownership.message }, { status: 403 });
  }

  const [user, vehicle] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { openbayUserId: true },
    }),
    prisma.vehicle.findUnique({
      where: { id: input.vehicleId },
      select: { openbayVehicleId: true },
    }),
  ]);

  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      userId: session.user.id,
      vehicleId: input.vehicleId,
      status: "DRAFT",
      serviceZipCode: input.serviceZipCode,
      requestedServices: input.services as unknown as object,
      interviewAnswers: input.services
        .flatMap((s) => s.interview ?? [])
        .filter(Boolean) as unknown as object,
      notes: input.notes || null,
    },
    select: { id: true },
  });

  await trackFunnelEvent("quote_requested", {
    userId: session.user.id,
    metadata: { vehicleId: input.vehicleId, serviceCount: input.services.length },
  });

  // Attempt the Platform API path. Expected to fail with 403 until Openbay
  // grants the entitlement; the DSN record above is authoritative either way.
  if (user?.openbayUserId && vehicle?.openbayVehicleId) {
    try {
      const created = await getPlatformClient().createServiceRequest({
        userId: Number(user.openbayUserId),
        ownedVehicleId: Number(vehicle.openbayVehicleId),
        zipcode: input.serviceZipCode,
        services: input.services.map((s) => ({
          serviceId: s.serviceId,
          interview: s.interview,
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
          message: "We are collecting estimates from service facilities near you.",
        },
        { status: 201 }
      );
    } catch (err) {
      const entitlementBlocked =
        err instanceof PlatformApiRequestError && err.entitlement;
      console.error("[ServiceRequest] Platform API creation unavailable", {
        serviceRequestId: serviceRequest.id,
        entitlementBlocked,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json(
    {
      id: serviceRequest.id,
      status: "DRAFT",
      message:
        "Your request has been received. A Drive Service Network representative will follow up with pricing.",
      // Signals to the UI that automated estimates are not yet available.
      automatedEstimatesAvailable: false,
    },
    { status: 201 }
  );
}
