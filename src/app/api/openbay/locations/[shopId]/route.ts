/**
 * GET /api/openbay/locations/[shopId]
 * Proxy: GET /partners/v2/partner-locations/{shopId}
 *
 * Returns details for a specific shop.
 * API key is NEVER exposed to the client.
 */
import { NextRequest, NextResponse } from "next/server";
import { getOpenbayClient, safeOpenbayCall } from "@/lib/openbay";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  const { shopId } = await params;

  if (!shopId) {
    return NextResponse.json({ error: "shopId is required" }, { status: 400 });
  }

  const client = getOpenbayClient();
  const { data, error } = await safeOpenbayCall(
    () => client.getLocationDetails(shopId),
    null
  );

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to fetch shop details", message: error || "Shop not found" },
      { status: 503 }
    );
  }

  return NextResponse.json({ shop: data });
}
