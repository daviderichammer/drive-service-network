/**
 * GET /api/platform/availability?slug=m8-3ww&days=14
 *
 * Real bookable availability for a facility, grouped by calendar day.
 *
 * The Platform API keys availability on the facility's public `openbay_id`
 * slug. Callers holding only the numeric locations/v2 id may pass
 * `?locationId=` instead and the slug is resolved first.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPlatformClient,
  groupSlotsByDay,
  memberFacingError,
  resolveLocationSlug,
} from "@/lib/platform";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Create your free Drive Service Network membership to see availability." },
      { status: 401 }
    );
  }

  const params = request.nextUrl.searchParams;
  let slug = params.get("slug");
  const locationIdParam = params.get("locationId");

  if (!slug && locationIdParam) {
    const numeric = Number(locationIdParam);
    if (Number.isFinite(numeric) && numeric > 0) {
      slug = await resolveLocationSlug(numeric);
    }
  }

  if (!slug) {
    return NextResponse.json(
      { error: "We could not identify that service facility." },
      { status: 400 }
    );
  }

  const daysRaw = Number(params.get("days") ?? 14);
  const days = Number.isFinite(daysRaw) ? Math.min(Math.max(daysRaw, 1), 14) : 14;

  try {
    const slots = await getPlatformClient().getLocationSlots(slug, days);
    const list = Array.isArray(slots) ? slots : [];
    return NextResponse.json({
      slug,
      days: groupSlotsByDay(list),
      totalSlots: list.length,
    });
  } catch (err) {
    const mapped = memberFacingError(err);
    // An unavailable scheduling feed is a soft failure: the member is offered
    // the facility's phone number rather than a dead end.
    return NextResponse.json(
      { slug, days: [], totalSlots: 0, error: mapped.message },
      { status: 200 }
    );
  }
}
