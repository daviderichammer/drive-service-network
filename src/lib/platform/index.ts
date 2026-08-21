/**
 * Openbay Platform API — public server-side surface.
 * Drive Service Network / Global Drive Holdings Inc.
 */
import "server-only";

import { getPlatformClient, PlatformApiRequestError } from "./client";
import type { PlatformVehicle, ServiceSelectionNode } from "./types";

export * from "./types";
export { getPlatformClient, PlatformApiRequestError };
export {
  resolveVehicleStyle,
  styleChoiceLabel,
  type CatalogStyleChoice,
  type VehicleStyleLookupInput,
  type VehicleStyleLookupResult,
} from "./vehicle-catalog";

// ============================================================
// DSN-BRANDED ERROR STATES (REVAMP BUILD section 35)
// ============================================================

/**
 * Maps a Platform API failure to member-safe copy. Raw API errors, endpoint
 * paths, technical codes and credentials are never surfaced to the customer.
 */
export function memberFacingError(error: unknown): {
  message: string;
  supportSuggested: boolean;
  status: number;
} {
  if (error instanceof PlatformApiRequestError) {
    if (error.entitlement) {
      return {
        message:
          "This part of the Drive Service Network is not available yet. Our team has been notified.",
        supportSuggested: true,
        status: 503,
      };
    }
    switch (error.statusCode) {
      case 404:
        return {
          message: "We could not find that record. Please check your details and try again.",
          supportSuggested: false,
          status: 404,
        };
      case 422:
        return {
          message:
            "Some of the vehicle or account information could not be verified. Please review the details and try again.",
          supportSuggested: false,
          status: 422,
        };
      case 503:
        return {
          message:
            "The Drive Service Network is temporarily unavailable. Please try again in a few moments.",
          supportSuggested: true,
          status: 503,
        };
      default:
        return {
          message: "We were unable to complete that request. Please try again.",
          supportSuggested: true,
          status: 502,
        };
    }
  }

  return {
    message: "Something went wrong on our end. Please try again.",
    supportSuggested: true,
    status: 500,
  };
}

/**
 * Executes a Platform API call and normalises the outcome, so route handlers
 * never leak raw upstream errors.
 */
export async function safePlatformCall<T>(
  fn: () => Promise<T>
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const data = await fn();
    return { data, error: null, status: 200 };
  } catch (err) {
    const mapped = memberFacingError(err);
    return { data: null, error: mapped.message, status: mapped.status };
  }
}

// ============================================================
// VEHICLE HELPERS
// ============================================================

/**
 * Openbay decodes a VIN asynchronously: the 201 response from vehicle creation
 * frequently returns null year/make/model, which populate a few seconds later.
 * This polls the vehicle until the decode lands or the attempts are exhausted.
 */
export async function waitForVehicleDecode(
  ownedVehicleId: number,
  attempts = 5,
  delayMs = 1200
): Promise<PlatformVehicle | null> {
  const client = getPlatformClient();
  for (let i = 0; i < attempts; i += 1) {
    try {
      const vehicle = await client.getVehicle(ownedVehicleId);
      if (vehicle.year && vehicle.make && vehicle.model) {
        return vehicle;
      }
    } catch {
      // Non-fatal: DSN remains the system of record for the vehicle.
      return null;
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  try {
    return await client.getVehicle(ownedVehicleId);
  } catch {
    return null;
  }
}

/**
 * The Platform API has no discrete engine field; engine information is embedded
 * in the style name, e.g. "RWD 4dr Extended Cab Pickup (3.5L 6cyl 6AT)".
 * See FLAGS_FOR_DAVID.md F-4.
 */
export function engineFromStyleName(styleName?: string | null): string | null {
  if (!styleName) return null;
  const match = styleName.match(/\(([^)]*)\)/);
  if (!match) return null;
  const inner = match[1].trim();
  return inner.length > 0 ? inner : null;
}

// ============================================================
// SERVICE SELECTION HELPERS (Priority 2 groundwork)
// ============================================================

/** Depth-first search for a node by id within a guided-selection tree. */
export function findSelectionNode(
  nodes: ServiceSelectionNode[],
  id: number
): ServiceSelectionNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findSelectionNode(node.children, id);
    if (found) return found;
  }
  return null;
}

/** True when the node resolves a service outright and asks nothing further. */
export function isTerminalNode(node: ServiceSelectionNode): boolean {
  return node.children.length === 0 || node.question === null;
}

// ============================================================
// FACILITY HELPERS (Priority 2)
// ============================================================

/**
 * Resolves the public `openbay_id` slug for a numeric location id.
 *
 * Every appointments endpoint keys on the slug; the search and detail
 * endpoints expose the numeric id. Passing the numeric id to appointments
 * returns 422 "could not find location", so this translation is mandatory.
 */
export async function resolveLocationSlug(locationId: number): Promise<string | null> {
  try {
    const detail = await getPlatformClient().getLocation(locationId);
    return detail.openbay_id ?? null;
  } catch {
    return null;
  }
}

/** Metres to miles, rounded to one decimal, for facility distance display. */
export function metresToMiles(metres: number): number {
  return Math.round((metres / 1609.344) * 10) / 10;
}

/**
 * Groups flat slot records by calendar day so the booking calendar can render
 * a day picker followed by the times available on that day.
 */
export function groupSlotsByDay(
  slots: Array<{ day: string; key: string; slotTitle: string; proposedTime?: string; fullSlotTitle?: string }>
): Array<{
  day: string;
  slots: Array<{ key: string; slotTitle: string; proposedTime?: string; fullSlotTitle?: string }>;
}> {
  const byDay = new Map<
    string,
    Array<{ key: string; slotTitle: string; proposedTime?: string; fullSlotTitle?: string }>
  >();
  for (const slot of slots) {
    const bucket = byDay.get(slot.day) ?? [];
    bucket.push({
      key: slot.key,
      slotTitle: slot.slotTitle?.trim() || "Early drop off",
      proposedTime: slot.proposedTime,
      fullSlotTitle: slot.fullSlotTitle,
    });
    byDay.set(slot.day, bucket);
  }
  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, daySlots]) => ({ day, slots: daySlots }));
}
