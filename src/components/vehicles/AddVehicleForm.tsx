"use client";

/**
 * Add Vehicle — REVAMP BUILD section 9.
 *
 * Collects Year, Make, Model, Colour, Engine, VIN and Licence Plate. Two entry
 * paths are offered: decode a VIN, or pick the vehicle from the Drive Service
 * Network catalogue (Year → Make → Model → Sub-model → Trim).
 *
 * Colour and engine have no Openbay equivalent and are stored by DSN
 * (see FLAGS_FOR_DAVID.md F-4). The member is never shown that distinction.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Car, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CatalogItem {
  id: number;
  name: string;
}

type Mode = "vin" | "catalog";

const COLORS = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Blue",
  "Red",
  "Green",
  "Brown",
  "Beige",
  "Gold",
  "Orange",
  "Yellow",
  "Purple",
  "Other",
];

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors disabled:bg-gray-50 disabled:text-gray-400";

const labelClass = "block font-opensans text-sm font-medium text-navy mb-1.5";

export function AddVehicleForm({
  returnTo,
  isFirstVehicle,
}: {
  returnTo?: string;
  isFirstVehicle?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("vin");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Shared fields
  const [zipCode, setZipCode] = useState("");
  const [color, setColor] = useState("");
  const [engine, setEngine] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [mileage, setMileage] = useState("");
  const [nickname, setNickname] = useState("");

  // VIN path
  const [vin, setVin] = useState("");
  const [decoding, setDecoding] = useState(false);
  const [decoded, setDecoded] = useState<{
    year: number;
    make: string;
    model: string;
    trim: string | null;
    engine: string | null;
    styleId: number | null;
  } | null>(null);

  // Catalogue path
  const [years, setYears] = useState<CatalogItem[]>([]);
  const [makes, setMakes] = useState<CatalogItem[]>([]);
  const [models, setModels] = useState<CatalogItem[]>([]);
  const [subModels, setSubModels] = useState<CatalogItem[]>([]);
  const [trims, setTrims] = useState<CatalogItem[]>([]);
  const [year, setYear] = useState("");
  const [makeId, setMakeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [subModelId, setSubModelId] = useState("");
  const [trimId, setTrimId] = useState("");
  const [loadingStep, setLoadingStep] = useState<string | null>(null);

  const fetchCatalog = useCallback(
    async (step: string, params: Record<string, string> = {}) => {
      setLoadingStep(step);
      try {
        const qs = new URLSearchParams({ step, ...params });
        const res = await fetch(`/api/platform/catalog?${qs.toString()}`);
        const body = await res.json();
        if (!res.ok) {
          setError(body.error || "We could not load the vehicle list.");
          return [];
        }
        return (body.data ?? []) as CatalogItem[];
      } catch {
        setError("We could not load the vehicle list. Please try again.");
        return [];
      } finally {
        setLoadingStep(null);
      }
    },
    []
  );

  useEffect(() => {
    if (mode !== "catalog" || years.length > 0) return;
    fetchCatalog("years").then((data) => {
      // Newest model years first.
      setYears([...data].sort((a, b) => Number(b.name) - Number(a.name)));
    });
  }, [mode, years.length, fetchCatalog]);

  const onYearChange = async (value: string) => {
    setYear(value);
    setMakeId("");
    setModelId("");
    setSubModelId("");
    setTrimId("");
    setMakes([]);
    setModels([]);
    setSubModels([]);
    setTrims([]);
    if (!value) return;
    setMakes(await fetchCatalog("makes", { year: value }));
  };

  const onMakeChange = async (value: string) => {
    setMakeId(value);
    setModelId("");
    setSubModelId("");
    setTrimId("");
    setModels([]);
    setSubModels([]);
    setTrims([]);
    if (!value) return;
    setModels(await fetchCatalog("models", { year, makeId: value }));
  };

  const onModelChange = async (value: string) => {
    setModelId(value);
    setSubModelId("");
    setTrimId("");
    setSubModels([]);
    setTrims([]);
    if (!value) return;
    setSubModels(await fetchCatalog("subModels", { year, makeId, modelId: value }));
  };

  const onSubModelChange = async (value: string) => {
    setSubModelId(value);
    setTrimId("");
    setTrims([]);
    if (!value) return;
    setTrims(
      await fetchCatalog("trims", { year, makeId, modelId, subModelId: value })
    );
  };

  const decodeVin = async () => {
    setError(null);
    const clean = vin.trim().toUpperCase();
    if (clean.length !== 17) {
      setError("A VIN is 17 characters. Please check and try again.");
      return;
    }
    if (!/^\d{5}$/.test(zipCode)) {
      setError("Please enter the five-digit ZIP code where the vehicle is based.");
      return;
    }
    setDecoding(true);
    try {
      const res = await fetch("/api/platform/vin-decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: clean, zipCode }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "We could not look up that VIN.");
        return;
      }
      if (!body.decoded) {
        setError(
          body.message || "We could not identify that VIN. Please use the catalogue instead."
        );
        setMode("catalog");
        return;
      }
      setDecoded(body.vehicle);
      if (body.vehicle.engine && !engine) setEngine(body.vehicle.engine);
    } catch {
      setError("We could not look up that VIN. Please try again.");
    } finally {
      setDecoding(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!/^\d{5}$/.test(zipCode)) {
      setError("Please enter the five-digit ZIP code where the vehicle is based.");
      return;
    }

    let payload: Record<string, unknown>;

    if (mode === "vin") {
      if (!decoded) {
        setError("Please look up the VIN first, or switch to the vehicle catalogue.");
        return;
      }
      payload = {
        year: decoded.year,
        make: decoded.make,
        model: decoded.model,
        trim: decoded.trim ?? undefined,
        vin: vin.trim().toUpperCase(),
        openbayStyleTrimId: decoded.styleId ?? undefined,
      };
    } else {
      const selectedYear = Number(year);
      const make = makes.find((m) => String(m.id) === makeId)?.name;
      const model = models.find((m) => String(m.id) === modelId)?.name;
      const trim = trims.find((t) => String(t.id) === trimId)?.name;
      if (!selectedYear || !make || !model) {
        setError("Please choose the year, make and model of your vehicle.");
        return;
      }
      payload = {
        year: selectedYear,
        make,
        model,
        trim,
        vin: vin.trim().toUpperCase() || undefined,
        openbayStyleTrimId: trimId ? Number(trimId) : undefined,
      };
    }

    payload.color = color || undefined;
    payload.engine = engine || undefined;
    payload.licensePlate = licensePlate || undefined;
    payload.mileage = mileage ? Number(mileage) : undefined;
    payload.nickname = nickname || undefined;
    payload.zipCode = zipCode;

    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "We could not save that vehicle.");
        return;
      }
      router.push(returnTo || "/dashboard/vehicles");
      router.refresh();
    } catch {
      setError("We could not save that vehicle. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {isFirstVehicle && (
        <div className="rounded-xl border border-teal/20 bg-teal/5 px-5 py-4">
          <p className="font-montserrat text-sm font-semibold text-navy">
            Welcome to Drive Service Network.
          </p>
          <p className="mt-1.5 font-opensans text-sm leading-relaxed text-gray-600">
            Add your first vehicle to unlock pricing and booking. Every quote is tied
            to a specific vehicle so that pricing, parts and service history stay
            accurate for each unit in your fleet.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="font-opensans text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label className={labelClass}>
          ZIP code where the vehicle is based <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
          className={`${inputClass} sm:max-w-[200px]`}
          placeholder="33101"
          required
        />
      </div>

      <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMode("vin")}
          className={`flex-1 rounded-md px-4 py-2.5 font-montserrat text-sm font-semibold transition-colors ${
            mode === "vin" ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-navy"
          }`}
        >
          Look up by VIN
        </button>
        <button
          type="button"
          onClick={() => setMode("catalog")}
          className={`flex-1 rounded-md px-4 py-2.5 font-montserrat text-sm font-semibold transition-colors ${
            mode === "catalog"
              ? "bg-white text-navy shadow-sm"
              : "text-gray-500 hover:text-navy"
          }`}
        >
          Choose year, make and model
        </button>
      </div>

      {mode === "vin" ? (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>VIN</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={vin}
                maxLength={17}
                onChange={(e) => {
                  setVin(e.target.value.toUpperCase());
                  setDecoded(null);
                }}
                className={`${inputClass} font-mono tracking-wider`}
                placeholder="1FTFW1ET5DFC10312"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={decodeVin}
                disabled={decoding}
                className="flex-shrink-0"
              >
                {decoding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-1.5 hidden sm:inline">Look up</span>
              </Button>
            </div>
            <p className="mt-1.5 font-opensans text-xs text-gray-400">
              The VIN is on the driver-side dashboard, the door jamb, or your
              registration and insurance documents.
            </p>
          </div>

          {decoded && (
            <div className="flex items-start gap-3 rounded-xl border border-teal/30 bg-teal/5 px-5 py-4">
              <Car className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal" />
              <div>
                <p className="font-montserrat text-base font-bold text-navy">
                  {decoded.year} {decoded.make} {decoded.model}
                </p>
                {decoded.trim && (
                  <p className="mt-0.5 font-opensans text-sm text-gray-600">
                    {decoded.trim}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Year <span className="text-red-500">*</span>
            </label>
            <select
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              className={inputClass}
              disabled={loadingStep === "years"}
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y.id} value={y.name}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Make <span className="text-red-500">*</span>
            </label>
            <select
              value={makeId}
              onChange={(e) => onMakeChange(e.target.value)}
              className={inputClass}
              disabled={!year || loadingStep === "makes"}
            >
              <option value="">
                {loadingStep === "makes" ? "Loading…" : "Select make"}
              </option>
              {makes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Model <span className="text-red-500">*</span>
            </label>
            <select
              value={modelId}
              onChange={(e) => onModelChange(e.target.value)}
              className={inputClass}
              disabled={!makeId || loadingStep === "models"}
            >
              <option value="">
                {loadingStep === "models" ? "Loading…" : "Select model"}
              </option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Body style</label>
            <select
              value={subModelId}
              onChange={(e) => onSubModelChange(e.target.value)}
              className={inputClass}
              disabled={!modelId || loadingStep === "subModels"}
            >
              <option value="">
                {loadingStep === "subModels" ? "Loading…" : "Select body style"}
              </option>
              {subModels.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Trim and engine</label>
            <select
              value={trimId}
              onChange={(e) => {
                setTrimId(e.target.value);
                const selected = trims.find((t) => String(t.id) === e.target.value);
                const match = selected?.name.match(/\(([^)]*)\)/);
                if (match && !engine) setEngine(match[1]);
              }}
              className={inputClass}
              disabled={!subModelId || loadingStep === "trims"}
            >
              <option value="">
                {loadingStep === "trims" ? "Loading…" : "Select trim"}
              </option>
              {trims.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 font-opensans text-xs text-gray-400">
              Selecting the trim helps repair facilities quote the correct parts and
              labour for your vehicle.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              VIN <span className="font-normal text-gray-400">(recommended)</span>
            </label>
            <input
              type="text"
              value={vin}
              maxLength={17}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              className={`${inputClass} font-mono tracking-wider`}
              placeholder="1FTFW1ET5DFC10312"
            />
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 pt-6">
        <p className="mb-4 font-montserrat text-sm font-bold uppercase tracking-wide text-navy">
          Vehicle details
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Colour</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={inputClass}
            >
              <option value="">Select colour</option>
              {COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Engine</label>
            <input
              type="text"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              className={inputClass}
              placeholder="3.5L V6"
            />
          </div>

          <div>
            <label className={labelClass}>Licence plate</label>
            <input
              type="text"
              value={licensePlate}
              maxLength={15}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              className={`${inputClass} uppercase`}
              placeholder="ABC1234"
            />
          </div>

          <div>
            <label className={labelClass}>Current mileage</label>
            <input
              type="text"
              inputMode="numeric"
              value={mileage}
              onChange={(e) => setMileage(e.target.value.replace(/\D/g, ""))}
              className={inputClass}
              placeholder="48000"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              Vehicle name{" "}
              <span className="font-normal text-gray-400">
                (optional — helps identify units in a fleet)
              </span>
            </label>
            <input
              type="text"
              value={nickname}
              maxLength={80}
              onChange={(e) => setNickname(e.target.value)}
              className={inputClass}
              placeholder="Turo Unit 1"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        loading={submitting}
        className="w-full"
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        Save Vehicle
      </Button>

      <p className="text-center font-opensans text-xs text-gray-400">
        Adding a vehicle is free. Registering a vehicle does not enrol it in the
        optional DSN discount subscription.
      </p>
    </form>
  );
}
