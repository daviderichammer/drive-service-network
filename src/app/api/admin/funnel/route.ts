/**
 * GET /api/admin/funnel — conversion funnel report
 *
 * Priority 5, BUILD sections 37 and T. Protected by the internal secret used by
 * the other operational endpoints rather than a member session, because this is
 * business data and no member should be able to read it.
 *
 * Reports distinct users per step, not raw event counts. One enthusiastic
 * visitor refreshing the facility list twelve times is one person considering a
 * booking, and counting them twelve times would flatter the numbers.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MONETISATION_FUNNEL, PRIMARY_FUNNEL } from "@/lib/analytics/funnel";

export const dynamic = "force-dynamic";

function authorised(request: NextRequest): boolean {
  // Reuses the operational secret already used by the platform health probe,
  // rather than introducing a second one that would inevitably drift.
  const expected = process.env.INTERNAL_API_SECRET;
  if (!expected) return false;
  return request.headers.get("x-dsn-internal-secret") === expected;
}

async function buildFunnel(steps: string[], since: Date) {
  const rows = await prisma.funnelEvent.groupBy({
    by: ["event"],
    where: { event: { in: steps }, createdAt: { gte: since } },
    _count: { _all: true },
  });
  const counts = new Map(rows.map((r) => [r.event, r._count._all]));

  // Distinct identified users per step, counted separately from raw volume.
  const distinct = await Promise.all(
    steps.map(async (event) => {
      const users = await prisma.funnelEvent.findMany({
        where: { event, createdAt: { gte: since }, userId: { not: null } },
        distinct: ["userId"],
        select: { userId: true },
      });
      return [event, users.length] as const;
    })
  );
  const distinctMap = new Map(distinct);

  const first = distinctMap.get(steps[0]) ?? 0;
  return steps.map((event, index) => {
    const people = distinctMap.get(event) ?? 0;
    const previous = index === 0 ? people : (distinctMap.get(steps[index - 1]) ?? 0);
    return {
      step: index + 1,
      event,
      events: counts.get(event) ?? 0,
      people,
      conversionFromPrevious:
        previous > 0 ? Number(((people / previous) * 100).toFixed(1)) : null,
      conversionFromStart:
        first > 0 ? Number(((people / first) * 100).toFixed(1)) : null,
    };
  });
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const days = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get("days") ?? 30), 1),
    365
  );
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [primary, monetisation, totals] = await Promise.all([
    buildFunnel(PRIMARY_FUNNEL, since),
    buildFunnel(MONETISATION_FUNNEL, since),
    prisma.funnelEvent.groupBy({
      by: ["event"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { event: "desc" } },
    }),
  ]);

  return NextResponse.json({
    windowDays: days,
    since: since.toISOString(),
    primaryFunnel: primary,
    monetisationFunnel: monetisation,
    allEvents: totals.map((t) => ({ event: t.event, count: t._count._all })),
  });
}
