"use client";

/**
 * DSN+ enrollment — Priority 3
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * The member chooses WHICH VEHICLES to enrol. That is the whole design: the
 * BUILD is explicit that discount eligibility follows the vehicle, so a member
 * with four vehicles can enrol one and leave three on the free membership, and
 * the interface has to make that obvious rather than implying an account-wide
 * upgrade.
 *
 * Two things are stated honestly on this page. The savings rate is a flat 10%
 * as directed for this release. And no card is taken: BUILD section P reserves
 * the payment architecture, so this records an enrollment request and says so.
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgePercent,
  Car,
  CheckCircle2,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCents } from "@/lib/dsn-plus/discount";
import { FUNNEL_EVENTS, trackEvent } from "@/lib/analytics/funnel";
import { TrackEvent } from "@/components/analytics/TrackEvent";
import { cn } from "@/lib/utils";

interface EnrollVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  nickname: string | null;
  licensePlate: string | null;
  programStatus: "FREE" | "DSN_PLUS";
  currentEnrollment: {
    id: string;
    status: string;
    plan: string;
    enrollmentDate: string;
    effectiveDate: string | null;
    nextBillingDate: string | null;
    monthlyPerVehicleCents: number | null;
  } | null;
}

interface PlanQuote {
  plan: { id: string; label: string; termMonths: number; description: string };
  tier: { id: string; label: string };
  vehicleCount: number;
  monthlyPerVehicleCents: number;
  monthlyTotalCents: number;
  termTotalCents: number;
}

interface Snapshot {
  membershipTier: "FREE" | "DSN_PLUS";
  registeredVehicles: number;
  enrolledVehicles: number;
  pendingEnrollments: number;
  lifetimeSavingsCents: number;
  forgoneSavingsCents: number;
}

const BENEFITS = [
  "A flat 10% off every service, at every facility in the Drive Service Network.",
  "The discount is attached to the vehicle, so it applies no matter who drives it.",
  "Priority handling on appointment requests through Drive Service Network.",
  "Full service and repair history retained for the vehicle, including after enrollment ends.",
];

function DsnPlusPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<EnrollVehicle[]>([]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [planQuotes, setPlanQuotes] = useState<PlanQuote[]>([]);
  const [discountLabel, setDiscountLabel] = useState("10%");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [plan, setPlan] = useState("PREPAID_12");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const returnTo = searchParams.get("returnTo");
  const presetVehicleId = searchParams.get("vehicleId");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dsn-plus/enrollment");
      if (res.status === 401) {
        router.replace(
          `/auth/login?callbackUrl=${encodeURIComponent("/membership/dsn-plus")}`
        );
        return;
      }
      const payload = await res.json();
      const list: EnrollVehicle[] = Array.isArray(payload.vehicles)
        ? payload.vehicles
        : [];
      setVehicles(list);
      setSnapshot(payload.snapshot ?? null);
      setPlanQuotes(Array.isArray(payload.planQuotes) ? payload.planQuotes : []);
      if (payload.discount?.label) setDiscountLabel(payload.discount.label);

      setSelected((current) => {
        if (current.size > 0) return current;
        const next = new Set<string>();
        if (presetVehicleId && list.some((v) => v.id === presetVehicleId)) {
          next.add(presetVehicleId);
        }
        return next;
      });
      setError(null);
    } catch {
      setError("We could not load your vehicles. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, [router, presetVehicleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const eligible = useMemo(
    () => vehicles.filter((v) => v.programStatus !== "DSN_PLUS"),
    [vehicles]
  );
  const enrolled = useMemo(
    () => vehicles.filter((v) => v.programStatus === "DSN_PLUS"),
    [vehicles]
  );

  const activeQuote = planQuotes.find((q) => q.plan.id === plan) ?? planQuotes[0] ?? null;
  const selectedCount = selected.size;
  const monthlyTotal = activeQuote
    ? activeQuote.monthlyPerVehicleCents * selectedCount
    : 0;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    if (selected.size === 0) {
      setError("Choose at least one vehicle to enroll.");
      return;
    }
    setSubmitting(true);
    setError(null);
    trackEvent(FUNNEL_EVENTS.DSN_PLUS_ENROLLMENT_REQUESTED, {
      vehicleCount: selected.size,
      plan,
    });
    try {
      const res = await fetch("/api/dsn-plus/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleIds: Array.from(selected), plan }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not record your enrollment.");
        return;
      }
      trackEvent(FUNNEL_EVENTS.DSN_PLUS_ENROLLMENT_COMPLETED, {
        vehicleCount: selected.size,
        plan,
      });
      setDone(payload.message);
      setSelected(new Set());
      await load();
    } catch {
      setError("We could not reach Drive Service Network. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <TrackEvent event={FUNNEL_EVENTS.DSN_PLUS_VIEWED} />
      <div className="section-container">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 font-montserrat text-xs font-black uppercase tracking-widest text-gold-700">
              <BadgePercent className="h-3.5 w-3.5" />
              DSN+ Discount Program
            </p>
            <h1 className="heading-lg mt-4 text-navy">
              Save {discountLabel} on every service
            </h1>
            <p className="mx-auto mt-3 max-w-xl font-opensans text-gray-600">
              DSN+ is an optional subscription on top of your free Drive Membership.
              You enroll individual vehicles — not your whole account — so you only
              pay for the vehicles that actually need it.
            </p>
          </div>

          {/* Current position */}
          {snapshot && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Registered vehicles", value: String(snapshot.registeredVehicles) },
                { label: "Enrolled in DSN+", value: String(snapshot.enrolledVehicles) },
                {
                  label: "Awaiting activation",
                  value: String(snapshot.pendingEnrollments),
                },
                {
                  label: "Saved with DSN+",
                  value: formatCents(snapshot.lifetimeSavingsCents),
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gray-200 bg-white p-4 text-center"
                >
                  <p className="font-montserrat text-xl font-black text-navy">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 font-opensans text-[11px] leading-tight text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* What the member gets */}
          <section className="mb-6 rounded-xl bg-white p-6 shadow-card">
            <h2 className="font-montserrat text-base font-bold text-navy">
              What DSN+ gives an enrolled vehicle
            </h2>
            <ul className="mt-4 space-y-2.5">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
                  <span className="font-opensans text-sm leading-relaxed text-gray-700">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {done && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-teal/30 bg-teal/5 p-5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal" />
              <div>
                <p className="font-montserrat text-sm font-bold text-navy">
                  Enrollment request received
                </p>
                <p className="mt-1 font-opensans text-sm leading-relaxed text-gray-700">
                  {done}
                </p>
                {returnTo && (
                  <Link
                    href={returnTo}
                    className="mt-3 inline-flex items-center gap-1.5 font-montserrat text-sm font-bold text-teal hover:underline"
                  >
                    Continue where you left off
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Vehicle picker */}
          <section className="mb-6 rounded-xl bg-white p-6 shadow-card">
            <h2 className="flex items-center gap-2 font-montserrat text-base font-bold text-navy">
              <Car className="h-4 w-4 text-teal" />
              Which vehicles?
            </h2>

            {loading ? (
              <div className="mt-4 space-y-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-5 text-center">
                <p className="font-opensans text-sm text-gray-600">
                  Add a vehicle to your profile before enrolling in DSN+.
                </p>
                <Button variant="gold" size="md" className="mt-4" asChild>
                  <Link href="/dashboard/vehicles/new?returnTo=/membership/dsn-plus">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add my vehicle
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {enrolled.length > 0 && (
                  <div className="mt-4">
                    <p className="font-montserrat text-xs font-bold uppercase tracking-wide text-teal">
                      Already enrolled
                    </p>
                    <div className="mt-2 space-y-2">
                      {enrolled.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-lg border border-teal/30 bg-teal/5 p-3"
                        >
                          <div>
                            <p className="font-montserrat text-sm font-semibold text-navy">
                              {v.year} {v.make} {v.model}
                            </p>
                            <p className="font-opensans text-xs text-gray-500">
                              {v.currentEnrollment?.nextBillingDate
                                ? `Next billing ${new Date(
                                    v.currentEnrollment.nextBillingDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}`
                                : "Active"}
                            </p>
                          </div>
                          <ShieldCheck className="h-4 w-4 text-teal" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {eligible.length > 0 && (
                  <div className="mt-4">
                    <p className="font-montserrat text-xs font-bold uppercase tracking-wide text-gray-500">
                      Available to enroll
                    </p>
                    <div className="mt-2 space-y-2">
                      {eligible.map((v) => {
                        const pending =
                          v.currentEnrollment?.status === "PENDING_PAYMENT";
                        const isSelected = selected.has(v.id);
                        return (
                          <button
                            key={v.id}
                            onClick={() => toggle(v.id)}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left transition-all",
                              isSelected
                                ? "border-gold bg-gold/5 ring-1 ring-gold/30"
                                : "border-gray-200 hover:border-gold/50"
                            )}
                          >
                            <div>
                              <p className="font-montserrat text-sm font-semibold text-navy">
                                {v.nickname ? `${v.nickname} — ` : ""}
                                {v.year} {v.make} {v.model}
                              </p>
                              <p className="mt-0.5 font-opensans text-xs text-gray-500">
                                {v.licensePlate
                                  ? `Plate ${v.licensePlate}`
                                  : "Free membership"}
                                {pending && " · enrollment awaiting activation"}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border",
                                isSelected
                                  ? "border-gold bg-gold"
                                  : "border-gray-300 bg-white"
                              )}
                            >
                              {isSelected && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-navy" />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Plan */}
          {planQuotes.length > 0 && eligible.length > 0 && (
            <section className="mb-6 rounded-xl bg-white p-6 shadow-card">
              <h2 className="font-montserrat text-base font-bold text-navy">
                Choose a payment plan
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {planQuotes.map((quote) => (
                  <button
                    key={quote.plan.id}
                    onClick={() => setPlan(quote.plan.id)}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-all",
                      plan === quote.plan.id
                        ? "border-navy bg-navy/5 ring-1 ring-navy/20"
                        : "border-gray-200 hover:border-navy/40"
                    )}
                  >
                    <p className="font-montserrat text-sm font-bold text-navy">
                      {quote.plan.label}
                    </p>
                    <p className="mt-1 font-montserrat text-lg font-black text-navy">
                      {formatCents(quote.monthlyPerVehicleCents)}
                      <span className="font-opensans text-xs font-normal text-gray-500">
                        {" "}
                        / vehicle / mo
                      </span>
                    </p>
                    <p className="mt-1 font-opensans text-[11px] leading-tight text-gray-500">
                      {quote.plan.description}
                    </p>
                  </button>
                ))}
              </div>

              {selectedCount > 0 && activeQuote && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="font-opensans text-sm text-gray-600">
                    {selectedCount} vehicle{selectedCount === 1 ? "" : "s"} ·{" "}
                    {activeQuote.plan.label}
                  </span>
                  <span className="font-montserrat text-base font-bold text-navy">
                    {formatCents(monthlyTotal)} / month
                  </span>
                </div>
              )}
            </section>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="font-opensans text-sm text-red-700">{error}</p>
            </div>
          )}

          {eligible.length > 0 && (
            <>
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={submit}
                disabled={submitting || selectedCount === 0}
                loading={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Enroll {selectedCount > 0 ? `${selectedCount} ` : ""}vehicle
                    {selectedCount === 1 ? "" : "s"} in DSN+
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Honest statement about payment (BUILD section P). */}
              <p className="mt-4 text-center font-opensans text-xs leading-relaxed text-gray-500">
                No payment is taken on this page. Drive Service Network records your
                enrollment request and a representative confirms billing before DSN+
                becomes active on the vehicle. The discount applies once activated.
              </p>
            </>
          )}

          <p className="mt-6 text-center font-opensans text-xs text-gray-400">
            Questions about the program?{" "}
            <Link href="/discount-program-faq" className="text-teal hover:underline">
              Read the DSN Discount Program FAQ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DsnPlusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-7 w-7 animate-spin text-teal" />
        </div>
      }
    >
      <DsnPlusPageInner />
    </Suspense>
  );
}
