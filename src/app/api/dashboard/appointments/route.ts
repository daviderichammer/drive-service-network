/**
 * GET /api/dashboard/appointments — the member's appointments
 *
 * Fields are selected explicitly rather than spread with `include`, so the
 * Openbay identifiers stored on the row never reach the browser. Drive Service
 * Network is the customer-facing brand and the infrastructure behind it is not
 * the member's concern (BUILD Absolute Rule 1).
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Membership required" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        serviceType: true,
        serviceDescription: true,
        shopName: true,
        shopAddress: true,
        shopCity: true,
        shopState: true,
        scheduledAt: true,
        completedAt: true,
        status: true,
        quotedPriceCents: true,
        finalPriceCents: true,
        dsnPlusSavingsCents: true,
        createdAt: true,
        vehicle: {
          select: { year: true, make: true, model: true, nickname: true },
        },
      },
      // Upcoming work first; appointments without a scheduled time fall back to
      // when they were created.
      orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
      take: 100,
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("[Appointments] list failed:", error);
    return NextResponse.json(
      { error: "We could not load your appointments." },
      { status: 500 }
    );
  }
}
