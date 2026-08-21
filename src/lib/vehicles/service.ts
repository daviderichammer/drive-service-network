/**
 * DSN Vehicle Service
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * REVAMP BUILD rules enforced here:
 *   - Vehicles collect Year, Make, Model, Colour, Engine, VIN and Tag
 *     (section 9). Colour has no Platform API equivalent and engine has no
 *     discrete field — both are DSN-local (FLAGS F-4).
 *   - VIN is the principal persistent identifier and duplicates are prevented
 *     (section L).
 *   - Removal is non-destructive; history is preserved (section K).
 *   - Adding a vehicle NEVER enrols it in the paid DSN+ programme
 *     ("Adding vehicles after initial enrollment").
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import {
  engineFromStyleName,
  getPlatformClient,
  PlatformApiRequestError,
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
  /** Resolved Edmunds style id from the Platform API catalog cascade. */
  openbayStyleTrimId?: number;
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

export function normaliseVin(vin?: string | null): string | null {
  if (!vin) return null;
  const clean = vin.trim().toUpperCase();
  return clean.length > 0 ? clean : null;
}

export function isValidVin(vin: string): boolean {
  // 17 characters, excluding I, O and Q per the VIN standard.
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

/**
 * Pushes a DSN vehicle into Openbay and records the resulting ids.
 *
 * Two creation paths are supported by the Platform API: by VIN, or by the
 * resolved style/trim id from the catalog cascade. Note that licensePlate is
 * accepted on UPDATE but not on CREATE, so the plate is written in a second
 * call (FLAGS F-4).
 */
async function mirrorVehicleToOpenbay(
  dsnVehicleId: string,
  userId: string,
  input: AddVehicleInput
): Promise<void> {
  const openbayUserId = await ensureOpenbayDriver(userId);
  if (!openbayUserId) {
    console.warn("[Vehicles] no Openbay driver; vehicle stored DSN-side only", {
      dsnVehicleId,
    });
    return;
  }

  const vin = normaliseVin(input.vin);

  try {
    const client = getPlatformClient();
    const created = await client.createVehicle({
      userId: Number(openbayUserId),
      ...(vin && isValidVin(vin) ? { vin } : {}),
      ...(!vin || !isValidVin(vin)
        ? input.openbayStyleTrimId
          ? { vehicleId: input.openbayStyleTrimId }
          : {}
        : {}),
      zipCode: input.zipCode,
      ...(input.mileage ? { mileage: input.mileage } : {}),
    });

    // Openbay decodes the VIN asynchronously.
    const decoded = (await waitForVehicleDecode(created.ownedVehicleId)) ?? created;

    // The plate cannot be supplied at creation time.
    if (input.licensePlate) {
      try {
        await client.updateVehicle(created.ownedVehicleId, {
          licensePlate: input.licensePlate,
        });
      } catch (err) {
        console.error("[Vehicles] plate update failed", {
          dsnVehicleId,
          err: String(err),
        });
      }
    }

    await prisma.vehicle.update({
      where: { id: dsnVehicleId },
      data: {
        openbayVehicleId: String(created.ownedVehicleId),
        openbayStyleId: decoded.styleId ?? null,
        openbayStyleName: decoded.styleName ?? null,
        // Only fill engine from the style when the member did not supply one.
        ...(input.engine
          ? {}
          : { engine: engineFromStyleName(decoded.styleName) ?? undefined }),
      },
    });
  } catch (err) {
    const detail =
      err instanceof PlatformApiRequestError
        ? { status: err.statusCode, message: err.message }
        : { message: String(err) };
    // Non-fatal: DSN is the system of record. The vehicle exists for the member
    // and can be re-mirrored later.
    console.error("[Vehicles] Openbay mirror failed", { dsnVehicleId, ...detail });
  }
}

export async function addVehicle(
  userId: string,
  input: AddVehicleInput
): Promise<{ id: string } | { error: string }> {
  const vin = normaliseVin(input.vin);

  if (vin) {
    if (!isValidVin(vin)) {
      return { error: "That VIN does not look right. A VIN is 17 characters." };
    }
    // BUILD section L — prevent accidental duplicate vehicle records by VIN.
    // Scoped to this member: a vehicle sold between two members must still be
    // registerable by the new owner.
    const existing = await prisma.vehicle.findFirst({ where: { userId, vin } });
    if (existing) {
      if (existing.status !== "REMOVED") {
        return { error: "That VIN is already registered in your fleet." };
      }
      // Re-activate the member's own previously removed record rather than
      // colliding with the (userId, vin) uniqueness constraint.
      await prisma.vehicle.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          removedAt: null,
          year: input.year,
          make: input.make.trim(),
          model: input.model.trim(),
          color: input.color?.trim() || null,
          engine: input.engine?.trim() || null,
          licensePlate: input.licensePlate?.trim().toUpperCase() || null,
          trim: input.trim?.trim() || null,
          mileage: input.mileage ?? null,
          nickname: input.nickname?.trim() || null,
        },
      });
      await mirrorVehicleToOpenbay(existing.id, userId, input);
      return { id: existing.id };
    }
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      userId,
      year: input.year,
      make: input.make.trim(),
      model: input.model.trim(),
      color: input.color?.trim() || null,
      engine: input.engine?.trim() || null,
      vin,
      licensePlate: input.licensePlate?.trim().toUpperCase() || null,
      trim: input.trim?.trim() || null,
      mileage: input.mileage ?? null,
      nickname: input.nickname?.trim() || null,
      status: "ACTIVE",
      // Adding a vehicle never enrols it in the paid programme.
      programStatus: "FREE",
    },
    select: { id: true },
  });

  await mirrorVehicleToOpenbay(vehicle.id, userId, input);

  return { id: vehicle.id };
}

export async function updateVehicle(
  userId: string,
  vehicleId: string,
  input: UpdateVehicleInput
): Promise<{ ok: true } | { error: string }> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
  });
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
      ...(vin ? { vin } : {}),
    },
  });

  // Mirror the fields Openbay actually accepts.
  if (vehicle.openbayVehicleId) {
    const payload: Record<string, unknown> = {};
    if (input.licensePlate !== undefined) {
      payload.licensePlate = input.licensePlate?.trim().toUpperCase();
    }
    if (input.mileage !== undefined) payload.mileage = input.mileage;
    if (input.zipCode) payload.zipCode = input.zipCode;
    if (vin && vin !== vehicle.vin) payload.vin = vin;

    if (Object.keys(payload).length > 0) {
      try {
        await getPlatformClient().updateVehicle(
          Number(vehicle.openbayVehicleId),
          payload
        );
      } catch (err) {
        console.error("[Vehicles] Openbay update failed", {
          vehicleId,
          err: String(err),
        });
      }
    }
  }

  return { ok: true };
}

/**
 * BUILD section K and "Removing / replacing vehicles": removal is a status
 * change. Historical repair and appointment information is preserved, and a
 * paid DSN+ enrolment is NOT automatically cancelled, refunded or transferred —
 * that requires a business rule which has been flagged.
 */
export async function removeVehicle(
  userId: string,
  vehicleId: string
): Promise<{ ok: true; enrollmentRequiresReview: boolean } | { error: string }> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
  });
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
        err: String(err),
      });
    }
  }

  return { ok: true, enrollmentRequiresReview: Boolean(activeEnrollment) };
}
