/**
 * GET    /api/bookings/{id} — a single appointment with live upstream status.
 * PATCH  /api/bookings/{id} — reschedule to a new slot.
 * DELETE /api/bookings/{id} — cancel (non-destructive; the record is retained).
 *
 * BUILD section K: history is preserved. Cancellation marks status, it never
 * deletes the row, so the vehicle's service history stays intact.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelBooking, rescheduleBooking } from "@/lib/booking/service";
import { getPlatformClient } from "@/lib/platform";

export const dynamic = "force-dynamic";

async function loadOwnedAppointment(userId: string, id: string) {
  return prisma.appointment.findFirst({
    where: { id, userId },
    select: {
      id: true,
      serviceType: true,
      serviceDescription: true,
      scheduledAt: true,
      completedAt: true,
      status: true,
      shopName: true,
      shopAddress: true,
      shopCity: true,
      shopState: true,
      shopZipCode: true,
      shopPhone: true,
      shopRating: true,
      quotedPriceCents: true,
      finalPriceCents: true,
      dsnPlusSavingsCents: true,
      customerNotes: true,
      openbayAppointmentId: true,
      openbayLocationId: true,
      createdAt: true,
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          nickname: true,
          vin: true,
          licensePlate: true,
          programStatus: true,
        },
      },
      // The originating request carries the facility slug and the interview
      // answers, both of which the detail page needs: the slug to fetch live
      // availability for a reschedule, the answers to show the member exactly
      // what the facility was told.
      serviceRequest: {
        select: { interviewAnswers: true, requestedServices: true },
      },
    },
  });
}

/** Interview answers are stored as JSON; narrow them safely for the client. */
function readInterviewAnswers(
  value: unknown
): Array<{ question: string; answer: string }> | null {
  if (!Array.isArray(value)) return null;
  const rows = value.filter(
    (item): item is { question: string; answer: string } =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as { question?: unknown }).question === "string" &&
      typeof (item as { answer?: unknown }).answer === "string"
  );
  return rows.length > 0 ? rows : null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { id } = await context.params;
  const appointment = await loadOwnedAppointment(session.user.id, id);
  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  // Reconcile with the facility's own record where one exists, so the member
  // sees the current state rather than DSN's last known state.
  let upstreamStatus: string | null = null;
  let confirmedAt: string | null = null;
  if (appointment.openbayAppointmentId) {
    try {
      const remote = await getPlatformClient().getAppointment(
        Number(appointment.openbayAppointmentId)
      );
      upstreamStatus = remote.appointment_status ?? null;
      confirmedAt = remote.confirmed_at ?? null;

      const mapped =
        upstreamStatus === "confirmed"
          ? "CONFIRMED"
          : upstreamStatus === "cancelled"
            ? "CANCELLED"
            : upstreamStatus === "completed"
              ? "COMPLETED"
              : null;
      if (mapped && mapped !== appointment.status) {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { status: mapped },
        });
      }
    } catch {
      // The DSN record stands on its own.
    }
  }

  const { serviceRequest, ...rest } = appointment;

  return NextResponse.json({
    appointment: {
      ...rest,
      facilitySlug: appointment.openbayLocationId ?? null,
      interviewAnswers: readInterviewAnswers(serviceRequest?.interviewAnswers),
    },
    upstreamStatus,
    confirmedAt,
  });
}

const patchSchema = z.object({
  scheduledTime: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?([+-]\d{2}:\d{2}|Z)$/,
      "That appointment time is not valid"
    ),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please choose a valid appointment time." },
      { status: 400 }
    );
  }

  const result = await rescheduleBooking(session.user.id, id, parsed.data.scheduledTime);
  return NextResponse.json(
    { message: result.message },
    { status: result.ok ? 200 : 400 }
  );
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await cancelBooking(session.user.id, id);
  return NextResponse.json(
    { message: result.message },
    { status: result.ok ? 200 : 400 }
  );
}
