"use client";

/**
 * Appointment slot picker — Priority 2
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Renders the facility's real, live availability. Every slot shown is a slot
 * the facility's scheduling system published; nothing is generated locally.
 * The value carried forward is the offset-bearing timestamp the network
 * returned, so the appointment is booked in the facility's own time zone with
 * no client-side conversion error.
 */

import { useEffect, useState } from "react";
import { CalendarDays, Loader2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SlotRecord {
  key: string;
  slotTitle: string;
  proposedTime?: string;
  fullSlotTitle?: string;
}

export interface DayGroup {
  day: string;
  slots: SlotRecord[];
}

export function SlotPicker({
  facilitySlug,
  facilityPhone,
  value,
  onChange,
}: {
  facilitySlug: string;
  facilityPhone?: string | null;
  value: { scheduledTime: string; label: string } | null;
  onChange: (slot: { scheduledTime: string; label: string } | null) => void;
}) {
  const [days, setDays] = useState<DayGroup[]>([]);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        onChange(null);
        const res = await fetch(
          `/api/platform/availability?slug=${encodeURIComponent(facilitySlug)}&days=14`
        );
        const payload = await res.json();
        if (cancelled) return;
        const list: DayGroup[] = Array.isArray(payload.days) ? payload.days : [];
        setDays(list);
        setActiveDay(list[0]?.day ?? null);
        setError(list.length === 0 ? payload.error ?? null : null);
      } catch {
        if (!cancelled) setError("We could not load appointment times for this facility.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // onChange is intentionally excluded: it is a stable callback from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilitySlug]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-10">
        <Loader2 className="h-5 w-5 animate-spin text-teal" />
        <span className="font-opensans text-sm text-gray-500">
          Checking live availability…
        </span>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <p className="font-montserrat text-sm font-semibold text-navy">
          No online availability
        </p>
        <p className="mt-1 font-opensans text-sm leading-relaxed text-gray-600">
          {error ??
            "This facility does not publish appointment times online. Call them directly and mention Drive Service Network."}
        </p>
        {facilityPhone && (
          <a
            href={`tel:${facilityPhone}`}
            className="mt-3 inline-flex items-center gap-1.5 font-montserrat text-sm font-bold text-teal hover:underline"
          >
            <Phone className="h-4 w-4" />
            {facilityPhone}
          </a>
        )}
      </div>
    );
  }

  const active = days.find((d) => d.day === activeDay) ?? days[0];

  return (
    <div>
      <h4 className="flex items-center gap-1.5 font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
        <CalendarDays className="h-3.5 w-3.5" />
        Choose a day
      </h4>

      <div className="scrollbar-hide mt-2 flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => {
          const date = new Date(`${day.day}T12:00:00`);
          const isActive = day.day === active.day;
          return (
            <button
              key={day.day}
              onClick={() => {
                setActiveDay(day.day);
                onChange(null);
              }}
              className={cn(
                "flex-shrink-0 rounded-lg border px-3 py-2 text-center transition-all",
                isActive
                  ? "border-navy bg-navy text-white"
                  : "border-gray-200 bg-white text-navy hover:border-teal"
              )}
            >
              <div className="font-montserrat text-[10px] font-bold uppercase tracking-wide opacity-70">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="font-montserrat text-sm font-bold">
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div
                className={cn(
                  "font-opensans text-[10px]",
                  isActive ? "text-white/70" : "text-gray-400"
                )}
              >
                {day.slots.length} open
              </div>
            </button>
          );
        })}
      </div>

      <h4 className="mt-5 font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
        Choose a time
      </h4>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {active.slots.map((slot) => {
          const scheduledTime = slot.proposedTime ?? "";
          const selected = value?.scheduledTime === scheduledTime && scheduledTime !== "";
          return (
            <button
              key={slot.key}
              disabled={!scheduledTime}
              onClick={() =>
                onChange({
                  scheduledTime,
                  label: slot.fullSlotTitle ?? `${active.day} ${slot.slotTitle}`,
                })
              }
              className={cn(
                "rounded-lg border px-3 py-2.5 font-opensans text-sm transition-all",
                selected
                  ? "border-teal bg-teal text-white"
                  : "border-gray-200 bg-white text-navy hover:border-teal hover:bg-teal/5",
                !scheduledTime && "cursor-not-allowed opacity-40"
              )}
            >
              {slot.slotTitle}
            </button>
          );
        })}
      </div>

      {value && (
        <p className="mt-4 rounded-lg bg-teal/5 px-4 py-3 font-opensans text-sm text-navy">
          Selected: <span className="font-semibold">{value.label}</span>
        </p>
      )}
    </div>
  );
}
