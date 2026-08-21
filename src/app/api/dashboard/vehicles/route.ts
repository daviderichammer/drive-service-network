/**
 * GET  /api/dashboard/vehicles — the member's registered fleet
 * POST /api/dashboard/vehicles — register a vehicle
 *
 * REVAMP BUILD section 9. Vehicles exist only inside a membership, so both
 * verbs require an authenticated DSN session.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addVehicle } from "@/lib/vehicles/service";
import { trackFunnelEvent } from "@/lib/membership/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session.user.id, status: { not: "REMOVED" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      year: true,
      make: true,
      model: true,
      color: true,
      engine: true,
      vin: true,
      licensePlate: true,
      trim: true,
      mileage: true,
      nickname: true,
      zipCode: true,
      status: true,
      programStatus: true,
      openbayVehicleId: true,
      createdAt: true,
    },
  });

  // DSN is the customer-facing brand: report only whether the vehicle reached
  // the service network, never the Openbay identifier itself.
  return NextResponse.json({
    vehicles: vehicles.map(({ openbayVehicleId, ...v }) => ({
      ...v,
      openbayLinked: Boolean(openbayVehicleId),
    })),
  });
}

const currentYear = new Date().getFullYear();

const vehicleSchema = z.object({
  year: z
    .number()
    .int()
    .min(1900, "Please select a model year")
    .max(currentYear + 2),
  make: z.string().min(1, "Make is required").max(80),
  model: z.string().min(1, "Model is required").max(120),
  // BUILD section 9 requires colour and engine; neither exists in the Platform
  // API vehicle model, so DSN stores them itself (FLAGS F-4).
  color: z.string().max(60).optional(),
  engine: z.string().max(120).optional(),
  vin: z.string().max(17).optional().or(z.literal("")),
  licensePlate: z.string().max(15).optional().or(z.literal("")),
  trim: z.string().max(160).optional(),
  mileage: z.number().int().min(0).max(2_000_000).optional(),
  nickname: z.string().max(80).optional(),
  zipCode: z.string().regex(/^\d{5}$/, "A five-digit ZIP code is required"),
  openbayStyleTrimId: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validation = vehicleSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Please check the highlighted fields.",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const input = validation.data;
  const result = await addVehicle(session.user.id, {
    ...input,
    vin: input.vin || undefined,
    licensePlate: input.licensePlate || undefined,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const isFirst =
    (await prisma.vehicle.count({
      where: { userId: session.user.id, status: { not: "REMOVED" } },
    })) === 1;

  await trackFunnelEvent(isFirst ? "first_vehicle_added" : "vehicle_added", {
    userId: session.user.id,
  });

  const record = await prisma.vehicle.findUnique({ where: { id: result.id } });
  const vehicle = record
    ? {
        ...record,
        openbayVehicleId: undefined,
        openbayLinked: Boolean(record.openbayVehicleId),
      }
    : null;

  return NextResponse.json({ vehicle, isFirstVehicle: isFirst }, { status: 201 });
}
