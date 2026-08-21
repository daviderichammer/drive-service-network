"use client";

/**
 * Safety recalls — Priority 4
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * BUILD section 24. The Openbay Platform API carries no recall data, so Drive
 * Service Network sources open campaigns from the U.S. National Highway Traffic
 * Safety Administration and attributes them plainly.
 *
 * Two things this page refuses to do. It does not claim a recall has been
 * completed — only the member or the repairing dealer can know that, and
 * getting it wrong on a safety notice would be indefensible. And it does not
 * quietly show nothing when the lookup fails; a member must never be left
 * believing their vehicle is clear because a request timed out.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Car,
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Recall {
  id: string;
  campaignNumber: string;
  component: string | null;
  summary: string | null;
  consequence: string | null;
  remedy: string | null;
  manufacturer: string | null;
  reportReceivedDate: string | null;
  acknowledgedAt: string | null;
}

interface RecallGroup {
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    nickname: string | null;
  };
  checkedAt: string | null;
  stale: boolean;
  recalls: Recall[];
}

export default function RecallsPage() {
  const [groups, setGroups] = useState<RecallGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async (force = false) => {
    try {
      if (force) setRefreshing(true);
      const res = await fetch(`/api/recalls${force ? "?refresh=1" : ""}`);
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "We could not check for recalls.");
        return;
      }
      setGroups(Array.isArray(payload.results) ? payload.results : []);
      setError(null);
    } catch {
      setError(
        "We could not reach the national recall database. Your vehicles have not been checked — please try again shortly."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function acknowledge(recallId: string) {
    try {
      await fetch("/api/recalls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recallId }),
      });
      await load();
    } catch {
      setError("We could not update that recall.");
    }
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const openCount = groups.reduce(
    (sum, g) => sum + g.recalls.filter((r) => !r.acknowledgedAt).length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-navy">Safety Recalls</h1>
          <p className="mt-1 font-opensans text-sm text-gray-500">
            Open manufacturer recall campaigns for your registered vehicles.
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => load(true)}
          disabled={refreshing}
        >
          <RefreshCw
            className={cn("mr-1.5 h-4 w-4", refreshing && "animate-spin")}
          />
          Check again
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 className="h-7 w-7 animate-spin text-teal" />
          <p className="font-opensans text-sm text-gray-500">
            Checking the national recall database…
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <p className="font-opensans text-sm text-red-700">{error}</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-card">
          <Car className="mx-auto mb-3 h-12 w-12 text-gray-200" />
          <p className="font-montserrat text-sm font-semibold text-navy">
            No vehicles registered
          </p>
          <Button variant="primary" size="sm" className="mt-4" asChild>
            <Link href="/dashboard/vehicles/new">Add a vehicle</Link>
          </Button>
        </div>
      ) : (
        <>
          {openCount > 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-montserrat text-sm font-bold text-red-800">
                  {openCount} open recall{openCount === 1 ? "" : "s"} across your fleet
                </p>
                <p className="mt-1 font-opensans text-sm leading-relaxed text-red-700">
                  Recall work is performed free of charge by a franchised dealer for the
                  manufacturer. Contact a dealer with the campaign number below.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-teal/30 bg-teal/5 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal" />
              <p className="font-opensans text-sm text-gray-700">
                No open recalls were found for your registered vehicles.
              </p>
            </div>
          )}

          {groups.map((group) => (
            <section
              key={group.vehicle.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/5">
                    <Car className="h-4 w-4 text-navy/60" />
                  </div>
                  <div>
                    <p className="font-montserrat text-sm font-bold text-navy">
                      {group.vehicle.year} {group.vehicle.make} {group.vehicle.model}
                    </p>
                    <p className="font-opensans text-xs text-gray-400">
                      {group.checkedAt
                        ? `Checked ${new Date(group.checkedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}`
                        : "Not yet checked"}
                      {group.stale && " · last known results shown"}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wide",
                    group.recalls.filter((r) => !r.acknowledgedAt).length > 0
                      ? "bg-red-50 text-red-600"
                      : "bg-teal/10 text-teal"
                  )}
                >
                  {group.recalls.filter((r) => !r.acknowledgedAt).length} open
                </span>
              </div>

              {group.recalls.length === 0 ? (
                <p className="px-5 py-6 text-center font-opensans text-sm text-gray-500">
                  No recalls on record for this vehicle.
                </p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {group.recalls.map((recall) => {
                    const open = expanded.has(recall.id);
                    return (
                      <li key={recall.id} className="px-5 py-4">
                        <button
                          onClick={() => toggle(recall.id)}
                          className="flex w-full items-start justify-between gap-3 text-left"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-montserrat text-sm font-semibold text-navy">
                                {recall.component ?? "Safety recall"}
                              </span>
                              {recall.acknowledgedAt && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                  <Check className="h-2.5 w-2.5" />
                                  Acknowledged
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 font-opensans text-xs text-gray-400">
                              Campaign {recall.campaignNumber}
                              {recall.reportReceivedDate &&
                                ` · issued ${new Date(
                                  recall.reportReceivedDate
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                })}`}
                            </p>
                          </div>
                          <ChevronDown
                            className={cn(
                              "mt-1 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform",
                              open && "rotate-180"
                            )}
                          />
                        </button>

                        {open && (
                          <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
                            {recall.summary && (
                              <div>
                                <p className="font-montserrat text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                  What the manufacturer says
                                </p>
                                <p className="mt-1 font-opensans text-sm leading-relaxed text-gray-700">
                                  {recall.summary}
                                </p>
                              </div>
                            )}
                            {recall.consequence && (
                              <div>
                                <p className="font-montserrat text-[11px] font-bold uppercase tracking-wide text-red-600">
                                  Risk
                                </p>
                                <p className="mt-1 font-opensans text-sm leading-relaxed text-gray-700">
                                  {recall.consequence}
                                </p>
                              </div>
                            )}
                            {recall.remedy && (
                              <div>
                                <p className="font-montserrat text-[11px] font-bold uppercase tracking-wide text-teal">
                                  Remedy
                                </p>
                                <p className="mt-1 font-opensans text-sm leading-relaxed text-gray-700">
                                  {recall.remedy}
                                </p>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-3 pt-1">
                              <a
                                href={`https://www.nhtsa.gov/recalls?nhtsaId=${encodeURIComponent(
                                  recall.campaignNumber
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 font-montserrat text-xs font-semibold text-teal hover:underline"
                              >
                                View on NHTSA
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              {!recall.acknowledgedAt && (
                                <button
                                  onClick={() => acknowledge(recall.id)}
                                  className="font-montserrat text-xs font-semibold text-gray-500 hover:text-navy hover:underline"
                                >
                                  Mark as seen
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}

          <p className="font-opensans text-xs leading-relaxed text-gray-400">
            Recall information is published by the U.S. National Highway Traffic Safety
            Administration. Marking a recall as seen removes it from your alerts; it does
            not mean the work has been carried out. Recall repairs are performed free of
            charge by a manufacturer-franchised dealer, not through Drive Service Network.
          </p>
        </>
      )}
    </div>
  );
}
