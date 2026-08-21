import "server-only";

import { getPlatformClient } from "./client";
import type { CatalogMake, CatalogModel, CatalogYear } from "./types";

export interface VehicleStyleLookupInput {
  year: number;
  make: string;
  model: string;
  styleId?: number | null;
  subModelId?: number | null;
}

export interface CatalogStyleChoice {
  id: number;
  name: string;
  subModelId: number;
  subModelName: string;
}

export type VehicleStyleLookupResult =
  | { status: "resolved"; style: CatalogStyleChoice }
  | { status: "selection_required"; styles: CatalogStyleChoice[] }
  | { status: "not_found"; message: string };

function normalise(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function nameMatches(item: { name: string }, value: string): boolean {
  return normalise(item.name) === normalise(value);
}

function resolveYear(years: CatalogYear[], year: number): CatalogYear | null {
  return years.find((item) => item.id === year || Number(item.name) === year) ?? null;
}

function resolveMake(makes: CatalogMake[], make: string): CatalogMake | null {
  return makes.find((item) => nameMatches(item, make)) ?? null;
}

function resolveModel(models: CatalogModel[], model: string): CatalogModel | null {
  return models.find((item) => nameMatches(item, model)) ?? null;
}

/**
 * Resolves an Edmunds/Openbay style through the authoritative catalog cascade.
 * A supplied style id is accepted only when it belongs to the supplied year,
 * make, model and optional body-style branch. When no style is supplied, the
 * function auto-resolves only the unambiguous one-style outcome.
 */
export async function resolveVehicleStyle(
  input: VehicleStyleLookupInput
): Promise<VehicleStyleLookupResult> {
  const client = getPlatformClient();
  const year = resolveYear(await client.getCatalogYears(), input.year);
  if (!year) {
    return { status: "not_found", message: "That model year is not available in the vehicle catalogue." };
  }

  const make = resolveMake(await client.getCatalogMakes(year.id), input.make);
  if (!make) {
    return { status: "not_found", message: "That make is not available for the selected model year." };
  }

  const model = resolveModel(await client.getCatalogModels(year.id, make.id), input.model);
  if (!model) {
    return { status: "not_found", message: "That model is not available for the selected year and make." };
  }

  const allSubModels = await client.getCatalogSubModels(year.id, make.id, model.id);
  const subModels = input.subModelId
    ? allSubModels.filter((item) => item.id === input.subModelId)
    : allSubModels;

  if (subModels.length === 0) {
    return {
      status: "not_found",
      message: "That body style is no longer available for the selected vehicle.",
    };
  }

  const styleGroups = await Promise.all(
    subModels.map(async (subModel) => ({
      subModel,
      trims: await client.getCatalogTrims(year.id, make.id, model.id, subModel.id),
    }))
  );

  const styles: CatalogStyleChoice[] = styleGroups.flatMap(({ subModel, trims }) =>
    trims.map((trim) => ({
      id: trim.id,
      name: trim.name || trim.trim,
      subModelId: subModel.id,
      subModelName: subModel.name,
    }))
  );

  if (styles.length === 0) {
    return {
      status: "not_found",
      message: "No trim is available for the selected vehicle. Please choose a different body style.",
    };
  }

  if (input.styleId) {
    const style = styles.find((item) => item.id === input.styleId);
    if (!style) {
      return {
        status: "not_found",
        message: "The selected trim does not match this vehicle. Please choose the trim again.",
      };
    }
    return { status: "resolved", style };
  }

  if (styles.length === 1) {
    return { status: "resolved", style: styles[0] };
  }

  return { status: "selection_required", styles };
}

export function styleChoiceLabel(style: CatalogStyleChoice): string {
  return style.subModelName ? `${style.subModelName} — ${style.name}` : style.name;
}
