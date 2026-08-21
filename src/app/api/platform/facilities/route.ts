/**
 * GET /api/platform/facilities?zipcode=02138&radius=25&serviceIds=65,310
 *
 * Facility comparison for Priority 2. Returns the real, verifiable attributes
 * Drive Service Network can obtain from the Platform API for each nearby
 * facility, enriched with the public slug required to check availability and
 * book.
 *
 * FLAG F-1 remains in force: competitive priced OFFERS require a service
 * request, which Partner 116 is not entitled to create. No price is invented
 * here. What is returned — rating, review count, distance, amenities,
 * certifications, hours, warranty and the facility's own service list — is all
 * real Platform data.
 *
 * FLAG F-5: /locations/v2/{id}/capability times out upstream and the search
 * endpoint's serviceIds parameter is echoed without filtering. Capability is
 * therefore derived from the detail record's `service_ids`, which is reliable.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlatformClient, memberFacingError, metresToMiles } from "@/lib/platform";
import type { PlatformLocationDetail } from "@/lib/platform";

export const dynamic = "force-dynamic";

/** How many facilities to enrich with detail per request. */
const DETAIL_LIMIT = 12;

export interface FacilityCard {
  locationId: number;
  slug: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  distanceMiles: number | null;
  rating: number | null;
  reviewCount: number | null;
  logoUrl: string | null;
  mobileMechanic: boolean;
  phone: string | null;
  amenities: string[];
  certifications: string[];
  customerPerks: string[];
  topServices: string[];
  warrantyOverview: string | null;
  hours: Record<string, { open: string | null; close: string | null }> | null;
  /** True when the facility's own service list covers every requested service. */
  performsRequestedServices: boolean | null;
  detailLoaded: boolean;
}

function extractHours(detail: PlatformLocationDetail) {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const;
  const hours: Record<string, { open: string | null; close: string | null }> = {};
  let any = false;
  for (const day of days) {
    const value = detail[day];
    if (value) {
      hours[day] = { open: value.open ?? null, close: value.close ?? null };
      any = true;
    }
  }
  return any ? hours : null;
}

export async function GET(request: NextRequest) {
  // BUILD Absolute Rule 1 — facility pricing and comparison are member-only.
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error:
          "Create your free Drive Service Network membership to compare service facilities.",
      },
      { status: 401 }
    );
  }

  const params = request.nextUrl.searchParams;
  // Accept either spelling. The Platform API uses `zipcode` and most of the web
  // uses `zipCode`; a five-digit number is unambiguous either way, and failing
  // a member's search over letter case would be indefensible.
  const zipcode = params.get("zipcode") ?? params.get("zipCode");
  if (!zipcode || !/^\d{5}$/.test(zipcode)) {
    return NextResponse.json(
      { error: "Please provide a valid five-digit ZIP code." },
      { status: 400 }
    );
  }

  const radiusRaw = Number(params.get("radius") ?? 25);
  const radius = Number.isFinite(radiusRaw) ? Math.min(Math.max(radiusRaw, 1), 100) : 25;

  const requestedServiceIds = (params.get("serviceIds") ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  const client = getPlatformClient();

  let search;
  try {
    search = await client.searchLocations(zipcode, radius);
  } catch (err) {
    const mapped = memberFacingError(err);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }

  const locations = Array.isArray(search?.locations) ? search.locations : [];
  const ordered = [...locations].sort(
    (a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0)
  );

  // Enrich the nearest N with detail. Detail failures degrade to the search
  // record rather than removing the facility from the comparison.
  const detailTargets = ordered.slice(0, DETAIL_LIMIT);
  const details = await Promise.all(
    detailTargets.map(async (loc) => {
      try {
        return await client.getLocation(loc.id);
      } catch {
        return null;
      }
    })
  );

  const cards: FacilityCard[] = ordered.map((loc, index) => {
    const detail = index < details.length ? details[index] : null;

    let performsRequestedServices: boolean | null = null;
    if (detail && Array.isArray(detail.service_ids) && requestedServiceIds.length > 0) {
      const offered = new Set(detail.service_ids);
      performsRequestedServices = requestedServiceIds.every((id) => offered.has(id));
    }

    return {
      locationId: loc.id,
      // The slug is what the appointments API needs; prefer the detail record's
      // value and fall back to the search record's slug field.
      slug: detail?.openbay_id ?? loc.slug ?? "",
      name: detail?.name ?? loc.name,
      address:
        [detail?.address_1 ?? loc.address1, detail?.address_2 ?? loc.address2]
          .filter(Boolean)
          .join(" ")
          .trim() || "",
      city: detail?.city ?? loc.city,
      state: detail?.state ?? loc.state,
      zipcode: detail?.zipcode ?? loc.zipcode,
      distanceMiles:
        typeof loc.distanceMeters === "number" ? metresToMiles(loc.distanceMeters) : null,
      rating: detail?.internal_rating_average ?? loc.ratingAverage ?? null,
      reviewCount: detail?.internal_rating_count ?? loc.ratingCount ?? null,
      logoUrl: loc.logoUrl ?? null,
      mobileMechanic: detail?.mobile_mechanic ?? loc.doesHouseCalls ?? false,
      phone: detail?.phone_number ?? null,
      amenities: detail?.amenities ?? [],
      certifications: detail?.certifications ?? [],
      customerPerks: detail?.customer_perks ?? [],
      topServices: detail?.top_services ?? [],
      warrantyOverview: detail?.warranty_overview || detail?.national_warranty_overview || null,
      hours: detail ? extractHours(detail) : null,
      performsRequestedServices,
      detailLoaded: Boolean(detail),
    };
  });

  // Facilities confirmed to perform the requested work come first, then the
  // unknowns, then those confirmed not to. Distance breaks ties.
  const rank = (card: FacilityCard) =>
    card.performsRequestedServices === true
      ? 0
      : card.performsRequestedServices === null
        ? 1
        : 2;
  cards.sort((a, b) => rank(a) - rank(b) || (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999));

  return NextResponse.json({
    zipcode,
    radius,
    total: search.total ?? cards.length,
    centroid: search.centroid ?? null,
    facilities: cards,
    /**
     * Transparency for the UI: DSN cannot show competitive priced estimates
     * until Openbay grants the service-request entitlement (FLAG F-1).
     */
    pricingAvailable: false,
  });
}
