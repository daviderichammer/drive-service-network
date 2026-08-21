/**
 * GET /api/platform/facilities/{id}
 *
 * The "View Details" surface required by Priority 2. Returns the full facility
 * profile — hours, amenities, certifications, perks, warranty, languages,
 * transportation options and the services the facility actually performs —
 * together with its public slug so the caller can immediately request
 * availability.
 *
 * Openbay is never named. All copy is presented as Drive Service Network
 * network information (BUILD section 5).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlatformClient, memberFacingError } from "@/lib/platform";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Create your free Drive Service Network membership to view facility details." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const locationId = Number(id);
  if (!Number.isFinite(locationId) || locationId <= 0) {
    return NextResponse.json({ error: "Unknown facility." }, { status: 400 });
  }

  const client = getPlatformClient();

  try {
    const detail = await client.getLocation(locationId);

    // Availability is fetched alongside the profile so "View Details" can show
    // the next real openings without a second round-trip.
    let slots: Array<{ day: string; key: string; slotTitle: string; proposedTime?: string; fullSlotTitle?: string }> = [];
    if (detail.openbay_id) {
      try {
        const raw = await client.getLocationSlots(detail.openbay_id, 14);
        slots = Array.isArray(raw) ? raw : [];
      } catch {
        slots = [];
      }
    }

    return NextResponse.json({
      facility: {
        locationId: detail.id,
        slug: detail.openbay_id,
        name: detail.name,
        about: detail.about_us || detail.national_about_us || null,
        address: [detail.address_1, detail.address_2].filter(Boolean).join(" ").trim(),
        city: detail.city,
        state: detail.state,
        zipcode: detail.zipcode,
        lat: detail.lat,
        lon: detail.lon,
        phone: detail.phone_number ?? null,
        timezone: detail.timezone ?? null,
        mobileMechanic: detail.mobile_mechanic ?? false,
        rating: detail.internal_rating_average ?? null,
        reviewCount: detail.internal_rating_count ?? null,
        amenities: detail.amenities ?? [],
        certifications: detail.certifications ?? [],
        businessHighlights: detail.business_highlights ?? [],
        discounts: detail.discounts ?? [],
        transportation: detail.transportation ?? [],
        languages: detail.languages ?? [],
        customerPerks: detail.customer_perks ?? [],
        topServices: detail.top_services ?? [],
        serviceIds: detail.service_ids ?? [],
        warrantyOverview:
          detail.warranty_overview || detail.national_warranty_overview || null,
        hours: {
          monday: detail.monday ?? null,
          tuesday: detail.tuesday ?? null,
          wednesday: detail.wednesday ?? null,
          thursday: detail.thursday ?? null,
          friday: detail.friday ?? null,
          saturday: detail.saturday ?? null,
          sunday: detail.sunday ?? null,
        },
      },
      availability: slots,
      /** No published review-text endpoint resolves for these ids (FLAG F-5). */
      reviewsAvailable: false,
    });
  } catch (err) {
    const mapped = memberFacingError(err);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
