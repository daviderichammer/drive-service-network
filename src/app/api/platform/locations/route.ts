/**
 * GET /api/platform/locations?zipcode=02138&radius=20
 *
 * Nationwide repair-facility coverage lookup. Presented under DSN branding
 * only — Openbay is never named to the member (BUILD section 5).
 *
 * NOTE: the Platform API documents that serviceIds and vehicleMake on
 * /locations/v2/search are "reserved and echoed but do not filter results", and
 * the per-location capability endpoint currently times out upstream
 * (FLAGS F-5). No capability filtering is attempted here.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPlatformClient, safePlatformCall } from "@/lib/platform";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const zipcode = request.nextUrl.searchParams.get("zipcode");
  if (!zipcode || !/^\d{5}$/.test(zipcode)) {
    return NextResponse.json(
      { error: "Please provide a valid five-digit ZIP code." },
      { status: 400 }
    );
  }

  const radiusRaw = Number(request.nextUrl.searchParams.get("radius") ?? 20);
  const radius = Number.isFinite(radiusRaw) ? Math.min(Math.max(radiusRaw, 1), 100) : 20;

  const client = getPlatformClient();
  const { data, error, status } = await safePlatformCall(() =>
    client.searchLocations(zipcode, radius)
  );

  if (error) {
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data });
}
