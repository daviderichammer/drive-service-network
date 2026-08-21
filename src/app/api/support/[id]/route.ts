/**
 * GET  /api/support/[id] — read one support request
 * POST /api/support/[id] — add a reply to it
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getSupportTicket, replyToSupportTicket } from "@/lib/messages/service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }
  const { id } = await context.params;
  const ticket = await getSupportTicket(session.user.id, id);
  if (!ticket) {
    return NextResponse.json({ error: "Support request not found." }, { status: 404 });
  }
  return NextResponse.json({ ticket });
}

const replySchema = z.object({
  body: z.string().min(1, "Please write a message").max(4000),
});

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }

  const { id } = await context.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = replySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please write a message." }, { status: 400 });
  }

  const result = await replyToSupportTicket(session.user.id, id, parsed.data.body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
