import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { userId: session.user.id, status: { not: "SOLD" } },
      include: {
        appointments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { serviceType: true, completedAt: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

const vehicleSchema = z.object({
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  trim: z.string().optional(),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  color: z.string().optional(),
  mileage: z.number().int().optional(),
  nickname: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = vehicleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        ...validation.data,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
