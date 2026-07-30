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
    const error = err as { message?: string; code?: string };
    console.error("[Openbay] API call failed:", error.message || "Unknown error");
    return { data: fallback, error: error.message || "Service temporarily unavailable" };
  }
}
