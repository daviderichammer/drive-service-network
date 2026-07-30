import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    await prisma.vehicle.update({
      where: { id },
      data: { status: "SOLD" },
    });

    return NextResponse.json({ message: "Vehicle removed" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json({ error: "Failed to remove vehicle" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        mileage: body.mileage,
        nickname: body.nickname,
        color: body.color,
        licensePlate: body.licensePlate,
      },
    });

    return NextResponse.json({ vehicle: updated });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}
