/**
 * POST /api/openbay/appointments — Book an appointment
 * GET  /api/openbay/appointments?userId=xxx — List appointments for a user
 *
 * Proxy: POST /partners/v2/partner-api/appointments
 * API key is NEVER exposed to the client.
 */
import { NextRequest, NextResponse } from "next/server";
import { getOpenbayClient, safeOpenbayCall } from "@/lib/openbay";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bookSchema = z.object({
  userId: z.string().min(1),
  shopId: z.string().min(1),
  serviceId: z.coerce.number().int().positive(),
  timeslotId: z.string().min(1),
  scheduledTime: z.string().optional(),
  vehicleId: z.string().optional(),
  vehicleYear: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleMileage: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = bookSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid booking parameters", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const client = getOpenbayClient();
  const { data, error } = await safeOpenbayCall(
    () => client.bookAppointment(parseResult.data),
    null
  );

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to book appointment", message: error || "Unknown error" },
      { status: 503 }
    );
  }

  return NextResponse.json({ appointment: data, success: true });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || undefined;

  const client = getOpenbayClient();
  const { data, error } = await safeOpenbayCall(
    () => client.getAppointments(userId),
    []
  );

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch appointments", message: error },
      { status: 503 }
    );
  }

  return NextResponse.json({ appointments: data, count: Array.isArray(data) ? data.length : 0 });
}
