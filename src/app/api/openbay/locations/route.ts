/**
 * GET /api/openbay/locations?zip=33101&radius=25&serviceType=appointment
 * Proxy: GET /partners/v2/partner-locations
 *
 * Searches for auto repair shops near a given ZIP code.
 * API key is NEVER exposed to the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { getOpenbayClient, safeOpenbayCall } from "@/lib/openbay";
import { z } from "zod";

export const dynamic = "force-dynamic";

const searchSchema = z.object({
  zip: z.string().min(5).max(10),
  radius: z.coerce.number().min(1).max(100).optional().default(25),
  serviceType: z.enum(["appointment", "oil_change"]).optional().default("appointment"),
  make: z.string().optional(),
  serviceId: z.coerce.number().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const parseResult = searchSchema.safeParse({
    zip: searchParams.get("zip"),
    radius: searchParams.get("radius"),
    serviceType: searchParams.get("serviceType"),
    make: searchParams.get("make"),
    serviceId: searchParams.get("serviceId"),
  });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Invalid search parameters",
        details: parseResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  const params = parseResult.data;
  const client = getOpenbayClient();

  const { data, error } = await safeOpenbayCall(
    () =>
      client.searchLocations({
        zipCode: params.zip,
        radius: params.radius,
        serviceType: params.serviceType,
        vehicleMake: params.make,
        serviceId: params.serviceId,
      }),
    []
  );

  if (error) {
    return NextResponse.json(
      { error: "Failed to search locations", message: error },
      { status: 503 }
    );
  }

  return NextResponse.json({ locations: data, count: Array.isArray(data) ? data.length : 0 });
}
