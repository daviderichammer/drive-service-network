"use client";

/**
 * Step 2 — Compare real facility estimates.
 *
 * A selected vehicle, service and location create one member-owned service
 * request. While the network collects offers, this page polls the DSN offers
 * endpoint. Only facilities that have returned a real estimate are displayed;
 * the existing scheduling flow begins after the member chooses an offer.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  TimerReset,
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

type SortKey = "price" | "distance" | "rating" | "availability";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "price", label: "Lowest estimate" },
  { key: "distance", label: "Closest" },
  { key: "rating", label: "Highest rated" },
  { key: "availability", label: "Soonest available" },
];

const DEFAULT_POLL_INTERVAL_MS = 2_500;

interface OfferFacility {
  slug: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string | null;
  mobileMechanic: boolean;
  amenities: string[];
  certifications: string[];
  customerPerks: string[];
  warrantyOverview: string | null;
}

interface EstimateOffer {
  offerId: number;
  locationId: number;
  businessName: string;
  city: string;
  state: string;
  distanceMiles: number | null;
  rating: number | null;
  reviewCount: number | null;
  standardPriceCents: number | null;
  dsnPlusPriceCents: number | null;
  dsnPlusSavingsCents: number | null;
  facility: OfferFacility | null;
}

interface OffersPayload {
  status?: string;
  ready?: boolean;
  retryable?: boolean;
  pollAfterMs?: number | null;
  offers?: EstimateOffer[];
  error?: string;
}

function toFacilityCard(offer: EstimateOffer): FacilityCardData | null {
  const facility = offer.facility;
  if (!facility?.slug || typeof offer.standardPriceCents !== "number") return null;
  return {
    locationId: offer.locationId,
    slug: facility.slug,
    name: facility.name || offer.businessName,
    address: facility.address,
    city: facility.city || offer.city,
    state: facility.state || offer.state,
    zipcode: facility.zipcode,
    distanceMiles: offer.distanceMiles,
    rating: offer.rating,
    reviewCount: offer.reviewCount,
    mobileMechanic: facility.mobileMechanic,
    phone: facility.phone,
    amenities: facility.amenities,
    certifications: facility.certifications,
    customerPerks: facility.customerPerks,
    warrantyOverview: facility.warrantyOverview,
    hours: null,
    // A facility only appears in this list after it has quoted the requested work.
    performsRequestedServices: true,
    standardPriceCents: offer.standardPriceCents,
    dsnPlusPriceCents: offer.dsnPlusPriceCents,
    dsnPlusSavingsCents: offer.dsnPlusSavingsCents,
    openbayOfferId: offer.offerId,
  };
}

export default function FacilitiesPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [serviceRequestId, setServiceRequestId] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<FacilityCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [awaitingOffers, setAwaitingOffers] = useState(false);
  const [autoPolling, setAutoPolling] = useState(false);
  const [pollAfterMs, setPollAfterMs] = useState(DEFAULT_POLL_INTERVAL_MS);
  const [pricingMessage, setPricingMessage] = useState(
    "Sending your request to nearby service facilities…"
  );
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("price");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [onlyMatching, setOnlyMatching] = useState(false);

  const addAvailability = useCallback(async (cards: FacilityCardData[]) => {
    const leaders = cards.filter((facility) => facility.slug).slice(0, 8);
    const counts = await Promise.all(
      leaders.map(async (facility) => {
        try {
          const response = await fetch(
            `/api/platform/availability?slug=${encodeURIComponent(facility.slug)}&days=14`
          );
          const payload = await response.json();
          return { slug: facility.slug, count: Number(payload.totalSlots ?? 0) };
        } catch {
          return { slug: facility.slug, count: null };
        }
      })
    );
    const bySlug = new Map(counts.map((item) => [item.slug, item.count]));
    setFacilities((current) =>
      current.map((facility) =>
        bySlug.has(facility.slug)
          ? { ...facility, openSlots: bySlug.get(facility.slug) ?? null }
          : facility
      )
    );
  }, []);

  const refreshOffers = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/service-requests/${encodeURIComponent(id)}/offers`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as OffersPayload;

        // A 409 means a legacy profile or vehicle still needs upstream linkage.
        // It is intentionally not treated as a generic technical failure.
        if (response.status === 409) {
          setAwaitingOffers(true);
          setAutoPolling(false);
          setPricingMessage(
            payload.error ??
              "We are preparing your profile for facility estimates. Please retry in a moment."
          );
          return false;
        }
        if (!response.ok) {
          setAutoPolling(false);
          setError(payload.error ?? "We could not collect facility estimates. Please try again.");
          return false;
        }

        const cards = (payload.offers ?? [])
          .map(toFacilityCard)
          .filter((facility): facility is FacilityCardData => Boolean(facility));

        if (cards.length > 0) {
          setFacilities(cards);
          setAwaitingOffers(false);
          setAutoPolling(false);
          setPricingMessage("Real facility estimates are ready. Compare price, reviews and availability.");
          void addAvailability(cards);
          return true;
        }

        setFacilities([]);
        setAwaitingOffers(true);
        setAutoPolling(true);
        setPollAfterMs(
          typeof payload.pollAfterMs === "number"
            ? Math.max(payload.pollAfterMs, 1_000)
            : DEFAULT_POLL_INTERVAL_MS
        );
        setPricingMessage(
          "Your request is with nearby facilities. We will refresh this page automatically as estimates arrive."
        );
        return false;
      } catch {
        setAutoPolling(false);
        setError("We could not collect facility estimates. Please try again.");
        return false;
      }
    },
    [addAvailability]
  );

  const beginPricing = useCallback(
    async (current: BookingDraft, forceNewRequest = false) => {
      if (!current.zipCode || !current.service || !current.vehicleId) {
        router.replace("/book");
        return;
      }

      setLoading(true);
      setError(null);
      setFacilities([]);
      setAwaitingOffers(false);
      setAutoPolling(false);
      setPricingMessage("Sending your request to nearby service facilities…");

      try {
        let id = forceNewRequest ? null : current.serviceRequestId ?? null;
        if (!id) {
          const response = await fetch("/api/service-requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vehicleId: current.vehicleId,
              serviceZipCode: current.zipCode,
              services: [
                {
                  serviceId: current.service.serviceId,
                  serviceName: current.service.serviceName,
                  interview: current.service.interview,
                },
              ],
            }),
          });
          const payload = await response.json();
          if (!response.ok && response.status !== 202) {
            setError(payload.error ?? "We could not request facility estimates. Please try again.");
            return;
          }
          id = typeof payload.id === "string" ? payload.id : null;
          if (!id) {
            setError("We could not start the estimate request. Please try again.");
            return;
          }

          const nextDraft = writeBookingDraft({
            serviceRequestId: id,
            facility: null,
            scheduledTime: undefined,
            scheduledLabel: undefined,
            step: 2,
          });
          setDraft(nextDraft);
          setServiceRequestId(id);

          if (response.status === 202) {
            setAwaitingOffers(true);
            setAutoPolling(false);
            setPricingMessage(
              payload.message ??
                "We are preparing your profile for facility estimates. Please retry in a moment."
            );
            return;
          }
        } else {
          setServiceRequestId(id);
        }

        await refreshOffers(id);
      } catch {
        setError("We could not start the estimate request. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [refreshOffers, router]
  );

  useEffect(() => {
    const stored = readBookingDraft();
    if (!stored?.zipCode || !stored?.service || !stored?.vehicleId) {
      router.replace("/book");
      return;
    }
    setDraft(stored);
    void beginPricing(stored);
  }, [beginPricing, router]);

  useEffect(() => {
    if (!autoPolling || !serviceRequestId || facilities.length > 0) return;
    const timer = window.setTimeout(() => {
      void refreshOffers(serviceRequestId);
    }, pollAfterMs);
    return () => window.clearTimeout(timer);
  }, [autoPolling, facilities.length, pollAfterMs, refreshOffers, serviceRequestId]);

  const visible = useMemo(() => {
    let list = [...facilities];
    if (onlyMatching) {
      list = list.filter((facility) => facility.performsRequestedServices !== false);
    }
    switch (sort) {
      case "price":
        list.sort(
          (a, b) =>
            (a.standardPriceCents ?? Number.MAX_SAFE_INTEGER) -
            (b.standardPriceCents ?? Number.MAX_SAFE_INTEGER)
        );
        break;
      case "distance":
        list.sort((a, b) => (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999));
        break;
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "availability":
        list.sort((a, b) => (b.openSlots ?? -1) - (a.openSlots ?? -1));
        break;
    }
    return list;
  }, [facilities, onlyMatching, sort]);

  function choose(facility: FacilityCardData) {
    trackEvent(FUNNEL_EVENTS.BOOKING_STARTED, {
      facilitySlug: facility.slug,
      distanceMiles: facility.distanceMiles,
      serviceId: draft?.service?.serviceId,
      standardPriceCents: facility.standardPriceCents,
      offerId: facility.openbayOfferId,
    });
    writeBookingDraft({
      serviceRequestId,
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
        standardPriceCents: facility.standardPriceCents,
        dsnPlusPriceCents: facility.dsnPlusPriceCents,
        dsnPlusSavingsCents: facility.dsnPlusSavingsCents,
        openbayOfferId: facility.openbayOfferId,
      },
      step: 3,
    });
    router.push("/book/schedule");
  }

  function chooseBySlug(slug: string) {
    const match = facilities.find((facility) => facility.slug === slug);
    if (match) choose(match);
  }

  async function retry() {
    const current = readBookingDraft() ?? draft;
    if (!current) return;
    const reset = writeBookingDraft({
      serviceRequestId: null,
      facility: null,
      scheduledTime: undefined,
      scheduledLabel: undefined,
      step: 2,
    });
    setDraft(reset);
    setServiceRequestId(null);
    await beginPricing(reset, true);
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
            <h1 className="heading-lg text-navy">Facility estimates near you</h1>
            {draft?.service && (
              <p className="mt-2 font-opensans text-sm text-gray-500">
                <span className="font-semibold text-navy">{draft.service.serviceName}</span> · within{" "}
                {draft.radius ?? 25} miles of {draft.zipCode}
              </p>
            )}
          </div>

          <div className="mb-6 rounded-lg border border-teal/20 bg-teal/5 p-4">
            <p className="font-opensans text-sm leading-relaxed text-gray-700">
              Estimates below are supplied by the facilities responding to your request. Every
              card shows the facility&apos;s FREE price and the DSN+ price after the 10% member
              discount. The facility confirms the final scope of work before service.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <Loader2 className="h-7 w-7 animate-spin text-teal" />
              <p className="font-opensans text-sm text-gray-500">{pricingMessage}</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <div>
                  <p className="font-montserrat text-sm font-semibold text-red-700">
                    We could not collect facility estimates
                  </p>
                  <p className="mt-1 font-opensans text-sm text-red-600">{error}</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => void retry()}>
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Retry estimate request
                  </Button>
                </div>
              </div>
            </div>
          ) : awaitingOffers ? (
            <div className="rounded-xl border border-teal/20 bg-white p-8 text-center shadow-card">
              <TimerReset className="mx-auto h-7 w-7 text-teal" />
              <p className="mt-3 font-montserrat text-base font-semibold text-navy">
                We are collecting competitive facility estimates
              </p>
              <p className="mx-auto mt-2 max-w-lg font-opensans text-sm leading-relaxed text-gray-500">
                {pricingMessage}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => serviceRequestId && void refreshOffers(serviceRequestId)}
                  disabled={!serviceRequestId}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Refresh estimates
                </Button>
                {!autoPolling && (
                  <Button variant="primary" size="md" onClick={() => void retry()}>
                    Retry estimate request
                  </Button>
                )}
              </div>
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="font-montserrat text-base font-semibold text-navy">
                No facility estimates have arrived yet
              </p>
              <p className="mx-auto mt-2 max-w-md font-opensans text-sm text-gray-500">
                We will continue checking for real facility estimates for this vehicle and service.
              </p>
              <Button variant="outline" size="md" className="mt-5" onClick={() => void retry()}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Send a fresh request
              </Button>
            </div>
          ) : (
            <>
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
                    onChange={(event) => setOnlyMatching(event.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-teal focus:ring-teal"
                  />
                  <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
                  Only facilities that perform this service
                </label>
              </div>

              <p className="mb-3 font-opensans text-xs text-gray-500">
                {visible.length} real facilit{visible.length === 1 ? "y estimate" : "y estimates"} for{" "}
                {draft?.zipCode}
              </p>
              <div className="space-y-3">
                {visible.map((facility) => (
                  <FacilityCard
                    key={facility.openbayOfferId ?? facility.locationId}
                    facility={facility}
                    selected={draft?.facility?.openbayOfferId === facility.openbayOfferId}
                    onSelect={() => choose(facility)}
                    onViewDetails={() => {
                      trackEvent(FUNNEL_EVENTS.FACILITY_DETAILS_VIEWED, {
                        facilitySlug: facility.slug,
                        offerId: facility.openbayOfferId,
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
            standardCents={visible[0]?.standardPriceCents ?? null}
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
