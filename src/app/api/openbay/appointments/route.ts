/**
 * POST /api/openbay/appointments — Book an appointment
 * GET  /api/openbay/appointments?userId=xxx — List appointments for a user
 *
 * Proxy: POST /partners/v2/partner-api/appointments
 * API key is NEVER exposed to the client.
 *
 * Phase 3 update: For logged-in DSN subscribers, also save the appointment
 * to the local Prisma database for dashboard history.
 */
import { NextRequest, NextResponse } from "next/server";
import { getOpenbayClient, safeOpenbayCall } from "@/lib/openbay";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  // Additional context for Prisma record
  serviceName: z.string().optional(),
  shopName: z.string().optional(),
  shopAddress: z.string().optional(),
  shopPhone: z.string().optional(),
  shopZipCode: z.string().optional(),
  scheduledDate: z.string().optional(),
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

  // For logged-in members, save appointment to Prisma dashboard
  const session = await auth();
  if (session?.user?.id) {
    try {
      const {
        serviceName,
        shopName,
        shopAddress,
        shopPhone,
        shopZipCode,
        vehicleYear,
        vehicleMake,
        vehicleModel,
        scheduledDate,
        scheduledTime,
        notes,
        shopId,
        serviceId,
        timeslotId,
      } = parseResult.data;

      await prisma.appointment.create({
        data: {
          userId: session.user.id,
          serviceType: serviceName || `Service #${serviceId}`,
          shopName: shopName || null,
          shopAddress: shopAddress || null,
          shopPhone: shopPhone || null,
          shopZipCode: shopZipCode || null,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          scheduledTime: scheduledTime || null,
          customerNotes: notes || null,
          status: "CONFIRMED",
          openbayAppointmentId: data.id ? String(data.id) : null,
          openbayShopId: shopId,
          openbayServiceId: String(serviceId),
          openbayTimeslotId: timeslotId,
          // Store vehicle info in serviceDescription if no vehicleId
          serviceDescription: vehicleYear && vehicleMake && vehicleModel
            ? `${vehicleYear} ${vehicleMake} ${vehicleModel}`
            : null,
        },
      });
    } catch (err) {
      // Non-fatal: log but don't fail the booking
      console.error("Failed to save appointment to Prisma:", err);
    }
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
