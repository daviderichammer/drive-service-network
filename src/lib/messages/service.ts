/**
 * Facility messaging and member support — Priority 4
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * FLAG F-7. The Openbay Platform API publishes no messaging surface. There is
 * no thread endpoint, no message endpoint and no notification endpoint in the
 * specification, so there is nothing to proxy.
 *
 * Drive Service Network therefore operates the conversation itself. A member
 * writes to a facility through DSN; the message is recorded here and relayed by
 * the DSN team. This is the correct answer for two reasons beyond necessity:
 * the member stays inside the DSN brand as Absolute Rule 1 requires, and the
 * correspondence lives in DSN's own database, which the BUILD names as the
 * system of record.
 *
 * What this deliberately does NOT do is fabricate facility replies. A thread
 * shows exactly what has been said, and the interface tells the member how
 * their message reaches the shop.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { trackFunnelEvent } from "@/lib/membership/service";

export interface StartThreadInput {
  userId: string;
  subject: string;
  body: string;
  appointmentId?: string;
  vehicleId?: string;
  facilityName?: string;
  facilitySlug?: string;
  facilityPhone?: string;
}

export async function startThread(
  input: StartThreadInput
): Promise<{ ok: true; threadId: string } | { error: string }> {
  // An appointment-linked thread inherits the facility and vehicle from the
  // appointment, so the member never has to restate context they already gave.
  let facilityName = input.facilityName ?? null;
  let facilityPhone = input.facilityPhone ?? null;
  let vehicleId = input.vehicleId ?? null;

  if (input.appointmentId) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: input.appointmentId, userId: input.userId },
      select: {
        id: true,
        shopName: true,
        shopPhone: true,
        vehicleId: true,
      },
    });
    if (!appointment) return { error: "Appointment not found." };
    facilityName = facilityName ?? appointment.shopName;
    facilityPhone = facilityPhone ?? appointment.shopPhone;
    vehicleId = vehicleId ?? appointment.vehicleId;
  }

  if (vehicleId) {
    const owned = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: input.userId },
      select: { id: true },
    });
    if (!owned) return { error: "Vehicle not found." };
  }

  const now = new Date();
  const thread = await prisma.messageThread.create({
    data: {
      userId: input.userId,
      vehicleId,
      appointmentId: input.appointmentId ?? null,
      subject: input.subject.trim().slice(0, 180),
      facilityName,
      facilitySlug: input.facilitySlug ?? null,
      facilityPhone,
      status: "AWAITING_FACILITY",
      lastMessageAt: now,
      messages: {
        create: {
          direction: "MEMBER_TO_FACILITY",
          body: input.body.trim(),
          createdAt: now,
        },
      },
    },
    select: { id: true },
  });

  await trackFunnelEvent("facility_message_sent", {
    userId: input.userId,
    metadata: { threadId: thread.id, appointmentId: input.appointmentId ?? null },
  });

  return { ok: true, threadId: thread.id };
}

export async function replyToThread(
  userId: string,
  threadId: string,
  body: string
): Promise<{ ok: true } | { error: string }> {
  const thread = await prisma.messageThread.findFirst({
    where: { id: threadId, userId },
    select: { id: true, status: true },
  });
  if (!thread) return { error: "Conversation not found." };
  if (thread.status === "CLOSED") {
    return { error: "This conversation has been closed." };
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.message.create({
      data: {
        threadId: thread.id,
        direction: "MEMBER_TO_FACILITY",
        body: body.trim(),
        createdAt: now,
      },
    }),
    prisma.messageThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: now, status: "AWAITING_FACILITY" },
    }),
  ]);

  return { ok: true };
}

export async function listThreads(userId: string) {
  return prisma.messageThread.findMany({
    where: { userId },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    select: {
      id: true,
      subject: true,
      facilityName: true,
      status: true,
      lastMessageAt: true,
      unreadForMember: true,
      appointmentId: true,
      vehicle: { select: { year: true, make: true, model: true, nickname: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, direction: true, createdAt: true },
      },
    },
  });
}

export async function getThread(userId: string, threadId: string) {
  const thread = await prisma.messageThread.findFirst({
    where: { id: threadId, userId },
    select: {
      id: true,
      subject: true,
      facilityName: true,
      facilityPhone: true,
      status: true,
      lastMessageAt: true,
      appointmentId: true,
      vehicle: { select: { id: true, year: true, make: true, model: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          direction: true,
          body: true,
          authorName: true,
          createdAt: true,
        },
      },
    },
  });

  if (thread) {
    // Opening the thread clears the member's unread marker.
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { unreadForMember: 0 },
    });
  }

  return thread;
}

export async function countUnreadMessages(userId: string): Promise<number> {
  const result = await prisma.messageThread.aggregate({
    where: { userId },
    _sum: { unreadForMember: true },
  });
  return result._sum.unreadForMember ?? 0;
}

// ============================================================
// SUPPORT (BUILD section 26)
// ============================================================

export interface SupportRequestInput {
  userId: string;
  subject: string;
  body: string;
  category?: string;
  relatedAppointmentId?: string;
  relatedVehicleId?: string;
}

export async function openSupportTicket(
  input: SupportRequestInput
): Promise<{ ok: true; ticketId: string }> {
  const now = new Date();
  const ticket = await prisma.supportTicket.create({
    data: {
      userId: input.userId,
      subject: input.subject.trim().slice(0, 180),
      category: input.category ?? null,
      status: "OPEN",
      relatedAppointmentId: input.relatedAppointmentId ?? null,
      relatedVehicleId: input.relatedVehicleId ?? null,
      lastMessageAt: now,
      messages: {
        create: {
          fromMember: true,
          body: input.body.trim(),
          createdAt: now,
        },
      },
    },
    select: { id: true },
  });

  await trackFunnelEvent("support_ticket_opened", {
    userId: input.userId,
    metadata: { ticketId: ticket.id, category: input.category ?? null },
  });

  return { ok: true, ticketId: ticket.id };
}

export async function listSupportTickets(userId: string) {
  return prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    select: {
      id: true,
      subject: true,
      category: true,
      status: true,
      priority: true,
      lastMessageAt: true,
      createdAt: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, fromMember: true, createdAt: true },
      },
    },
  });
}

export async function getSupportTicket(userId: string, ticketId: string) {
  return prisma.supportTicket.findFirst({
    where: { id: ticketId, userId },
    select: {
      id: true,
      subject: true,
      category: true,
      status: true,
      priority: true,
      createdAt: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          fromMember: true,
          authorName: true,
          body: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function replyToSupportTicket(
  userId: string,
  ticketId: string,
  body: string
): Promise<{ ok: true } | { error: string }> {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId },
    select: { id: true, status: true },
  });
  if (!ticket) return { error: "Support request not found." };
  if (ticket.status === "CLOSED") {
    return { error: "This support request has been closed." };
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.supportMessage.create({
      data: { ticketId: ticket.id, fromMember: true, body: body.trim(), createdAt: now },
    }),
    prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { lastMessageAt: now, status: "OPEN" },
    }),
  ]);

  return { ok: true };
}
