/**
 * GET    /api/dashboard/vehicles/[id] — vehicle profile
 * PATCH  /api/dashboard/vehicles/[id] — update vehicle profile
 * DELETE /api/dashboard/vehicles/[id] — remove vehicle (non-destructive)
 *
 * BUILD section K: removal never destroys history. BUILD "Removing / replacing
 * vehicles": an active DSN+ enrolment on a removed vehicle is NOT automatically
 * cancelled, refunded or transferred — that rule is flagged for David.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeVehicle, updateVehicle } from "@/lib/vehicles/service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }
  const { id } = await context.params;

  const vehicle = await prisma.vehicle.findFirst({
    where: { id, userId: session.user.id },
    include: {
      enrollments: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      repairHistory: {
        orderBy: { serviceDate: "desc" },
        take: 20,
      },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  }

  return NextResponse.json({ vehicle });
}

const updateSchema = z.object({
  color: z.string().max(60).optional(),
  engine: z.string().max(120).optional(),
  licensePlate: z.string().max(15).optional().or(z.literal("")),
  mileage: z.number().int().min(0).max(2_000_000).optional(),
  nickname: z.string().max(80).optional(),
  zipCode: z.string().regex(/^\d{5}$/).optional(),
  vin: z.string().max(17).optional().or(z.literal("")),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validation = updateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Please check the highlighted fields.",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const result = await updateVehicle(session.user.id, id, {
    ...validation.data,
    vin: validation.data.vin || undefined,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  return NextResponse.json({ vehicle });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }
  const { id } = await context.params;

  const result = await removeVehicle(session.user.id, id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    // The dashboard surfaces this so the member is told to contact DSN rather
    // than DSN silently voiding or refunding a paid enrolment.
    enrollmentRequiresReview: result.enrollmentRequiresReview,
  });
}
