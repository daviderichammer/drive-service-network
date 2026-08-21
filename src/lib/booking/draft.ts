/**
 * Booking draft persistence — Priority 2
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Carries the member's in-progress selection across the three booking steps.
 * Session storage is deliberate: the draft is scoped to the tab and disappears
 * when the visit ends, so a shared or public machine never leaks a member's
 * vehicle and location to the next person. Nothing here is authoritative — the
 * server re-validates ownership and eligibility on every request.
 */

export const BOOKING_STORAGE_KEY = "dsn_booking_flow";

export interface BookingDraftService {
  serviceId: number;
  serviceName: string;
  interview: Array<{ question: string; answer: string }>;
  path: string[];
  categoryName: string;
}

export interface BookingDraftFacility {
  locationId: number;
  slug: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string | null;
  rating: number | null;
  reviewCount: number | null;
  distanceMiles: number | null;
}

export interface BookingDraft {
  vehicleId?: string;
  zipCode?: string;
  radius?: number;
  service?: BookingDraftService | null;
  facility?: BookingDraftFacility | null;
  scheduledTime?: string;
  scheduledLabel?: string;
  notes?: string;
  step?: number;
}

export function readBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(BOOKING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as BookingDraft) : null;
  } catch {
    return null;
  }
}

/** Merges a partial update into the existing draft. */
export function writeBookingDraft(patch: BookingDraft): BookingDraft {
  if (typeof window === "undefined") return patch;
  const merged = { ...(readBookingDraft() ?? {}), ...patch };
  try {
    window.sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Storage may be unavailable in private browsing; the flow still works,
    // it simply will not survive a page refresh.
  }
  return merged;
}

export function clearBookingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(BOOKING_STORAGE_KEY);
  } catch {
    // Nothing to do.
  }
}
