"use client";

/**
 * Vehicle card — REVAMP BUILD "Vehicle Profile Table".
 *
 * Displays each registered vehicle with its FREE membership status and its
 * DSN+ discount-program status shown separately, so that the member can never
 * confuse "registered" with "enrolled".
 */

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Loader2, Trash2, Wrench } from "lucide-react";
import { VehicleStyleRepair } from "@/components/vehicles/VehicleStyleRepair";

export interface VehicleCardData {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  color?: string | null;
  engine?: string | null;
  vin?: string | null;
  licensePlate?: string | null;
  mileage?: number | null;
  nickname?: string | null;
  programStatus: string;
  needsStyleRepair?: boolean;
}

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [repairingStyle, setRepairingStyle] = useState(false);

  const enrolled = vehicle.programStatus === "DSN_PLUS";

  const remove = async () => {
    setRemoving(true);
    try {
      const res = await fetch(`/api/dashboard/vehicles/${vehicle.id}`, {
        method: "DELETE",
      });
      const body = await res.json();
      if (!res.ok) {
        setNotice(body.error || "We could not remove that vehicle.");
        return;
      }
      if (body.enrollmentRequiresReview) {
        setNotice(
          "This vehicle had an active discount subscription. Please contact Drive Service Network so we can review it with you."
        );
        setTimeout(() => router.refresh(), 4000);
        return;
      }
      router.refresh();
    } catch {
      setNotice("We could not remove that vehicle. Please try again.");
    } finally {
      setRemoving(false);
      setConfirming(false);
    }
  };

  const detail = (label: string, value?: string | number | null) => (
    <div>
      <dt className="font-opensans text-[11px] uppercase tracking-wider text-gray-400">
        {label}
      </dt>
      <dd className="mt-0.5 font-opensans text-sm text-navy">
        {value === null || value === undefined || value === "" ? (
          <span className="text-gray-300">Not provided</span>
        ) : (
          value
        )}
      </dd>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-navy/5">
            <Car className="h-5 w-5 text-navy/60" />
          </div>
          <div>
            <h3 className="font-montserrat text-base font-bold text-navy">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            {vehicle.nickname && (
              <p className="mt-0.5 font-opensans text-xs text-gray-500">
                {vehicle.nickname}
              </p>
            )}
            {vehicle.trim && (
              <p className="mt-0.5 font-opensans text-xs text-gray-400">
                {vehicle.trim}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="Remove vehicle"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-teal/10 px-2.5 py-1 font-montserrat text-[11px] font-semibold uppercase tracking-wide text-teal">
          Free membership
        </span>
        <span
          className={`rounded-full px-2.5 py-1 font-montserrat text-[11px] font-semibold uppercase tracking-wide ${
            enrolled ? "bg-gold/15 text-gold-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {enrolled ? "Discount program: enrolled" : "Discount program: not enrolled"}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
        {detail("Colour", vehicle.color)}
        {detail("Engine", vehicle.engine)}
        {detail("Plate", vehicle.licensePlate)}
        {detail("Mileage", vehicle.mileage ? vehicle.mileage.toLocaleString() : null)}
        <div className="col-span-2 sm:col-span-1">
          <dt className="font-opensans text-[11px] uppercase tracking-wider text-gray-400">
            VIN
          </dt>
          <dd className="mt-0.5 break-all font-mono text-xs text-navy">
            {vehicle.vin || <span className="font-opensans text-gray-300">Not provided</span>}
          </dd>
        </div>
      </dl>

      {vehicle.needsStyleRepair && !repairingStyle && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-montserrat text-sm font-bold text-navy">Trim confirmation required</p>
          <p className="mt-1 font-opensans text-sm text-amber-900">
            Confirm this vehicle&apos;s trim before requesting quotes so facilities can price the correct parts and labor.
          </p>
          <button
            type="button"
            onClick={() => setRepairingStyle(true)}
            className="mt-3 inline-flex items-center gap-1.5 font-montserrat text-sm font-semibold text-amber-800 hover:text-amber-950 hover:underline"
          >
            <Wrench className="h-4 w-4" /> Confirm trim
          </button>
        </div>
      )}

      {vehicle.needsStyleRepair && repairingStyle && (
        <VehicleStyleRepair
          vehicle={vehicle}
          onComplete={() => {
            setRepairingStyle(false);
            setNotice("Trim confirmed. This vehicle is ready for accurate facility quotes.");
            router.refresh();
          }}
        />
      )}

      {notice && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 font-opensans text-xs text-amber-800">
          {notice}
        </p>
      )}

      {confirming && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-opensans text-sm text-red-800">
            Remove this vehicle from your fleet? Your service history for this vehicle
            is kept on file.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={remove}
              disabled={removing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 font-montserrat text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {removing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Remove vehicle
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 font-montserrat text-xs font-semibold text-navy transition-colors hover:bg-gray-50"
            >
              Keep vehicle
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-gray-100 pt-4">
        {vehicle.needsStyleRepair ? (
          <button
            type="button"
            onClick={() => setRepairingStyle(true)}
            className="font-montserrat text-sm font-semibold text-amber-800 transition-colors hover:text-amber-950"
          >
            Confirm trim to unlock quotes →
          </button>
        ) : (
          <Link
            href={`/book?vehicleId=${vehicle.id}`}
            className="font-montserrat text-sm font-semibold text-teal transition-colors hover:text-teal-600"
          >
            Get a quote for this vehicle →
          </Link>
        )}
      </div>
    </div>
  );
}
