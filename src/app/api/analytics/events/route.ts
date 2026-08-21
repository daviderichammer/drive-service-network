/**
 * POST /api/analytics/events — record a funnel event
 *
 * Priority 5, BUILD sections 37 and T.
 *
 * Anonymous events are accepted: the top of the funnel is by definition made of
 * people who are not members yet, and discarding those would leave the business
 * measuring only the visitors who already converted. Events are matched to a
 * member when a session exists.
 *
 * Only names declared in FUNNEL_EVENTS are accepted. Free-text event names are
 * how analytics tables turn into landfill.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FUNNEL_EVENTS } from "@/lib/analytics/funnel";

export const dynamic = "force-dynamic";

const KNOWN_EVENTS = new Set<string>(Object.values(FUNNEL_EVENTS));

const eventSchema = z.object({
  event: z.string().min(1).max(80),
  metadata: z.record(z.unknown()).optional(),
  sessionId: z.string().max(120).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success || !KNOWN_EVENTS.has(parsed.data.event)) {
    // Rejected quietly: a bad analytics call is not the caller's problem to fix.
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  const session = await auth();

  try {
    await prisma.funnelEvent.create({
      data: {
        event: parsed.data.event,
        userId: session?.user?.id ?? null,
        metadata: (parsed.data.metadata ?? undefined) as never,
        sessionId: parsed.data.sessionId ?? null,
      },
    });
  } catch (error) {
    console.error("[Analytics] event write failed:", error);
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
