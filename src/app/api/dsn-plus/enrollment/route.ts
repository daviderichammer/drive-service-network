/**
 * GET  /api/dsn-plus/enrollment — membership status and per-vehicle enrolment
 * POST /api/dsn-plus/enrollment — request DSN+ enrolment for chosen vehicles
 *
 * Priority 3. Enrolment is per vehicle (BUILD "Discount eligibility must follow
 * the vehicle"), so the request carries vehicle identifiers and never a bare
 * "upgrade me" instruction.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembershipSnapshot, requestEnrollment } from "@/lib/dsn-plus/enrollment";
import { quoteAllPlans } from "@/lib/dsn-plus/pricing";
import { DSN_PLUS_DISCOUNT_LABEL, DSN_PLUS_DISCOUNT_RATE } from "@/lib/dsn-plus/discount";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }

  const [snapshot, vehicles] = await Promise.all([
    getMembershipSnapshot(session.user.id),
    prisma.vehicle.findMany({
      where: { userId: session.user.id, status: { not: "REMOVED" } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        nickname: true,
        licensePlate: true,
        programStatus: true,
        enrollments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            plan: true,
            enrollmentDate: true,
            effectiveDate: true,
            nextBillingDate: true,
            monthlyPerVehicleCents: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    snapshot,
    discount: {
      rate: DSN_PLUS_DISCOUNT_RATE,
      label: DSN_PLUS_DISCOUNT_LABEL,
    },
    vehicles: vehicles.map((v) => ({
      ...v,
      currentEnrollment: v.enrollments[0] ?? null,
      enrollments: undefined,
    })),
    // Prices for the member's fleet size once every unenrolled vehicle joins.
    planQuotes: quoteAllPlans(Math.max(snapshot.enrolledVehicles || 1, 1)),
  });
}

const enrollSchema = z.object({
  vehicleIds: z.array(z.string().min(1)).min(1, "Choose at least one vehicle"),
  plan: z.enum(["PREPAID_6", "PREPAID_12", "FINANCE_12"]),
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

  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please choose the vehicles and a payment plan.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const result = await requestEnrollment({
    userId: session.user.id,
    vehicleIds: parsed.data.vehicleIds,
    plan: parsed.data.plan,
  });

  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
