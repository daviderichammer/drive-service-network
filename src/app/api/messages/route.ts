/**
 * GET  /api/messages — the member's facility conversations
 * POST /api/messages — start a conversation with a facility
 *
 * Priority 4, BUILD section 25. See lib/messages/service for why DSN operates
 * these threads itself (FLAG F-7).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { listThreads, startThread } from "@/lib/messages/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }
  const threads = await listThreads(session.user.id);
  return NextResponse.json({ threads });
}

const startSchema = z.object({
  subject: z.string().min(1, "A subject is required").max(180),
  body: z.string().min(1, "Please write a message").max(4000),
  appointmentId: z.string().optional(),
  vehicleId: z.string().optional(),
  facilityName: z.string().max(180).optional(),
  facilitySlug: z.string().max(180).optional(),
  facilityPhone: z.string().max(40).optional(),
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

  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the highlighted fields.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const result = await startThread({ userId: session.user.id, ...parsed.data });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json(result, { status: 201 });
}
