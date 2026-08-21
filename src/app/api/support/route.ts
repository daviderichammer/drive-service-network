/**
 * GET  /api/support — the member's support requests
 * POST /api/support — open a support request
 *
 * Priority 4, BUILD section 26. Support is Drive Service Network's own function
 * and is never routed to Openbay, which would break Absolute Rule 1.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { listSupportTickets, openSupportTicket } from "@/lib/messages/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }
  const tickets = await listSupportTickets(session.user.id);
  return NextResponse.json({ tickets });
}

const openSchema = z.object({
  subject: z.string().min(1, "A subject is required").max(180),
  body: z.string().min(1, "Please describe how we can help").max(4000),
  category: z.string().max(80).optional(),
  relatedAppointmentId: z.string().optional(),
  relatedVehicleId: z.string().optional(),
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

  const parsed = openSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the highlighted fields.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const result = await openSupportTicket({ userId: session.user.id, ...parsed.data });
  return NextResponse.json(result, { status: 201 });
}
