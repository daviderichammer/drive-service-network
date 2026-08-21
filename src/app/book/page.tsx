"use client";

/**
 * Step 1 — Vehicle, service and location (Priority 2)
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * The member chooses which of their registered vehicles the work is for, walks
 * the Platform API's guided interview to identify the service, and states where
 * the vehicle is. BUILD Absolute Rule 2 is visible in the interface itself: the
 * vehicle is chosen first and cannot be skipped, because every quote and every
 * booking is tied to a vehicle in the member's profile.
 *
 * The interview questions are the Platform API's own — DSN authors none of them
 * (BUILD section 12). See ServiceInterview for detail.
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, CheckCircle2, ChevronRight, MapPin, Plus, Wrench } from "lucide-react";
import { BookingStepIndicator } from "@/components/booking/BookingStepIndicator";
import {
  ServiceInterview,
  type InterviewResult,
} from "@/components/booking/ServiceInterview";
import { SavingsCallout } from "@/components/dsn-plus/SavingsCallout";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { readBookingDraft, writeBookingDraft } from "@/lib/booking/draft";
import { FUNNEL_EVENTS, trackEvent } from "@/lib/analytics/funnel";
import { TrackEvent } from "@/components/analytics/TrackEvent";
import { cn } from "@/lib/utils";

interface VehicleOption {
  id: string;
  year: number;
  make: string;
  model: string;
  nickname: string | null;
  licensePlate: string | null;
  vin: string | null;
  programStatus: "FREE" | "DSN_PLUS";
  needsStyleRepair?: boolean;
}

const RADIUS_OPTIONS = [
  { value: "10", label: "Within 10 miles" },
  { value: "25", label: "Within 25 miles" },
  { value: "50", label: "Within 50 miles" },
  { value: "100", label: "Within 100 miles" },
];

function vehicleLabel(v: VehicleOption): string {
  const base = `${v.year} ${v.make} ${v.model}`;
  return v.nickname ? `${v.nickname} — ${base}` : base;
}

function BookPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehicleId, setVehicleId] = useState("");

  const [service, setService] = useState<InterviewResult | null>(null);
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState("25");
  const [zipError, setZipError] = useState("");
  const [serviceError, setServiceError] = useState("");

  const initialServiceId = useMemo(() => {
    const raw = searchParams.get("serviceId");
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  // Restore any draft, then apply URL parameters on top.
  useEffect(() => {
    const draft = readBookingDraft();
    if (draft) {
      if (draft.vehicleId) setVehicleId(draft.vehicleId);
      if (draft.zipCode) setZipCode(draft.zipCode);
      if (draft.radius) setRadius(String(draft.radius));
      if (draft.service) setService(draft.service);
    }
    const zipParam = searchParams.get("zip");
    if (zipParam && /^\d{5}$/.test(zipParam)) setZipCode(zipParam);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/vehicles");
        const payload = await res.json();
        if (cancelled) return;
        const list: VehicleOption[] = Array.isArray(payload.vehicles) ? payload.vehicles : [];
        setVehicles(list);
        setVehicleId((current) => current || (list.length === 1 ? list[0].id : ""));
      } catch {
        if (!cancelled) setVehicles([]);
      } finally {
        if (!cancelled) setVehiclesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // A member's default service ZIP is the ZIP the vehicle is registered at,
  // which is the common case and saves them typing it again.
  useEffect(() => {
    if (zipCode || !vehicleId) return;
    (async () => {
      try {
        const res = await fetch(`/api/dashboard/vehicles/${vehicleId}`);
        if (!res.ok) return;
        const payload = await res.json();
        const zip = payload?.vehicle?.zipCode;
        if (zip && /^\d{5}$/.test(zip)) setZipCode(zip);
      } catch {
        // Optional convenience only.
      }
    })();
  }, [vehicleId, zipCode]);

  const onInterviewComplete = useCallback((result: InterviewResult) => {
    setService(result);
    setServiceError("");
    trackEvent(FUNNEL_EVENTS.SERVICE_SELECTED, {
      serviceId: result.serviceId,
      serviceName: result.serviceName,
      category: result.categoryName,
      questionsAnswered: result.interview.length,
    });
  }, []);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId) ?? null;

  function handleContinue() {
    let valid = true;
    if (!vehicleId) {
      valid = false;
    }
    if (selectedVehicle?.needsStyleRepair) {
      router.push("/dashboard/vehicles");
      return;
    }
    if (!service) {
      setServiceError("Please choose the service you need.");
      valid = false;
    }
    if (!/^\d{5}$/.test(zipCode.trim())) {
      setZipError("Please enter a valid five-digit ZIP code.");
      valid = false;
    } else {
      setZipError("");
    }
    if (!valid) return;

    // A changed vehicle, service or ZIP must create a fresh upstream request;
    // retaining a prior offer would associate an estimate with the wrong work.
    writeBookingDraft({
      vehicleId,
      zipCode: zipCode.trim(),
      radius: Number(radius),
      service,
      serviceRequestId: null,
      facility: null,
      scheduledTime: undefined,
      scheduledLabel: undefined,
      step: 2,
    });
    trackEvent(FUNNEL_EVENTS.FACILITIES_VIEWED, {
      serviceId: service?.serviceId,
      radius: Number(radius),
    });
    router.push("/book/facilities");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TrackEvent event={FUNNEL_EVENTS.QUOTE_STARTED} />
      <BookingStepIndicator currentStep={1} />
      <div className="section-container py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="heading-lg mb-2 text-navy">What does your vehicle need?</h1>
            <p className="font-opensans text-gray-500">
              Choose the vehicle, tell us what is happening, and we will show you the
              service facilities near you with real appointment times.
            </p>
          </div>

          {/* 1 — Vehicle. BUILD Absolute Rule 2. */}
          <section className="mb-6 rounded-xl bg-white p-6 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-montserrat text-base font-semibold text-navy">
              <Car className="h-4 w-4 text-teal" />
              Which vehicle?
            </h2>

            {vehiclesLoading ? (
              <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
            ) : vehicles.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center">
                <p className="font-opensans text-sm text-gray-600">
                  Add a vehicle to your profile first. Every quote and booking is tied to a
                  specific vehicle so pricing and service history stay accurate.
                </p>
                <Button variant="gold" size="md" className="mt-4" asChild>
                  <Link href="/dashboard/vehicles/new?returnTo=/book">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add my vehicle
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {vehicles.map((vehicle) => {
                  const active = vehicle.id === vehicleId;
                  const needsStyleRepair = Boolean(vehicle.needsStyleRepair);
                  return (
                    <button
                      key={vehicle.id}
                      onClick={() => {
                        if (needsStyleRepair) {
                          router.push("/dashboard/vehicles");
                          return;
                        }
                        setVehicleId(vehicle.id);
                      }}
                      className={cn(
                        "flex items-start justify-between gap-3 rounded-lg border p-4 text-left transition-all",
                        needsStyleRepair
                          ? "border-amber-200 bg-amber-50 hover:border-amber-400"
                          : active
                            ? "border-teal bg-teal/5 ring-1 ring-teal/30"
                            : "border-gray-200 hover:border-teal/40"
                      )}
                    >
                      <div>
                        <div className="font-montserrat text-sm font-semibold text-navy">
                          {vehicleLabel(vehicle)}
                        </div>
                        <div className="mt-0.5 font-opensans text-xs text-gray-400">
                          {vehicle.licensePlate
                            ? `Plate ${vehicle.licensePlate}`
                            : vehicle.vin
                              ? `VIN …${vehicle.vin.slice(-6)}`
                              : "Registered vehicle"}
                        </div>
                        {needsStyleRepair && (
                          <span className="mt-1.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-amber-800">
                            Confirm trim before quotes
                          </span>
                        )}
                        {vehicle.programStatus === "DSN_PLUS" && (
                          <span className="mt-1.5 inline-block rounded bg-teal/10 px-1.5 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-teal">
                            DSN+ enrolled
                          </span>
                        )}
                      </div>
                      {active && (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-teal" />
                      )}
                    </button>
                  );
                })}
                <Link
                  href="/dashboard/vehicles/new?returnTo=/book"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 p-4 font-montserrat text-sm font-semibold text-gray-500 transition-colors hover:border-teal hover:text-teal"
                >
                  <Plus className="h-4 w-4" />
                  Add another vehicle
                </Link>
              </div>
            )}
          </section>

          {/* 2 — Service, via the Platform API's own interview. */}
          <section className="mb-6 rounded-xl bg-white p-6 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-montserrat text-base font-semibold text-navy">
              <Wrench className="h-4 w-4 text-teal" />
              What is the vehicle doing?
            </h2>

            {service ? (
              <div className="rounded-lg border border-teal/30 bg-teal/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-montserrat text-sm font-bold text-navy">
                      {service.serviceName}
                    </p>
                    {service.path.length > 0 && (
                      <p className="mt-1 font-opensans text-xs text-gray-500">
                        {service.path.join(" › ")}
                      </p>
                    )}
                    {service.interview.length > 0 && (
                      <dl className="mt-3 space-y-1">
                        {service.interview.map((qa, i) => (
                          <div key={i} className="font-opensans text-xs">
                            <dt className="inline text-gray-500">{qa.question} </dt>
                            <dd className="inline font-semibold text-navy">{qa.answer}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                  <button
                    onClick={() => setService(null)}
                    className="flex-shrink-0 font-montserrat text-xs font-semibold text-teal hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <>
                {serviceError && (
                  <p className="mb-3 font-opensans text-sm text-red-600">{serviceError}</p>
                )}
                <ServiceInterview
                  onComplete={onInterviewComplete}
                  initialServiceId={initialServiceId}
                />
              </>
            )}
          </section>

          {/* 3 — Location. */}
          <section className="rounded-xl bg-white p-6 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-montserrat text-base font-semibold text-navy">
              <MapPin className="h-4 w-4 text-teal" />
              Where is the vehicle?
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="ZIP code"
                placeholder="e.g. 02138"
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value.replace(/[^\d-]/g, "").slice(0, 10));
                  if (zipError) setZipError("");
                }}
                error={zipError}
                inputMode="numeric"
                maxLength={10}
                required
              />
              <Select
                label="Search radius"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                options={RADIUS_OPTIONS}
              />
            </div>
          </section>

          {/* DSN+ enrollment nudge — carried through the workflow (P3). */}
          {selectedVehicle && selectedVehicle.programStatus !== "DSN_PLUS" && (
            <SavingsCallout
              className="mt-6"
              variant="banner"
              enrolled={false}
              enrollHref={`/membership/join?plan=dsn-plus&vehicleId=${selectedVehicle.id}&returnTo=/book`}
            />
          )}

          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinue}
              disabled={vehicles.length === 0 || Boolean(selectedVehicle?.needsStyleRepair)}
              className="w-full sm:w-auto"
            >
              Find service facilities
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <BookingStepIndicator currentStep={1} />
        </div>
      }
    >
      <BookPageInner />
    </Suspense>
  );
}

