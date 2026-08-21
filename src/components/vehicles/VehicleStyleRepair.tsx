"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CatalogItem {
  id: number;
  name: string;
}

interface VehicleStyleRepairProps {
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
  };
  onComplete: () => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-4 py-3 font-opensans text-sm text-navy transition-colors focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 disabled:bg-gray-50 disabled:text-gray-400";

function normalise(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function VehicleStyleRepair({ vehicle, onComplete }: VehicleStyleRepairProps) {
  const [subModels, setSubModels] = useState<CatalogItem[]>([]);
  const [trims, setTrims] = useState<CatalogItem[]>([]);
  const [subModelId, setSubModelId] = useState("");
  const [trimId, setTrimId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async (step: string, params: Record<string, string>) => {
    const query = new URLSearchParams({ step, ...params });
    const response = await fetch(`/api/platform/catalog?${query.toString()}`);
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "We could not load the vehicle catalogue.");
    return (body.data ?? []) as CatalogItem[];
  }, []);

  const loadTrims = useCallback(async (resolvedSubModelId: string, context: {
    year: string;
    makeId: string;
    modelId: string;
  }) => {
    const choices = await fetchCatalog("trims", {
      ...context,
      subModelId: resolvedSubModelId,
    });
    setTrims(choices);
    setTrimId(choices.length === 1 ? String(choices[0].id) : "");
  }, [fetchCatalog]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const years = await fetchCatalog("years", {});
        const year = years.find((item) => Number(item.name) === vehicle.year);
        if (!year) throw new Error("This vehicle year is not available in the service catalogue.");

        const makes = await fetchCatalog("makes", { year: year.name });
        const make = makes.find((item) => normalise(item.name) === normalise(vehicle.make));
        if (!make) throw new Error("This vehicle make is not available in the service catalogue.");

        const models = await fetchCatalog("models", { year: year.name, makeId: String(make.id) });
        const model = models.find((item) => normalise(item.name) === normalise(vehicle.model));
        if (!model) throw new Error("This vehicle model is not available in the service catalogue.");

        const context = { year: year.name, makeId: String(make.id), modelId: String(model.id) };
        const bodies = await fetchCatalog("subModels", context);
        if (cancelled) return;
        setSubModels(bodies);
        if (bodies.length === 0) {
          throw new Error("No body styles are available for this vehicle. Please contact Drive Service Network.");
        }
        if (bodies.length === 1) {
          const onlyBody = String(bodies[0].id);
          setSubModelId(onlyBody);
          await loadTrims(onlyBody, context);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "We could not load the vehicle catalogue.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchCatalog, loadTrims, vehicle.year, vehicle.make, vehicle.model]);

  const onBodyStyleChange = async (value: string) => {
    setSubModelId(value);
    setTrimId("");
    setTrims([]);
    setError(null);
    if (!value) return;
    setLoading(true);
    try {
      const years = await fetchCatalog("years", {});
      const year = years.find((item) => Number(item.name) === vehicle.year);
      if (!year) throw new Error("This vehicle year is not available in the service catalogue.");
      const makes = await fetchCatalog("makes", { year: year.name });
      const make = makes.find((item) => normalise(item.name) === normalise(vehicle.make));
      if (!make) throw new Error("This vehicle make is not available in the service catalogue.");
      const models = await fetchCatalog("models", { year: year.name, makeId: String(make.id) });
      const model = models.find((item) => normalise(item.name) === normalise(vehicle.model));
      if (!model) throw new Error("This vehicle model is not available in the service catalogue.");
      await loadTrims(value, { year: year.name, makeId: String(make.id), modelId: String(model.id) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not load trims for this vehicle.");
    } finally {
      setLoading(false);
    }
  };

  const repair = async () => {
    if (!subModelId || !trimId) {
      setError("Please select the body style and trim before continuing.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openbayStyleTrimId: Number(trimId),
          openbaySubModelId: Number(subModelId),
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error || "We could not update this vehicle.");
        return;
      }
      onComplete();
    } catch {
      setError("We could not update this vehicle. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <Wrench className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
        <div className="min-w-0 flex-1">
          <p className="font-montserrat text-sm font-bold text-navy">
            Confirm the trim to unlock accurate quotes
          </p>
          <p className="mt-1 font-opensans text-sm leading-relaxed text-amber-900">
            Repair facilities need the exact body style and trim to match labor guides and parts.
          </p>

          {error && (
            <div className="mt-3 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="mt-4 flex items-center gap-2 font-opensans text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading vehicle trims…
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block font-opensans text-sm font-medium text-navy">
                Body style
                <select
                  value={subModelId}
                  onChange={(event) => void onBodyStyleChange(event.target.value)}
                  className={`${inputClass} mt-1.5`}
                  disabled={saving}
                >
                  <option value="">Select body style</option>
                  {subModels.map((subModel) => (
                    <option key={subModel.id} value={subModel.id}>
                      {subModel.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block font-opensans text-sm font-medium text-navy">
                Trim and engine
                <select
                  value={trimId}
                  onChange={(event) => setTrimId(event.target.value)}
                  className={`${inputClass} mt-1.5`}
                  disabled={saving || !subModelId}
                >
                  <option value="">Select trim</option>
                  {trims.map((trim) => (
                    <option key={trim.id} value={trim.id}>
                      {trim.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={repair}
            disabled={loading || saving || !subModelId || !trimId}
            className="mt-4"
          >
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
            Confirm trim and enable quotes
          </Button>
        </div>
      </div>
    </div>
  );
}
