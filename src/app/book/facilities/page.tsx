"use client";

/**
 * Step 2 — Compare service facilities (Priority 2)
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * The member compares the facilities that serve their location on the criteria
 * Drive Service Network can genuinely evidence: whether the facility performs
 * the requested work, distance, member rating, review volume, certifications,
 * amenities, warranty and — decisively — real appointment availability.
 *
 * Pricing is deliberately absent. Competitive estimates require the Openbay
 * service-request entitlement this partner has not been granted (FLAG F-1).
 * Rather than show a placeholder or an invented figure, the interface says so
 * plainly and moves the member to a facility that can actually take the car.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Info,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { BookingStepIndicator } from "@/components/booking/BookingStepIndicator";
import { FacilityCard, type FacilityCardData } from "@/components/booking/FacilityCard";
import { FacilityDetailsModal } from "@/components/booking/FacilityDetailsModal";
import { SavingsCallout } from "@/components/dsn-plus/SavingsCallout";
import { Button } from "@/components/ui/Button";
import {
  readBookingDraft,
  writeBookingDraft,
  type BookingDraft,
} from "@/lib/booking/draft";
import { FUNNEL_EVENTS, trackEvent } from "@/lib/analytics/funnel";
import { TrackEvent } from "@/components/analytics/TrackEvent";
import { cn } from "@/lib/utils";

type SortKey = "recommended" | "distance" | "rating" | "availability";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "recommended", label: "Recommended" },
  { key: "distance", label: "Closest" },
  { key: "rating", label: "Highest rated" },
  { key: "availability", label: "Soonest available" },
];

export default function FacilitiesPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [facilities, setFacilities] = useState<FacilityCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [onlyMatching, setOnlyMatching] = useState(false);

  useEffect(() => {
    const stored = readBookingDraft();
    if (!stored?.zipCode || !stored?.service || !stored?.vehicleId) {
      router.replace("/book");
      return;
    }
    setDraft(stored);
  }, [router]);

  const load = useCallback(async (current: BookingDraft) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        zipcode: String(current.zipCode),
        radius: String(current.radius ?? 25),
      });
      if (current.service?.serviceId) {
        params.set("serviceIds", String(current.service.serviceId));
      }
      const res = await fetch(`/api/platform/facilities?${params.toString()}`);
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not load service facilities.");
        setFacilities([]);
        return;
      }
      const list: FacilityCardData[] = Array.isArray(payload.facilities)
        ? payload.facilities
        : [];
      setFacilities(list);

      // Availability is fetched for the leading facilities so the member can
      // see who can actually take the vehicle, which is the real differentiator
      // in the absence of competitive pricing.
      const leaders = list.filter((f) => f.slug).slice(0, 8);
      const counts = await Promise.all(
        leaders.map(async (facility) => {
          try {
            const r = await fetch(
              `/api/platform/availability?slug=${encodeURIComponent(facility.slug)}&days=14`
            );
            const p = await r.json();
            return { slug: facility.slug, count: Number(p.totalSlots ?? 0) };
          } catch {
            return { slug: facility.slug, count: null };
          }
        })
      );
      const bySlug = new Map(counts.map((c) => [c.slug, c.count]));
      setFacilities((prev) =>
        prev.map((f) =>
          bySlug.has(f.slug) ? { ...f, openSlots: bySlug.get(f.slug) ?? null } : f
        )
      );
    } catch {
      setError("We could not load service facilities. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (draft) void load(draft);
  }, [draft, load]);

  const visible = useMemo(() => {
    let list = [...facilities];
    if (onlyMatching) {
      list = list.filter((f) => f.performsRequestedServices !== false);
    }
    switch (sort) {
      case "distance":
        list.sort((a, b) => (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999));
        break;
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "availability":
        list.sort((a, b) => (b.openSlots ?? -1) - (a.openSlots ?? -1));
        break;
      default:
        break;
    }
    return list;
  }, [facilities, sort, onlyMatching]);

  function choose(facility: FacilityCardData) {
    trackEvent(FUNNEL_EVENTS.BOOKING_STARTED, {
      facilitySlug: facility.slug,
      distanceMiles: facility.distanceMiles,
      serviceId: draft?.service?.serviceId,
    });
    writeBookingDraft({
      facility: {
        locationId: facility.locationId,
        slug: facility.slug,
        name: facility.name,
        address: facility.address,
        city: facility.city,
        state: facility.state,
        zipcode: facility.zipcode,
        phone: facility.phone,
        rating: facility.rating,
        reviewCount: facility.reviewCount,
        distanceMiles: facility.distanceMiles,
      },
      step: 3,
    });
    router.push("/book/schedule");
  }

  function chooseBySlug(slug: string) {
    const match = facilities.find((f) => f.slug === slug);
    if (match) choose(match);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TrackEvent event={FUNNEL_EVENTS.FACILITIES_VIEWED} />
      <BookingStepIndicator currentStep={2} />
      <div className="section-container py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 font-montserrat text-xs font-semibold text-teal hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Change service or location
          </Link>

          <div className="mb-6 mt-3">
            <h1 className="heading-lg text-navy">Service facilities near you</h1>
            {draft?.service && (
              <p className="mt-2 font-opensans text-sm text-gray-500">
                <span className="font-semibold text-navy">
                  {draft.service.serviceName}
                </span>{" "}
                · within {draft.radius ?? 25} miles of {draft.zipCode}
              </p>
            )}
          </div>

          {/* Honest statement about pricing availability (BUILD sections G and I). */}
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-navy/10 bg-navy/5 p-4">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-navy/50" />
            <p className="font-opensans text-xs leading-relaxed text-gray-600">
              Drive Service Network does not publish an estimated price before the
              facility has seen the vehicle. Choose a facility below, book a real
              appointment time, and the facility will confirm the price for the work.
              Your DSN+ discount is applied to whatever the facility quotes.
            </p>
          </div>

          {/* Controls */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto">
              {SORTS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSort(option.key)}
                  className={cn(
                    "flex-shrink-0 rounded-full px-3 py-1.5 font-montserrat text-xs font-semibold transition-all",
                    sort === option.key
                      ? "bg-navy text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="inline-flex flex-shrink-0 cursor-pointer items-center gap-2 font-opensans text-xs text-gray-600">
              <input
                type="checkbox"
                checked={onlyMatching}
                onChange={(e) => setOnlyMatching(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-teal focus:ring-teal"
              />
              <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
              Only facilities that perform this service
            </label>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <Loader2 className="h-7 w-7 animate-spin text-teal" />
              <p className="font-opensans text-sm text-gray-500">
                Finding facilities and checking live availability…
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <div>
                  <p className="font-montserrat text-sm font-semibold text-red-700">
                    We could not load facilities
                  </p>
                  <p className="mt-1 font-opensans text-sm text-red-600">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => draft && load(draft)}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="font-montserrat text-base font-semibold text-navy">
                No facilities found within {draft?.radius ?? 25} miles
              </p>
              <p className="mx-auto mt-2 max-w-md font-opensans text-sm text-gray-500">
                Try widening the search radius, or contact us and we will find a facility
                for this vehicle.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button variant="outline" size="md" asChild>
                  <Link href="/book">Widen the search</Link>
                </Button>
                <Button variant="primary" size="md" asChild>
                  <Link href="/contact">Contact Drive Service Network</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-3 font-opensans text-xs text-gray-500">
                {visible.length} facilit{visible.length === 1 ? "y" : "ies"} serving{" "}
                {draft?.zipCode}
              </p>
              <div className="space-y-3">
                {visible.map((facility) => (
                  <FacilityCard
                    key={facility.locationId}
                    facility={facility}
                    selected={draft?.facility?.locationId === facility.locationId}
                    onSelect={() => choose(facility)}
                    onViewDetails={() => {
                      trackEvent(FUNNEL_EVENTS.FACILITY_DETAILS_VIEWED, {
                        facilitySlug: facility.slug,
                      });
                      setDetailId(facility.locationId);
                    }}
                  />
                ))}
              </div>
            </>
          )}

          <SavingsCallout
            className="mt-8"
            variant="banner"
            enrolled={false}
            enrollHref={`/membership/join?plan=dsn-plus&vehicleId=${draft?.vehicleId ?? ""}&returnTo=/book/facilities`}
          />
        </div>
      </div>

      {detailId !== null && (
        <FacilityDetailsModal
          locationId={detailId}
          onClose={() => setDetailId(null)}
          onChoose={(slug) => {
            setDetailId(null);
            chooseBySlug(slug);
          }}
        />
      )}
    </div>
  );
}
