/*
 * DSN Vehicle Service
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Openbay offer generation requires a resolved Edmunds style id. DSN therefore
 * persists the style chosen through the Openbay catalog before any vehicle can
 * be registered or re-mirrored upstream.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import {
  engineFromStyleName,
  getPlatformClient,
  PlatformApiRequestError,
  resolveVehicleStyle,
  styleChoiceLabel,
  waitForVehicleDecode,
} from "@/lib/platform";
import { ensureOpenbayDriver } from "@/lib/membership/service";

export interface AddVehicleInput {
  year: number;
  make: string;
  model: string;
  color?: string;
  engine?: string;
  vin?: string;
  licensePlate?: string;
  trim?: string;
  mileage?: number;
  nickname?: string;
  /** Where the vehicle is based. Required by Openbay when creating a vehicle. */
  zipCode: string;
  /** Required Openbay/Edmunds style id selected from the catalog cascade. */
  openbayStyleTrimId: number;
  /** Optional catalog body-style branch, used to validate the selected trim. */
  openbaySubModelId?: number;
}

export interface UpdateVehicleInput {
  color?: string;
  engine?: string;
  licensePlate?: string;
  mileage?: number;
  nickname?: string;
  zipCode?: string;
  vin?: string;
}

export interface RepairVehicleStyleInput {
  openbayStyleTrimId: number;
  openbaySubModelId?: number;
}

type ResolvedVehicleStyle = {
  id: number;
  name: string;
};

type MirroredVehicle = {
  ownedVehicleId: number;
  styleId: number;
  styleName: string | null;
  engine: string | null;
};

export function normaliseVin(vin?: string | null): string | null {
  if (!vin) return null;
  const clean = vin.trim().toUpperCase();
  return clean.length > 0 ? clean : null;
}

export function isValidVin(vin: string): boolean {
  // 17 characters, excluding I, O and Q per the VIN standard.
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

async function confirmVehicleStyle(
  input: Pick<AddVehicleInput, "year" | "make" | "model" | "openbayStyleTrimId" | "openbaySubModelId">
): Promise<{ style: ResolvedVehicleStyle } | { error: string }> {
  try {
    const result = await resolveVehicleStyle({
      year: input.year,
      make: input.make,
      model: input.model,
      styleId: input.openbayStyleTrimId,
      subModelId: input.openbaySubModelId,
    });

    if (result.status === "resolved") {
      return { style: { id: result.style.id, name: result.style.name } };
    }
    if (result.status === "selection_required") {
      return { error: "Please select the trim and engine before saving this vehicle." };
    }
    return { error: result.message };
  } catch (err) {
    console.error("[Vehicles] catalog style resolution failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    return {
      error:
        "We could not verify the vehicle trim with the service network. Please try again in a moment.",
    };
  }
}

async function createOpenbayVehicle(
  userId: string,
  input: AddVehicleInput,
  style: ResolvedVehicleStyle,
  options: { updateIdentifiers?: boolean } = {}
): Promise<MirroredVehicle> {
  const openbayUserId = await ensureOpenbayDriver(userId);
  if (!openbayUserId) {
    throw new Error("The member profile is not ready in the service network.");
  }

  const client = getPlatformClient();
  // Style is intentionally supplied even when a VIN exists. A VIN can be added
  // after creation, but the service network must have a catalog style before it
  // can match labor guides and parts for offer generation.
  const created = await client.createVehicle({
    userId: Number(openbayUserId),
    vehicleId: style.id,
    zipCode: input.zipCode,
    ...(input.mileage !== undefined ? { mileage: input.mileage } : {}),
  });

  const decoded = (await waitForVehicleDecode(created.ownedVehicleId)) ?? created;

  if (options.updateIdentifiers !== false) {
    const vin = normaliseVin(input.vin);
    const payload = {
      ...(vin && isValidVin(vin) ? { vin } : {}),
      ...(input.licensePlate ? { licensePlate: input.licensePlate } : {}),
    };
    if (Object.keys(payload).length > 0) {
      try {
        await client.updateVehicle(created.ownedVehicleId, payload);
      } catch (err) {
        // The style-first vehicle is valid for quotes. Identifier updates are
        // retried by the normal vehicle update flow without discarding it.
        console.error("[Vehicles] Openbay identifier update failed", {
          ownedVehicleId: created.ownedVehicleId,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  return {
    ownedVehicleId: created.ownedVehicleId,
    styleId: decoded.styleId ?? style.id,
    styleName: decoded.styleName ?? style.name,
    engine: engineFromStyleName(decoded.styleName) ?? engineFromStyleName(style.name),
  };
}

/**
 * Pushes a style-confirmed DSN vehicle into Openbay and records its resulting
 * upstream identifiers. The caller has already persisted a resolved style id,
 * so upstream availability never creates a style-less local record.
 */
async function mirrorVehicleToOpenbay(
  dsnVehicleId: string,
  userId: string,
  input: AddVehicleInput,
  style: ResolvedVehicleStyle
): Promise<boolean> {
  try {
    const mirrored = await createOpenbayVehicle(userId, input, style);
    await prisma.vehicle.update({
      where: { id: dsnVehicleId },
      data: {
        openbayVehicleId: String(mirrored.ownedVehicleId),
        openbayStyleId: mirrored.styleId,
        openbayStyleName: mirrored.styleName,
        ...(input.engine ? {} : { engine: mirrored.engine ?? undefined }),
      },
    });
    return true;
  } catch (err) {
    const detail =
      err instanceof PlatformApiRequestError
        ? { status: err.statusCode, message: err.message }
        : { message: String(err) };
    console.error("[Vehicles] Openbay mirror failed", { dsnVehicleId, ...detail });
    return false;
  }
}

/**
 * Returns an Openbay owned-vehicle id for a member-owned DSN vehicle. Legacy
 * records are recreated only after the user has selected a catalog style; VIN
 * alone is not accepted because offers require the resolved style id.
 */
export async function ensureOpenbayVehicle(
  userId: string,
  vehicleId: string,
  fallbackZipCode: string
): Promise<string | null> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId, status: { not: "REMOVED" } },
    select: {
      id: true,
      year: true,
      make: true,
      model: true,
      color: true,
      engine: true,
      vin: true,
      licensePlate: true,
      trim: true,
      mileage: true,
      nickname: true,
      zipCode: true,
      openbayVehicleId: true,
      openbayStyleId: true,
      openbayStyleName: true,
    },
  });

  if (!vehicle) return null;
  if (vehicle.openbayVehicleId && vehicle.openbayStyleId) return vehicle.openbayVehicleId;
  if (!vehicle.openbayStyleId) {
    console.warn("[Vehicles] legacy vehicle requires trim repair", { vehicleId });
    return null;
  }

  const zipCode = /^\d{5}$/.test(vehicle.zipCode ?? "")
    ? (vehicle.zipCode as string)
    : fallbackZipCode;
  const style = {
    id: vehicle.openbayStyleId,
    name: vehicle.openbayStyleName ?? vehicle.trim ?? "Selected trim",
  };

  const mirrored = await mirrorVehicleToOpenbay(
    vehicle.id,
    userId,
    {
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      color: vehicle.color ?? undefined,
      engine: vehicle.engine ?? undefined,
      vin: vehicle.vin ?? undefined,
      licensePlate: vehicle.licensePlate ?? undefined,
      trim: vehicle.trim ?? undefined,
      mileage: vehicle.mileage ?? undefined,
      nickname: vehicle.nickname ?? undefined,
      zipCode,
      openbayStyleTrimId: vehicle.openbayStyleId,
    },
    style
  );

  if (!mirrored) return null;
  const refreshed = await prisma.vehicle.findUnique({
    where: { id: vehicle.id },
    select: { openbayVehicleId: true },
  });
  return refreshed?.openbayVehicleId ?? null;
}

export async function addVehicle(
  userId: string,
  input: AddVehicleInput
): Promise<{ id: string } | { error: string }> {
  const vin = normaliseVin(input.vin);
  if (vin && !isValidVin(vin)) {
    return { error: "That VIN does not look right. A VIN is 17 characters." };
  }

  const confirmed = await confirmVehicleStyle(input);
  if ("error" in confirmed) return confirmed;
  const resolvedInput: AddVehicleInput = {
    ...input,
    openbayStyleTrimId: confirmed.style.id,
    trim: styleChoiceLabel({
      id: confirmed.style.id,
      name: confirmed.style.name,
      subModelId: input.openbaySubModelId ?? 0,
      subModelName: "",
    }),
  };

  if (vin) {
    const existing = await prisma.vehicle.findFirst({ where: { userId, vin } });
    if (existing) {
      if (existing.status !== "REMOVED") {
        return { error: "That VIN is already registered in your fleet." };
      }
      await prisma.vehicle.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          removedAt: null,
          year: resolvedInput.year,
          make: resolvedInput.make.trim(),
          model: resolvedInput.model.trim(),
          color: resolvedInput.color?.trim() || null,
          engine: resolvedInput.engine?.trim() || null,
          licensePlate: resolvedInput.licensePlate?.trim().toUpperCase() || null,
          trim: resolvedInput.trim,
          mileage: resolvedInput.mileage ?? null,
          nickname: resolvedInput.nickname?.trim() || null,
          zipCode: resolvedInput.zipCode,
          openbayStyleId: confirmed.style.id,
          openbayStyleName: confirmed.style.name,
        },
      });
      if (!existing.openbayVehicleId || !existing.openbayStyleId) {
        await mirrorVehicleToOpenbay(existing.id, userId, resolvedInput, confirmed.style);
      }
      return { id: existing.id };
    }
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      userId,
      year: resolvedInput.year,
      make: resolvedInput.make.trim(),
      model: resolvedInput.model.trim(),
      color: resolvedInput.color?.trim() || null,
      engine: resolvedInput.engine?.trim() || null,
      vin,
      licensePlate: resolvedInput.licensePlate?.trim().toUpperCase() || null,
      trim: resolvedInput.trim,
      mileage: resolvedInput.mileage ?? null,
      nickname: resolvedInput.nickname?.trim() || null,
      zipCode: resolvedInput.zipCode,
      openbayStyleId: confirmed.style.id,
      openbayStyleName: confirmed.style.name,
      status: "ACTIVE",
      programStatus: "FREE",
    },
    select: { id: true },
  });

  await mirrorVehicleToOpenbay(vehicle.id, userId, resolvedInput, confirmed.style);
  return { id: vehicle.id };
}

/**
 * Repairs a legacy vehicle that lacks a style id. The previous Openbay vehicle
 * (if any) is replaced because the upstream update API cannot assign a style.
 */
export async function repairVehicleStyle(
  userId: string,
  vehicleId: string,
  input: RepairVehicleStyleInput
): Promise<{ ok: true } | { error: string }> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId, status: { not: "REMOVED" } },
  });
  if (!vehicle) return { error: "Vehicle not found." };

  const confirmed = await confirmVehicleStyle({
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    openbayStyleTrimId: input.openbayStyleTrimId,
    openbaySubModelId: input.openbaySubModelId,
  });
  if ("error" in confirmed) return confirmed;

  const styleInput: AddVehicleInput = {
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    color: vehicle.color ?? undefined,
    engine: vehicle.engine ?? undefined,
    vin: vehicle.vin ?? undefined,
    licensePlate: vehicle.licensePlate ?? undefined,
    trim: confirmed.style.name,
    mileage: vehicle.mileage ?? undefined,
    nickname: vehicle.nickname ?? undefined,
    zipCode: /^\d{5}$/.test(vehicle.zipCode ?? "") ? (vehicle.zipCode as string) : "00000",
    openbayStyleTrimId: confirmed.style.id,
    openbaySubModelId: input.openbaySubModelId,
  };

  if (!/^\d{5}$/.test(styleInput.zipCode)) {
    return { error: "Please update the vehicle ZIP code before confirming its trim." };
  }

  try {
    // Create the fully styled replacement before retiring a bad upstream record.
    const mirrored = await createOpenbayVehicle(userId, styleInput, confirmed.style, {
      updateIdentifiers: false,
    });
    const client = getPlatformClient();

    if (vehicle.openbayVehicleId) {
      try {
        await client.deleteVehicle(Number(vehicle.openbayVehicleId));
      } catch (err) {
        try {
          await client.deleteVehicle(mirrored.ownedVehicleId);
        } catch {
          // Best-effort cleanup; retain the original error as the useful signal.
        }
        throw err;
      }
    }

    const vin = normaliseVin(vehicle.vin);
    const identifierPayload = {
      ...(vin && isValidVin(vin) ? { vin } : {}),
      ...(vehicle.licensePlate ? { licensePlate: vehicle.licensePlate } : {}),
    };
    if (Object.keys(identifierPayload).length > 0) {
      try {
        await client.updateVehicle(mirrored.ownedVehicleId, identifierPayload);
      } catch (err) {
        console.error("[Vehicles] replacement identifier update failed", {
          vehicleId,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        trim: confirmed.style.name,
        openbayVehicleId: String(mirrored.ownedVehicleId),
        openbayStyleId: mirrored.styleId,
        openbayStyleName: mirrored.styleName,
        ...(vehicle.engine ? {} : { engine: mirrored.engine ?? undefined }),
      },
    });
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof PlatformApiRequestError
        ? "We could not update this vehicle in the service network. Please try again."
        : "We could not confirm this vehicle trim right now. Please try again.";
    console.error("[Vehicles] style repair failed", {
      vehicleId,
      message: err instanceof Error ? err.message : String(err),
    });
    return { error: message };
  }
}

export async function updateVehicle(
  userId: string,
  vehicleId: string,
  input: UpdateVehicleInput
): Promise<{ ok: true } | { error: string }> {
  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId } });
  if (!vehicle) return { error: "Vehicle not found." };

  const vin = normaliseVin(input.vin);
  if (vin && vin !== vehicle.vin) {
    if (!isValidVin(vin)) {
      return { error: "That VIN does not look right. A VIN is 17 characters." };
    }
    const clash = await prisma.vehicle.findFirst({ where: { userId, vin } });
    if (clash && clash.id !== vehicleId && clash.status !== "REMOVED") {
      return { error: "That VIN is already registered in your fleet." };
    }
  }

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      ...(input.color !== undefined ? { color: input.color?.trim() || null } : {}),
      ...(input.engine !== undefined ? { engine: input.engine?.trim() || null } : {}),
      ...(input.licensePlate !== undefined
        ? { licensePlate: input.licensePlate?.trim().toUpperCase() || null }
        : {}),
      ...(input.mileage !== undefined ? { mileage: input.mileage } : {}),
      ...(input.nickname !== undefined ? { nickname: input.nickname?.trim() || null } : {}),
      ...(input.zipCode !== undefined ? { zipCode: input.zipCode } : {}),
      ...(vin ? { vin } : {}),
    },
  });

  if (vehicle.openbayVehicleId) {
    const payload = {
      ...(input.licensePlate !== undefined
        ? { licensePlate: input.licensePlate?.trim().toUpperCase() }
        : {}),
      ...(input.mileage !== undefined ? { mileage: input.mileage } : {}),
      ...(input.zipCode ? { zipCode: input.zipCode } : {}),
      ...(vin && vin !== vehicle.vin ? { vin } : {}),
    };
    if (Object.keys(payload).length > 0) {
      try {
        await getPlatformClient().updateVehicle(Number(vehicle.openbayVehicleId), payload);
      } catch (err) {
        console.error("[Vehicles] Openbay update failed", {
          vehicleId,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  return { ok: true };
}

/**
 * Removal is non-destructive locally so repair and appointment history remains
 * available. The upstream mirror is removed only when it exists.
 */
export async function removeVehicle(
  userId: string,
  vehicleId: string
): Promise<{ ok: true; enrollmentRequiresReview: boolean } | { error: string }> {
  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId } });
  if (!vehicle) return { error: "Vehicle not found." };

  const activeEnrollment = await prisma.vehicleEnrollment.findFirst({
    where: { vehicleId, status: { in: ["ACTIVE", "EXPIRING"] } },
  });

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status: "REMOVED", removedAt: new Date() },
  });

  if (vehicle.openbayVehicleId) {
    try {
      await getPlatformClient().deleteVehicle(Number(vehicle.openbayVehicleId));
    } catch (err) {
      console.error("[Vehicles] Openbay delete failed", {
        vehicleId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { ok: true, enrollmentRequiresReview: Boolean(activeEnrollment) };
}
