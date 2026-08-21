/**
 * GET   /api/recalls — open safety recalls across the member's fleet
 * PATCH /api/recalls — acknowledge a recall
 *
 * Priority 4, BUILD section 24. Sourced from NHTSA because the Platform API has
 * no recall data; see lib/recalls/service for the reasoning and the caching
 * behaviour.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { acknowledgeRecall, getVehicleRecalls } from "@/lib/recalls/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }

  const vehicleIdParam = request.nextUrl.searchParams.get("vehicleId");
  const force = request.nextUrl.searchParams.get("refresh") === "1";

  const vehicles = await prisma.vehicle.findMany({
    where: {
      userId: session.user.id,
      status: { not: "REMOVED" },
      ...(vehicleIdParam ? { id: vehicleIdParam } : {}),
    },
    select: { id: true, year: true, make: true, model: true, nickname: true },
  });

  const results = await Promise.all(
    vehicles.map(async (vehicle) => {
      const { recalls, checkedAt, stale } = await getVehicleRecalls(vehicle.id, {
        force,
      });
      return {
        vehicle,
        checkedAt,
        stale,
        recalls: recalls.map((r) => ({
          id: r.id,
          campaignNumber: r.campaignNumber,
          component: r.component,
          summary: r.summary,
          consequence: r.consequence,
          remedy: r.remedy,
          manufacturer: r.manufacturer,
          reportReceivedDate: r.reportReceivedDate,
          acknowledgedAt: r.acknowledgedAt,
        })),
      };
    })
  );

  const openCount = results.reduce(
    (sum, entry) => sum + entry.recalls.filter((r) => !r.acknowledgedAt).length,
    0
  );

  return NextResponse.json({ results, openCount });
}

const ackSchema = z.object({ recallId: z.string().min(1) });

export async function PATCH(request: NextRequest) {
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

  const parsed = ackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await acknowledgeRecall(session.user.id, parsed.data.recallId);
  if (!result.ok) {
    return NextResponse.json({ error: "Recall not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
