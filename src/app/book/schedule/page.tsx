"use client";

/**
 * Step 3 — Choose a time and confirm the appointment (Priority 2)
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * The member picks from the facility's real published availability and confirms.
 * The appointment is created in the facility's scheduling system, not merely
 * recorded as an enquiry — verified against staging on 21 August 2026, where a
 * booking returned a confirmed appointment.
 *
 * The DSN+ position is stated one last time before commitment, because this is
 * the moment the member is deciding to spend money.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Car,
  CheckCircle2,
  MapPin,
  Wrench,
} from "lucide-react";
import { BookingStepIndicator } from "@/components/booking/BookingStepIndicator";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { SavingsCallout } from "@/components/dsn-plus/SavingsCallout";
import { Button } from "@/components/ui/Button";
import {
  clearBookingDraft,
  readBookingDraft,
  writeBookingDraft,
  type BookingDraft,
} from "@/lib/booking/draft";
import { FUNNEL_EVENTS, trackEvent } from "@/lib/analytics/funnel";
import { TrackEvent } from "@/components/analytics/TrackEvent";
import { formatCents } from "@/lib/dsn-plus/discount";

interface VehicleOption {
  id: string;
  year: number;
  make: string;
  model: string;
  nickname: string | null;
  licensePlate: string | null;
  programStatus: "FREE" | "DSN_PLUS";
}

export default function SchedulePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [vehicle, setVehicle] = useState<VehicleOption | null>(null);
  const [slot, setSlot] = useState<{ scheduledTime: string; label: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readBookingDraft();
    if (!stored?.facility?.slug || !stored?.service || !stored?.vehicleId) {
      router.replace("/book");
      return;
    }
    setDraft(stored);
    setNotes(stored.notes ?? "");
  }, [router]);

  useEffect(() => {
    if (!draft?.vehicleId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/vehicles");
        const payload = await res.json();
        if (cancelled) return;
        const list: VehicleOption[] = Array.isArray(payload.vehicles)
          ? payload.vehicles
          : [];
        setVehicle(list.find((v) => v.id === draft.vehicleId) ?? null);
      } catch {
        // The server re-validates ownership at submission; this is display only.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [draft?.vehicleId]);

  async function confirm() {
    if (!draft?.facility || !draft.service || !draft.vehicleId || !slot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: draft.vehicleId,
          facilitySlug: draft.facility.slug,
          facilityLocationId: draft.facility.locationId,
          scheduledTime: slot.scheduledTime,
          services: [
            {
              serviceId: draft.service.serviceId,
              serviceName: draft.service.serviceName,
              interview: draft.service.interview,
            },
          ],
          notes: notes.trim() || undefined,
          quotedPriceCents: draft.facility.standardPriceCents ?? undefined,
          serviceRequestId: draft.serviceRequestId ?? undefined,
          openbayOfferId: draft.facility.openbayOfferId ?? undefined,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not complete your booking.");
        trackEvent(FUNNEL_EVENTS.BOOKING_FAILED, {
          status: res.status,
          facilitySlug: draft.facility.slug,
          serviceId: draft.service.serviceId,
        });
        return;
      }
      trackEvent(FUNNEL_EVENTS.BOOKING_COMPLETED, {
        appointmentId: payload.appointmentId,
        facilitySlug: draft.facility.slug,
        serviceId: draft.service.serviceId,
        enrolled: vehicle?.programStatus === "DSN_PLUS",
      });
      clearBookingDraft();
      router.push(`/dashboard/appointments/${payload.appointmentId}?booked=1`);
    } catch {
      setError("We could not reach the network. Please try again.");
      trackEvent(FUNNEL_EVENTS.BOOKING_FAILED, { reason: "network" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!draft?.facility) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BookingStepIndicator currentStep={3} />
      </div>
    );
  }

  const facility = draft.facility;
  const enrolled = vehicle?.programStatus === "DSN_PLUS";

  return (
    <div className="min-h-screen bg-gray-50">
      <TrackEvent event={FUNNEL_EVENTS.AVAILABILITY_VIEWED} />
      <BookingStepIndicator currentStep={3} />
      <div className="section-container py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/book/facilities"
            className="inline-flex items-center gap-1.5 font-montserrat text-xs font-semibold text-teal hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Choose a different facility
          </Link>

          <h1 className="heading-lg mb-6 mt-3 text-navy">Choose your appointment</h1>

          {/* Summary of what is being booked */}
          <section className="mb-6 rounded-xl bg-white p-6 shadow-card">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
                <div>
                  <p className="font-montserrat text-sm font-bold text-navy">
                    {facility.name}
                  </p>
                  <p className="font-opensans text-xs text-gray-500">
                    {facility.address}, {facility.city}, {facility.state}{" "}
                    {facility.zipcode}
                    {facility.distanceMiles !== null && ` · ${facility.distanceMiles} mi`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Wrench className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
                <div>
                  <p className="font-montserrat text-sm font-bold text-navy">
                    {draft.service?.serviceName}
                  </p>
                  {draft.service?.interview && draft.service.interview.length > 0 && (
                    <dl className="mt-1 space-y-0.5">
                      {draft.service.interview.map((qa, i) => (
                        <div key={i} className="font-opensans text-xs">
                          <dt className="inline text-gray-500">{qa.question} </dt>
                          <dd className="inline font-semibold text-navy">{qa.answer}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </div>

              {vehicle && (
                <div className="flex items-start gap-3">
                  <Car className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
                  <div>
                    <p className="font-montserrat text-sm font-bold text-navy">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="font-opensans text-xs text-gray-500">
                      {vehicle.licensePlate
                        ? `Plate ${vehicle.licensePlate}`
                        : "Registered to your membership"}
                    </p>
                  </div>
                </div>
              )}

              {typeof facility.standardPriceCents === "number" && (
                <div className="rounded-lg border border-teal/20 bg-teal/5 p-3">
                  <p className="font-montserrat text-xs font-bold uppercase tracking-wide text-teal">
                    Facility estimate
                  </p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="font-opensans text-xs text-gray-500">
                      FREE: <span className="font-bold text-navy">{formatCents(facility.standardPriceCents)}</span>
                    </p>
                    {typeof facility.dsnPlusPriceCents === "number" && (
                      <p className="font-opensans text-xs text-teal">
                        DSN+: <span className="font-bold">{formatCents(facility.dsnPlusPriceCents)}</span>
                        {typeof facility.dsnPlusSavingsCents === "number" &&
                          ` · Save ${formatCents(facility.dsnPlusSavingsCents)}`}
                      </p>
                    )}
                  </div>
                  <p className="mt-1 font-opensans text-[11px] text-gray-500">
                    Your price today: {formatCents(enrolled ? facility.dsnPlusPriceCents : facility.standardPriceCents)}. The facility confirms final scope before service.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Live availability */}
          <section className="mb-6 rounded-xl bg-white p-6 shadow-card">
            <SlotPicker
              facilitySlug={facility.slug}
              facilityPhone={facility.phone}
              value={slot}
              onChange={(next) => {
                setSlot(next);
                if (next) {
                  writeBookingDraft({
                    scheduledTime: next.scheduledTime,
                    scheduledLabel: next.label,
                  });
                }
              }}
            />
          </section>

          {/* Anything the facility should know */}
          <section className="mb-6 rounded-xl bg-white p-6 shadow-card">
            <label
              htmlFor="booking-notes"
              className="font-montserrat text-sm font-semibold text-navy"
            >
              Anything else the facility should know?
            </label>
            <p className="mt-1 font-opensans text-xs text-gray-500">
              Optional. Your answers above are already included.
            </p>
            <textarea
              id="booking-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
              rows={3}
              placeholder="For example: the noise only happens when braking downhill."
              className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-3 font-opensans text-sm text-navy placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </section>

          {/* DSN+ position, stated at the point of commitment (P3). */}
          <SavingsCallout
            className="mb-6"
            variant={enrolled ? "card" : "banner"}
            enrolled={enrolled}
            enrollHref={`/membership/join?plan=dsn-plus&vehicleId=${draft.vehicleId}&returnTo=/book/schedule`}
          />

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="font-opensans text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" size="lg" asChild>
              <Link href="/book/facilities">Back</Link>
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={confirm}
              disabled={!slot || submitting}
              loading={submitting}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {slot ? `Confirm ${slot.label}` : "Choose a time to continue"}
            </Button>
          </div>

          <p className="mt-4 text-center font-opensans text-xs text-gray-400">
            You will not be charged by Drive Service Network. You pay the facility
            directly for the work performed.
          </p>
        </div>
      </div>
    </div>
  );
}
