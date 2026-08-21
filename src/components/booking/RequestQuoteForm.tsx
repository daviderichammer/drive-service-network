"use client";

/**
 * Request pricing — final step of the Priority 1 quote flow.
 *
 * BUILD Absolute Rule 2: the member must pick a vehicle from their own profile.
 * BUILD sections G and I: no price, saving or availability is displayed unless
 * it came from the Platform API. Because service-request generation is not yet
 * entitled for partner 116 (FLAG F-1), this step submits the request for DSN
 * follow-up rather than showing invented estimates.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Car, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface VehicleOption {
  id: string;
  year: number;
  make: string;
  model: string;
  nickname?: string | null;
  licensePlate?: string | null;
  vin?: string | null;
}

interface StoredFlow {
  zipCode?: string;
  selectedServiceId?: number;
  selectedServiceName?: string;
  selectedShopName?: string;
  selectedShopCity?: string;
  selectedShopState?: string;
}

export function RequestQuoteForm({ vehicles }: { vehicles: VehicleOption[] }) {
  const [flow, setFlow] = useState<StoredFlow>({});
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ message: string } | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("dsn_booking_flow");
      if (stored) setFlow(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!vehicleId) {
      setError("Please choose the vehicle this work is for.");
      return;
    }
    if (!flow.selectedServiceId || !flow.zipCode) {
      setError(
        "We lost track of your service selection. Please start again from the beginning."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          serviceZipCode: flow.zipCode,
          services: [
            {
              serviceId: flow.selectedServiceId,
              serviceName: flow.selectedServiceName,
            },
          ],
          notes: notes.trim() || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "We could not submit that request.");
        return;
      }
      sessionStorage.removeItem("dsn_booking_flow");
      setSubmitted({ message: body.message });
    } catch {
      setError("We could not submit that request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal/10">
          <CheckCircle2 className="h-7 w-7 text-teal" />
        </div>
        <h2 className="mt-5 font-montserrat text-xl font-bold text-navy">
          Request received
        </h2>
        <p className="mx-auto mt-3 max-w-md font-opensans text-sm leading-relaxed text-gray-500">
          {submitted.message}
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="gold" asChild>
            <Link href="/dashboard">Go to my dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/book">Request another service</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="font-opensans text-sm text-red-700">{error}</p>
        </div>
      )}

      {(flow.selectedServiceName || flow.selectedShopName) && (
        <dl className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
          {flow.selectedServiceName && (
            <div className="flex justify-between gap-4 py-1">
              <dt className="font-opensans text-sm text-gray-500">Service</dt>
              <dd className="text-right font-opensans text-sm font-semibold text-navy">
                {flow.selectedServiceName}
              </dd>
            </div>
          )}
          {flow.selectedShopName && (
            <div className="flex justify-between gap-4 py-1">
              <dt className="font-opensans text-sm text-gray-500">Preferred facility</dt>
              <dd className="text-right font-opensans text-sm font-semibold text-navy">
                {flow.selectedShopName}
                {flow.selectedShopCity && (
                  <span className="block font-normal text-gray-400">
                    {flow.selectedShopCity}, {flow.selectedShopState}
                  </span>
                )}
              </dd>
            </div>
          )}
          {flow.zipCode && (
            <div className="flex justify-between gap-4 py-1">
              <dt className="font-opensans text-sm text-gray-500">Service location</dt>
              <dd className="text-right font-opensans text-sm font-semibold text-navy">
                {flow.zipCode}
              </dd>
            </div>
          )}
        </dl>
      )}

      <div>
        <label className="mb-2 block font-montserrat text-sm font-bold uppercase tracking-wide text-navy">
          Which vehicle is this for?
        </label>
        <div className="space-y-2">
          {vehicles.map((v) => (
            <label
              key={v.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3.5 transition-colors ${
                vehicleId === v.id
                  ? "border-teal bg-teal/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="vehicleId"
                value={v.id}
                checked={vehicleId === v.id}
                onChange={() => setVehicleId(v.id)}
                className="mt-1 h-4 w-4 accent-teal"
              />
              <Car className="mt-0.5 h-4 w-4 flex-shrink-0 text-navy/40" />
              <span>
                <span className="block font-montserrat text-sm font-semibold text-navy">
                  {v.year} {v.make} {v.model}
                </span>
                <span className="mt-0.5 block font-opensans text-xs text-gray-400">
                  {[v.nickname, v.licensePlate, v.vin ? `VIN ${v.vin.slice(-8)}` : null]
                    .filter(Boolean)
                    .join(" · ") || "No plate or VIN on file"}
                </span>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-3 font-opensans text-xs text-gray-400">
          Not the right vehicle?{" "}
          <Link href="/dashboard/vehicles/new" className="text-teal hover:underline">
            Add another vehicle
          </Link>
          .
        </p>
      </div>

      <div>
        <label className="mb-1.5 block font-opensans text-sm font-medium text-navy">
          Anything the shop should know?{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 font-opensans text-sm text-navy placeholder-gray-400 transition-colors focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          placeholder="Noise when braking at low speed, started about a week ago."
        />
      </div>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        loading={submitting}
        className="w-full"
      >
        Submit My Request
      </Button>
    </form>
  );
}
