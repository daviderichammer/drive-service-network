/**
 * DELETE /api/dsn-plus/enrollment/[vehicleId] — cancel DSN+ on one vehicle
 *
 * BUILD section Q: DSN+ status is never a permanent yes/no. Cancelling returns
 * the vehicle to the free membership; the vehicle itself stays registered and
 * its history is untouched (BUILD section K).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cancelEnrollment } from "@/lib/dsn-plus/enrollment";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ vehicleId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }

  const { vehicleId } = await context.params;
  const result = await cancelEnrollment(session.user.id, vehicleId);

  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
