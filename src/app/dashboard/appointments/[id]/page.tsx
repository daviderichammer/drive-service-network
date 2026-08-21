"use client";

/**
 * Appointment detail and management — Priority 4
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * BUILD section 23: the member can see the appointment, reschedule it, cancel
 * it and contact the facility. Everything on this page acts on the real
 * appointment in the facility's scheduling system, not on a local copy.
 */

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { formatCents } from "@/lib/dsn-plus/discount";
import { cn } from "@/lib/utils";

interface AppointmentDetail {
  id: string;
  serviceType: string;
  serviceDescription: string | null;
  status: string;
  scheduledAt: string | null;
  completedAt: string | null;
  quotedPriceCents: number | null;
  finalPriceCents: number | null;
  dsnPlusSavingsCents: number | null;
  shopName: string | null;
  shopAddress: string | null;
  shopCity: string | null;
  shopState: string | null;
  shopZipCode: string | null;
  shopPhone: string | null;
  customerNotes: string | null;
  createdAt: string;
  facilitySlug: string | null;
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    nickname: string | null;
    licensePlate: string | null;
    programStatus: string;
  } | null;
  interviewAnswers: Array<{ question: string; answer: string }> | null;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending confirmation", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-50 text-blue-700 border-blue-200" },
  IN_PROGRESS: { label: "In progress", className: "bg-teal/10 text-teal border-teal/30" },
  COMPLETED: { label: "Completed", className: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-600 border-gray-200" },
  NO_SHOW: { label: "Missed", className: "bg-red-50 text-red-700 border-red-200" },
};

function AppointmentDetailInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justBooked = searchParams.get("booked") === "1";

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [rescheduling, setRescheduling] = useState(false);
  const [newSlot, setNewSlot] = useState<{ scheduledTime: string; label: string } | null>(
    null
  );

  const [messaging, setMessaging] = useState(false);
  const [messageBody, setMessageBody] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bookings/${params.id}`);
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not load this appointment.");
        return;
      }
      setAppointment(payload.appointment);
      setError(null);
    } catch {
      setError("We could not load this appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function reschedule() {
    if (!newSlot) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/bookings/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledTime: newSlot.scheduledTime }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not move this appointment.");
        return;
      }
      setRescheduling(false);
      setNewSlot(null);
      setNotice("Your appointment has been moved.");
      await load();
    } catch {
      setError("We could not reach the facility's scheduling system.");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!window.confirm("Cancel this appointment? The facility will be notified.")) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/bookings/${params.id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not cancel this appointment.");
        return;
      }
      setNotice("Your appointment has been cancelled.");
      await load();
    } catch {
      setError("We could not reach the facility's scheduling system.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage() {
    if (!messageBody.trim() || !appointment) return;
    setBusy(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `${appointment.serviceType} — ${appointment.shopName ?? "facility"}`,
          body: messageBody.trim(),
          appointmentId: appointment.id,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not send your message.");
        return;
      }
      router.push(`/dashboard/messages/${payload.threadId}`);
    } catch {
      setError("We could not send your message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <Loader2 className="h-7 w-7 animate-spin text-teal" />
        <p className="font-opensans text-sm text-gray-500">Loading appointment…</p>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6">
        <p className="font-opensans text-sm text-red-700">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/dashboard/appointments">Back to appointments</Link>
        </Button>
      </div>
    );
  }

  if (!appointment) return null;

  const status = STATUS_STYLES[appointment.status] ?? STATUS_STYLES.PENDING;
  const active = ["PENDING", "CONFIRMED"].includes(appointment.status);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/appointments"
        className="inline-flex items-center gap-1.5 font-montserrat text-xs font-semibold text-teal hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All appointments
      </Link>

      {justBooked && (
        <div className="flex items-start gap-3 rounded-xl border border-teal/30 bg-teal/5 p-5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal" />
          <div>
            <p className="font-montserrat text-sm font-bold text-navy">
              Your appointment is booked
            </p>
            <p className="mt-1 font-opensans text-sm text-gray-600">
              {appointment.shopName} has your booking. You will hear from them if
              anything needs to change.
            </p>
          </div>
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-teal/30 bg-teal/5 px-4 py-3 font-opensans text-sm text-navy">
          {notice}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <p className="font-opensans text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-montserrat text-xl font-bold text-navy">
              {appointment.serviceType}
            </h1>
            {appointment.vehicle && (
              <p className="mt-1 font-opensans text-sm text-gray-500">
                {appointment.vehicle.year} {appointment.vehicle.make}{" "}
                {appointment.vehicle.model}
                {appointment.vehicle.licensePlate &&
                  ` · ${appointment.vehicle.licensePlate}`}
              </p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex flex-shrink-0 items-center rounded-full border px-3 py-1 font-montserrat text-xs font-bold",
              status.className
            )}
          >
            {status.label}
          </span>
        </div>

        <dl className="mt-6 space-y-4 border-t border-gray-100 pt-5">
          {appointment.scheduledAt && (
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
              <div>
                <dt className="font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
                  Appointment
                </dt>
                <dd className="font-opensans text-sm text-navy">
                  {new Date(appointment.scheduledAt).toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            </div>
          )}

          {appointment.shopName && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
              <div>
                <dt className="font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
                  Facility
                </dt>
                <dd className="font-opensans text-sm text-navy">
                  {appointment.shopName}
                  {appointment.shopAddress && (
                    <span className="block text-xs text-gray-500">
                      {appointment.shopAddress}, {appointment.shopCity},{" "}
                      {appointment.shopState} {appointment.shopZipCode}
                    </span>
                  )}
                </dd>
                {appointment.shopPhone && (
                  <a
                    href={`tel:${appointment.shopPhone}`}
                    className="mt-1 inline-flex items-center gap-1.5 font-opensans text-xs text-teal hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    {appointment.shopPhone}
                  </a>
                )}
              </div>
            </div>
          )}

          {appointment.interviewAnswers &&
            appointment.interviewAnswers.length > 0 && (
              <div className="flex items-start gap-3">
                <Wrench className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
                <div>
                  <dt className="font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
                    What you told the facility
                  </dt>
                  <dd className="mt-1 space-y-0.5">
                    {appointment.interviewAnswers.map((qa, i) => (
                      <p key={i} className="font-opensans text-xs">
                        <span className="text-gray-500">{qa.question} </span>
                        <span className="font-semibold text-navy">{qa.answer}</span>
                      </p>
                    ))}
                  </dd>
                </div>
              </div>
            )}

          {appointment.customerNotes && (
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
              <div>
                <dt className="font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
                  Your notes
                </dt>
                <dd className="font-opensans text-sm text-gray-600">
                  {appointment.customerNotes}
                </dd>
              </div>
            </div>
          )}

          {/* Price is shown only where the facility has actually stated one. */}
          {(appointment.quotedPriceCents || appointment.finalPriceCents) && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
              <div>
                <dt className="font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
                  Price
                </dt>
                <dd className="font-opensans text-sm text-navy">
                  {formatCents(
                    appointment.finalPriceCents ?? appointment.quotedPriceCents
                  )}
                  {appointment.dsnPlusSavingsCents ? (
                    <span className="ml-2 text-xs font-semibold text-teal">
                      DSN+ saved you {formatCents(appointment.dsnPlusSavingsCents)}
                    </span>
                  ) : null}
                </dd>
              </div>
            </div>
          )}
        </dl>
      </div>

      {/* Reschedule */}
      {active && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          {!rescheduling ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-montserrat text-sm font-bold text-navy">
                  Need a different time?
                </p>
                <p className="mt-0.5 font-opensans text-xs text-gray-500">
                  Choose from the facility&apos;s live availability.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setRescheduling(true)}
                  disabled={!appointment.facilitySlug}
                >
                  <CalendarClock className="mr-1.5 h-4 w-4" />
                  Reschedule
                </Button>
                <Button variant="ghost" size="md" onClick={cancel} disabled={busy}>
                  <X className="mr-1.5 h-4 w-4" />
                  Cancel appointment
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="font-montserrat text-sm font-bold text-navy">
                  Choose a new time
                </p>
                <button
                  onClick={() => {
                    setRescheduling(false);
                    setNewSlot(null);
                  }}
                  className="font-montserrat text-xs font-semibold text-gray-500 hover:text-navy"
                >
                  Cancel
                </button>
              </div>
              {appointment.facilitySlug && (
                <SlotPicker
                  facilitySlug={appointment.facilitySlug}
                  facilityPhone={appointment.shopPhone}
                  value={newSlot}
                  onChange={setNewSlot}
                />
              )}
              <Button
                variant="primary"
                size="md"
                className="mt-5"
                onClick={reschedule}
                disabled={!newSlot || busy}
                loading={busy}
              >
                Move my appointment
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Message the facility */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        {!messaging ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-montserrat text-sm font-bold text-navy">
                Message the facility
              </p>
              <p className="mt-0.5 font-opensans text-xs text-gray-500">
                Ask a question about this appointment through Drive Service Network.
              </p>
            </div>
            <Button variant="outline" size="md" onClick={() => setMessaging(true)}>
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Write a message
            </Button>
          </div>
        ) : (
          <div>
            <label
              htmlFor="facility-message"
              className="font-montserrat text-sm font-bold text-navy"
            >
              Message {appointment.shopName}
            </label>
            <textarea
              id="facility-message"
              rows={4}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value.slice(0, 4000))}
              placeholder="For example: can I drop the vehicle off the night before?"
              className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-3 font-opensans text-sm text-navy placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal"
            />
            <p className="mt-2 font-opensans text-xs text-gray-400">
              Drive Service Network passes your message to the facility and records
              their reply here.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={sendMessage}
                disabled={!messageBody.trim() || busy}
                loading={busy}
              >
                Send
              </Button>
              <Button variant="ghost" size="md" onClick={() => setMessaging(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppointmentDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-teal" />
        </div>
      }
    >
      <AppointmentDetailInner />
    </Suspense>
  );
}
