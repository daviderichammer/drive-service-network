/**
 * GET /api/openbay/services
 * Proxy: GET /partners/v2/partner-api/services
 *
 * Returns the full Openbay service catalog.
 * API key is NEVER exposed to the client.
 */

import { NextResponse } from "next/server";
import { getOpenbayClient, safeOpenbayCall } from "@/lib/openbay";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const client = getOpenbayClient();

  const { data, error } = await safeOpenbayCall(
    () => client.getServices(),
    []
  );

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch services", message: error },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { services: data, count: data.length },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
