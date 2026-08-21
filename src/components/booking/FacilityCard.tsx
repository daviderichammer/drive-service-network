"use client";

/**
 * Facility comparison card — Priority 2
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Presents one service facility for comparison, on the attributes Drive Service
 * Network can actually verify through the network: distance, member rating and
 * review volume, amenities, certifications, operating hours, warranty coverage
 * and whether the facility performs the requested work.
 *
 * No price is shown here. Competitive priced estimates require the
 * service-request entitlement that Openbay has not granted to this partner
 * (FLAG F-1); inventing a figure would breach BUILD sections G and I. The DSN+
 * saving is therefore presented as a benefit rather than a fabricated number.
 *
 * The facility is never described as an Openbay shop — it is a Drive Service
 * Network facility (BUILD section 5).
 */

import { Car, Check, Clock, MapPin, Phone, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FacilityCardData {
  locationId: number;
  slug: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  distanceMiles: number | null;
  rating: number | null;
  reviewCount: number | null;
  mobileMechanic: boolean;
  phone: string | null;
  amenities: string[];
  certifications: string[];
  customerPerks: string[];
  warrantyOverview: string | null;
  hours: Record<string, { open: string | null; close: string | null }> | null;
  performsRequestedServices: boolean | null;
  /** Count of real bookable openings in the next fourteen days, when known. */
  openSlots?: number | null;
}

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function to12Hour(value: string | null): string {
  if (!value) return "Closed";
  const [hRaw, m] = value.split(":");
  const h = Number(hRaw);
  if (!Number.isFinite(h)) return value;
  const suffix = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m && m !== "00" ? `${hour12}:${m}${suffix}` : `${hour12}${suffix}`;
}

function todayHours(hours: FacilityCardData["hours"]): string | null {
  if (!hours) return null;
  const key = DAY_ORDER[(new Date().getDay() + 6) % 7];
  const day = hours[key];
  if (!day) return null;
  if (!day.open || !day.close) return "Closed today";
  return `Open today ${to12Hour(day.open)} – ${to12Hour(day.close)}`;
}

export function StarRating({ rating, count }: { rating: number; count?: number | null }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < full
                ? "fill-gold text-gold"
                : i === full && half
                  ? "fill-gold/50 text-gold"
                  : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>
      <span className="font-opensans text-xs text-gray-500">
        {rating.toFixed(1)}
        {count ? ` (${count} reviews)` : ""}
      </span>
    </div>
  );
}

export function FacilityCard({
  facility,
  selected,
  onSelect,
  onViewDetails,
}: {
  facility: FacilityCardData;
  selected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
}) {
  const hoursLine = todayHours(facility.hours);
  const highlights = [
    ...facility.certifications.slice(0, 2),
    ...facility.amenities.slice(0, 3),
    ...facility.customerPerks.slice(0, 2),
  ].slice(0, 5);

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 transition-all",
        selected
          ? "border-teal ring-2 ring-teal/20"
          : "border-gray-200 hover:border-teal/40 hover:shadow-card"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-montserrat text-base font-bold text-navy">
              {facility.name}
            </h3>
            {facility.performsRequestedServices === true && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-teal">
                <Check className="h-3 w-3" />
                Performs this service
              </span>
            )}
            {facility.mobileMechanic && (
              <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-navy/70">
                <Car className="h-3 w-3" />
                Mobile service
              </span>
            )}
          </div>

          {typeof facility.rating === "number" && facility.rating > 0 && (
            <div className="mt-1.5">
              <StarRating rating={facility.rating} count={facility.reviewCount} />
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-opensans text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-gray-400" />
              {facility.address}, {facility.city}, {facility.state} {facility.zipcode}
              {facility.distanceMiles !== null && (
                <span className="ml-1 font-semibold text-navy">
                  · {facility.distanceMiles} mi
                </span>
              )}
            </span>
            {facility.phone && (
              <a
                href={`tel:${facility.phone}`}
                className="inline-flex items-center gap-1 hover:text-teal"
              >
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {facility.phone}
              </a>
            )}
          </div>

          {hoursLine && (
            <p className="mt-1.5 inline-flex items-center gap-1 font-opensans text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              {hoursLine}
            </p>
          )}

          {typeof facility.openSlots === "number" && (
            <p className="mt-1.5 font-opensans text-xs">
              {facility.openSlots > 0 ? (
                <span className="font-semibold text-teal">
                  {facility.openSlots} appointment times available in the next 14 days
                </span>
              ) : (
                <span className="text-gray-400">
                  No online availability — call to schedule
                </span>
              )}
            </p>
          )}

          {highlights.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="rounded bg-gray-50 px-2 py-0.5 font-opensans text-[11px] text-gray-600"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          {facility.warrantyOverview && (
            <p className="mt-2 inline-flex items-start gap-1.5 font-opensans text-[11px] leading-relaxed text-gray-500">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-teal" />
              <span className="line-clamp-2">{facility.warrantyOverview}</span>
            </p>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-row gap-2 sm:flex-col">
          <button
            onClick={onSelect}
            className={cn(
              "rounded-lg px-4 py-2.5 font-montserrat text-xs font-bold transition-colors",
              selected
                ? "bg-teal text-white"
                : "bg-navy text-white hover:bg-navy-700"
            )}
          >
            {selected ? "Selected" : "Choose times"}
          </button>
          <button
            onClick={onViewDetails}
            className="rounded-lg border border-gray-200 px-4 py-2.5 font-montserrat text-xs font-semibold text-navy transition-colors hover:border-navy"
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
}
