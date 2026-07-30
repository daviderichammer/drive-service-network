/**
 * POST /api/openbay/timeslots
 * Proxy: POST /partners/v2/partner-locations/{shopId}/time-slots
 *
 * Returns available timeslots for a shop and service.
 * API key is NEVER exposed to the client.
 */
import { NextRequest, NextResponse } from "next/server";
import { getOpenbayClient, safeOpenbayCall } from "@/lib/openbay";
import { z } from "zod";

export const dynamic = "force-dynamic";

const timeslotSchema = z.object({
  shopId: z.string().min(1),
  serviceId: z.coerce.number().int().positive(),
  date: z.string().optional(),
  numberOfDays: z.coerce.number().int().min(1).max(30).optional().default(7),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = timeslotSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { shopId, serviceId, date, numberOfDays } = parseResult.data;
  const client = getOpenbayClient();

  const { data, error } = await safeOpenbayCall(
    () => client.getTimeslots(shopId, serviceId, date, numberOfDays),
    []
  );

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch timeslots", message: error },
      { status: 503 }
    );
  }

  return NextResponse.json({ timeslots: data, count: Array.isArray(data) ? data.length : 0 });
}
