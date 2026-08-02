/**
 * Openbay Service Layer — Public API
 * Re-exports client and provides response transformation utilities
 */

export { getOpenbayClient } from "./client";
export type {
  OpenbayService,
  OpenbayLocation,
  OpenbayTimeslot,
  OpenbayUser,
  OpenbaySubscription,
  OpenbayAppointment,
  OpenbaySearchParams,
  CreateUserParams,
  CreateSubscriptionParams,
  BookAppointmentParams,
  OpenbayApiError,
} from "./client";

/**
 * Transform Openbay service response to DSN format
 */
export function transformService(raw: Record<string, unknown>) {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category || raw.requires_category,
    serviceId: raw.service_id || raw.id,
  };
}

/**
 * Transform Openbay location response to DSN format
 */
export function transformLocation(raw: Record<string, unknown>) {
  return {
    id: raw.id,
    name: raw.name || raw.shop_name,
    address: raw.address || raw.street_address,
    city: raw.city,
    state: raw.state,
    zip: raw.zip || raw.zip_code,
    phone: raw.phone,
    rating: raw.rating,
    reviewCount: raw.review_count || raw.reviewCount,
    distance: raw.distance,
    services: raw.services || [],
  };
}

/**
 * Safe error handler for Openbay API calls
 */
export async function safeOpenbayCall<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<{ data: T; error: string | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    // Log the full error server-side for debugging
    console.error("[Openbay] API call failed (full error):", JSON.stringify(err, null, 2));

    // Extract a human-readable message from the error
    let message = "Service temporarily unavailable";
    if (err instanceof Error) {
      message = err.message;
    } else if (err && typeof err === "object") {
      const e = err as Record<string, unknown>;
      if (typeof e.message === "string" && e.message) {
        message = e.message;
      } else if (typeof e.code === "string" && e.code) {
        message = e.code;
      }
    } else if (typeof err === "string" && err) {
      message = err;
    }

    return { data: fallback, error: message };
  }
}
