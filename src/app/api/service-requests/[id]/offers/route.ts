/**
 * GET /api/service-requests/:id/offers — poll real facility estimates.
 *
 * The route only exposes offers for a request owned by the signed-in DSN member.
 * It refreshes the upstream request state, retrieves facility offers, applies the
 * DSN+ programme's 10% presentation calculation to each real offer total, and
 * enriches the result with the booking slug required by the existing scheduler.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyMemberDiscount } from "@/lib/dsn-plus/discount";
import { getPlatformClient, memberFacingError } from "@/lib/platform";

export const dynamic = "force-dynamic";

const POLL_AFTER_MS = 2_500;

type RouteContext = { params: Promise<{ id: string }> };

function toDsnStatus(state?: string):
  | "DRAFT"
  | "OPEN_FOR_OFFERS"
  | "ACCEPTED"
  | "SETTLED"
  | "EXPIRED"
  | "WITHDRAWN" {
  switch (state?.toLowerCase()) {
    case "accepted":
      return "ACCEPTED";
    case "settled":
      return "SETTLED";
    case "expired":
      return "EXPIRED";
    case "withdrawn":
      return "WITHDRAWN";
    case "open_for_offers":
    default:
      return "OPEN_FOR_OFFERS";
  }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to view facility estimates." }, { status: 401 });
  }

  const { id } = await context.params;
  const serviceRequest = await prisma.serviceRequest.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      openbayServiceRequestId: true,
      status: true,
      vehicleId: true,
      vehicle: { select: { openbayStyleId: true } },
    },
  });

  if (!serviceRequest) {
    return NextResponse.json({ error: "We could not find that pricing request." }, { status: 404 });
  }

  if (!serviceRequest.openbayServiceRequestId) {
    if (!serviceRequest.vehicle.openbayStyleId) {
      return NextResponse.json(
        {
          id: serviceRequest.id,
          status: serviceRequest.status,
          ready: false,
          offers: [],
          retryable: false,
          code: "VEHICLE_TRIM_REQUIRED",
          repairVehicleId: serviceRequest.vehicleId,
          repairUrl: "/dashboard/vehicles",
          error:
            "Confirm this vehicle's trim before requesting quotes so facilities can match the correct parts and labor.",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        id: serviceRequest.id,
        status: serviceRequest.status,
        ready: false,
        offers: [],
        retryable: true,
        error:
          "Your request is still being prepared for facility estimates. Please try again in a moment.",
      },
      { status: 409, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const client = getPlatformClient();
    const upstreamRequest = await client.getServiceRequest(
      Number(serviceRequest.openbayServiceRequestId)
    );
    const upstreamOffers = await client.getOffers(Number(serviceRequest.openbayServiceRequestId));
    const offers = Array.isArray(upstreamOffers) ? upstreamOffers : [];

    const detailsByLocation = new Map(
      await Promise.all(
        offers.map(async (offer) => {
          try {
            const detail = await client.getLocation(offer.locationId);
            return [offer.locationId, detail] as const;
          } catch {
            return [offer.locationId, null] as const;
          }
        })
      )
    );

    const status = toDsnStatus(upstreamRequest.serviceRequestState);
    await prisma.serviceRequest.update({
      where: { id: serviceRequest.id },
      data: {
        status,
        openbayPublicId: upstreamRequest.openbayId || undefined,
      },
    });

    const pricedOffers = offers
      .filter(
        (offer) =>
          Number.isFinite(offer.totalPriceCents) &&
          offer.totalPriceCents > 0 &&
          Number.isFinite(offer.locationId)
      )
      .map((offer) => {
        const detail = detailsByLocation.get(offer.locationId) ?? null;
        const pricing = applyMemberDiscount(offer.totalPriceCents);
        return {
          offerId: offer.id,
          locationId: offer.locationId,
          serviceRequestId: offer.serviceRequestId,
          businessName: offer.businessName || detail?.name || "Service facility",
          city: offer.city || detail?.city || "",
          state: offer.state || detail?.state || "",
          distanceMiles: offer.distanceMiles ?? null,
          rating: offer.rating ?? detail?.internal_rating_average ?? null,
          reviewCount: offer.reviewCount ?? detail?.internal_rating_count ?? null,
          currency: offer.currency || "USD",
          standardPriceCents: pricing.standardCents,
          dsnPlusPriceCents: pricing.memberCents,
          dsnPlusSavingsCents: pricing.savingsCents,
          facility: detail
            ? {
                slug: detail.openbay_id,
                name: detail.name,
                address:
                  [detail.address_1, detail.address_2].filter(Boolean).join(" ").trim() || "",
                city: detail.city,
                state: detail.state,
                zipcode: detail.zipcode,
                phone: detail.phone_number ?? null,
                mobileMechanic: detail.mobile_mechanic ?? false,
                amenities: detail.amenities ?? [],
                certifications: detail.certifications ?? [],
                customerPerks: detail.customer_perks ?? [],
                warrantyOverview:
                  detail.warranty_overview || detail.national_warranty_overview || null,
              }
            : null,
        };
      })
      .sort(
        (a, b) =>
          (a.standardPriceCents ?? Number.MAX_SAFE_INTEGER) -
          (b.standardPriceCents ?? Number.MAX_SAFE_INTEGER)
      );

    return NextResponse.json(
      {
        id: serviceRequest.id,
        openbayServiceRequestId: serviceRequest.openbayServiceRequestId,
        status,
        ready: pricedOffers.length > 0,
        hasOffers: Boolean(upstreamRequest.hasOffers) || pricedOffers.length > 0,
        pollAfterMs: pricedOffers.length > 0 ? null : POLL_AFTER_MS,
        offers: pricedOffers,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const mapped = memberFacingError(error);
    console.error("[ServiceRequestOffers] Platform API polling failed", {
      serviceRequestId: serviceRequest.id,
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: mapped.message, retryable: true },
      { status: mapped.status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
