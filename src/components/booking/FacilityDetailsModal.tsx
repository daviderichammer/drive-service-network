"use client";

/**
 * Facility "View Details" — Priority 2
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * The full facility profile the BUILD requires behind View Details: who they
 * are, where they are, when they are open, what they are certified to do, what
 * they offer while the member waits, and what their workmanship warranty
 * covers — plus the real appointment times they have open.
 *
 * Review text is not shown: no published endpoint returns review bodies for
 * these facility identifiers (FLAG F-5). The aggregate rating and review count
 * are real and are shown; nothing is fabricated to fill the gap.
 */

import { useEffect, useState } from "react";
import {
  Building2,
  Car,
  Check,
  Clock,
  Globe,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react";
import { StarRating } from "./FacilityCard";
import { cn } from "@/lib/utils";

interface FacilityDetail {
  locationId: number;
  slug: string;
  name: string;
  about: string | null;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string | null;
  mobileMechanic: boolean;
  rating: number | null;
  reviewCount: number | null;
  amenities: string[];
  certifications: string[];
  businessHighlights: string[];
  discounts: string[];
  transportation: string[];
  languages: string[];
  customerPerks: string[];
  topServices: string[];
  warrantyOverview: string | null;
  hours: Record<string, { open: string | null; close: string | null } | null>;
}

interface SlotRecord {
  day: string;
  key: string;
  slotTitle: string;
  proposedTime?: string;
  fullSlotTitle?: string;
}

const DAY_LABELS: Array<[keyof FacilityDetail["hours"], string]> = [
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"],
];

function to12Hour(value: string | null | undefined): string {
  if (!value) return "Closed";
  const [hRaw, m] = value.split(":");
  const h = Number(hRaw);
  if (!Number.isFinite(h)) return value;
  const suffix = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m && m !== "00" ? `${hour12}:${m}${suffix}` : `${hour12}${suffix}`;
}

function Chips({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4 className="font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
        {title}
      </h4>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded bg-gray-50 px-2 py-1 font-opensans text-xs text-gray-700"
          >
            <Check className="h-3 w-3 text-teal" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FacilityDetailsModal({
  locationId,
  onClose,
  onChoose,
}: {
  locationId: number;
  onClose: () => void;
  onChoose: (slug: string) => void;
}) {
  const [detail, setDetail] = useState<FacilityDetail | null>(null);
  const [availability, setAvailability] = useState<SlotRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/platform/facilities/${locationId}`);
        const payload = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(payload.error ?? "We could not load this facility.");
          return;
        }
        setDetail(payload.facility);
        setAvailability(Array.isArray(payload.availability) ? payload.availability : []);
        setError(null);
      } catch {
        if (!cancelled) setError("We could not load this facility. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const nextDays = Array.from(new Set(availability.map((s) => s.day))).slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Service facility details"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-montserrat text-lg font-bold text-navy">
              {detail?.name ?? "Facility details"}
            </h2>
            {detail && (
              <p className="mt-0.5 font-opensans text-xs text-gray-500">
                {detail.address}, {detail.city}, {detail.state} {detail.zipcode}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="h-7 w-7 animate-spin text-teal" />
              <p className="font-opensans text-sm text-gray-500">Loading facility…</p>
            </div>
          ) : error ? (
            <p className="py-12 text-center font-opensans text-sm text-red-600">{error}</p>
          ) : detail ? (
            <div className="space-y-6">
              {typeof detail.rating === "number" && detail.rating > 0 && (
                <StarRating rating={detail.rating} count={detail.reviewCount} />
              )}

              {detail.about && (
                <p className="font-opensans text-sm leading-relaxed text-gray-600">
                  {detail.about}
                </p>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {detail.phone && (
                  <a
                    href={`tel:${detail.phone}`}
                    className="inline-flex items-center gap-1.5 font-opensans text-sm text-navy hover:text-teal"
                  >
                    <Phone className="h-4 w-4 text-gray-400" />
                    {detail.phone}
                  </a>
                )}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${detail.address} ${detail.city} ${detail.state} ${detail.zipcode}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-opensans text-sm text-navy hover:text-teal"
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Directions
                </a>
                {detail.mobileMechanic && (
                  <span className="inline-flex items-center gap-1.5 font-opensans text-sm text-gray-600">
                    <Car className="h-4 w-4 text-gray-400" />
                    Offers mobile service
                  </span>
                )}
              </div>

              {/* Real availability */}
              <div>
                <h4 className="font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
                  Next available appointments
                </h4>
                {availability.length === 0 ? (
                  <p className="mt-2 font-opensans text-sm text-gray-500">
                    This facility does not publish online availability. Call them directly
                    to arrange a time.
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {nextDays.map((day) => {
                      const daySlots = availability
                        .filter((s) => s.day === day && s.slotTitle?.trim())
                        .slice(0, 8);
                      return (
                        <div key={day} className="flex flex-wrap items-center gap-2">
                          <span className="w-24 flex-shrink-0 font-montserrat text-xs font-semibold text-navy">
                            {new Date(`${day}T12:00:00`).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {daySlots.map((slot) => (
                            <span
                              key={slot.key}
                              className="rounded border border-teal/20 bg-teal/5 px-2 py-1 font-opensans text-xs text-teal"
                            >
                              {slot.slotTitle.trim()}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                    <p className="pt-1 font-opensans text-xs text-gray-400">
                      {availability.length} openings in the next 14 days.
                    </p>
                  </div>
                )}
              </div>

              {/* Hours */}
              <div>
                <h4 className="flex items-center gap-1.5 font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  Hours
                </h4>
                <dl className="mt-2 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
                  {DAY_LABELS.map(([key, label]) => {
                    const day = detail.hours?.[key];
                    const closed = !day?.open || !day?.close;
                    return (
                      <div key={String(key)} className="flex justify-between">
                        <dt className="font-opensans text-sm text-gray-600">{label}</dt>
                        <dd
                          className={cn(
                            "font-opensans text-sm",
                            closed ? "text-gray-400" : "text-navy"
                          )}
                        >
                          {closed
                            ? "Closed"
                            : `${to12Hour(day?.open)} – ${to12Hour(day?.close)}`}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              <Chips title="Certifications" items={detail.certifications} />
              <Chips title="Amenities" items={detail.amenities} />
              <Chips title="Member perks" items={detail.customerPerks} />
              <Chips title="Transportation" items={detail.transportation} />
              <Chips title="Languages spoken" items={detail.languages} />
              <Chips title="Highlights" items={detail.businessHighlights} />

              {detail.topServices.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
                    <Building2 className="h-3.5 w-3.5" />
                    Frequently performed here
                  </h4>
                  <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {detail.topServices.slice(0, 10).map((service) => (
                      <li
                        key={service}
                        className="font-opensans text-sm text-gray-600"
                      >
                        · {service}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detail.warrantyOverview && (
                <div className="rounded-lg border border-teal/20 bg-teal/5 p-4">
                  <h4 className="flex items-center gap-1.5 font-montserrat text-xs font-bold uppercase tracking-wide text-teal">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Workmanship warranty
                  </h4>
                  <p className="mt-1.5 font-opensans text-sm leading-relaxed text-gray-700">
                    {detail.warrantyOverview}
                  </p>
                </div>
              )}

              {detail.languages.length === 0 && detail.certifications.length === 0 && (
                <p className="inline-flex items-center gap-1.5 font-opensans text-xs text-gray-400">
                  <Globe className="h-3.5 w-3.5" />
                  This facility has not published additional profile information.
                </p>
              )}
            </div>
          ) : null}
        </div>

        {detail && (
          <div className="sticky bottom-0 flex gap-3 border-t border-gray-100 bg-white px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-5 py-3 font-montserrat text-sm font-semibold text-navy transition-colors hover:border-navy"
            >
              Back to results
            </button>
            <button
              onClick={() => onChoose(detail.slug)}
              className="flex-1 rounded-lg bg-teal px-5 py-3 font-montserrat text-sm font-bold text-white transition-colors hover:bg-teal-600"
            >
              Choose this facility
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
