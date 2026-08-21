/**
 * Funnel analytics — Priority 5
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * BUILD sections 37 and T name the events the business needs to see. This
 * module defines them in one place so the same event never gets written under
 * three different names, which is the usual way funnel data becomes useless.
 *
 * Events are stored in DSN's own database. No third-party analytics service is
 * introduced: the member's vehicle, location and repair intentions are commercially
 * sensitive and there is no reason to hand them to an advertising network.
 */

export const FUNNEL_EVENTS = {
  // Membership (BUILD section 6)
  JOIN_FREE_CLICKED: "join_free_clicked",
  REGISTRATION_STARTED: "registration_started",
  MEMBERSHIP_COMPLETED: "membership_completed",

  // Vehicles (BUILD section 9)
  FIRST_VEHICLE_ADDED: "first_vehicle_added",
  VEHICLE_ADDED: "vehicle_added",

  // Core transaction (Priority 2)
  QUOTE_STARTED: "quote_started",
  SERVICE_SELECTED: "service_selected",
  FACILITIES_VIEWED: "facilities_viewed",
  FACILITY_DETAILS_VIEWED: "facility_details_viewed",
  AVAILABILITY_VIEWED: "availability_viewed",
  BOOKING_STARTED: "booking_started",
  BOOKING_COMPLETED: "booking_completed",
  BOOKING_FAILED: "booking_failed",
  BOOKING_CANCELLED: "booking_cancelled",
  BOOKING_RESCHEDULED: "booking_rescheduled",

  // Monetisation (Priority 3)
  DSN_PLUS_VIEWED: "dsn_plus_viewed",
  DSN_PLUS_CTA_CLICKED: "dsn_plus_cta_clicked",
  DSN_PLUS_ENROLLMENT_REQUESTED: "dsn_plus_enrollment_requested",
  DSN_PLUS_ENROLLMENT_COMPLETED: "dsn_plus_enrollment_completed",
  DSN_PLUS_ENROLLMENT_CANCELLED: "dsn_plus_enrollment_cancelled",

  // Retention (Priority 4)
  FACILITY_MESSAGE_SENT: "facility_message_sent",
  SUPPORT_TICKET_OPENED: "support_ticket_opened",
  RECALLS_VIEWED: "recalls_viewed",
  SERVICE_HISTORY_VIEWED: "service_history_viewed",
} as const;

export type FunnelEventName = (typeof FUNNEL_EVENTS)[keyof typeof FUNNEL_EVENTS];

/**
 * The conversion path the business actually cares about, in order. Used by the
 * admin funnel report so the sequence is defined once rather than reconstructed
 * by whoever writes the query.
 */
export const PRIMARY_FUNNEL: FunnelEventName[] = [
  FUNNEL_EVENTS.JOIN_FREE_CLICKED,
  FUNNEL_EVENTS.MEMBERSHIP_COMPLETED,
  FUNNEL_EVENTS.FIRST_VEHICLE_ADDED,
  FUNNEL_EVENTS.QUOTE_STARTED,
  FUNNEL_EVENTS.FACILITIES_VIEWED,
  FUNNEL_EVENTS.BOOKING_COMPLETED,
];

export const MONETISATION_FUNNEL: FunnelEventName[] = [
  FUNNEL_EVENTS.DSN_PLUS_VIEWED,
  FUNNEL_EVENTS.DSN_PLUS_CTA_CLICKED,
  FUNNEL_EVENTS.DSN_PLUS_ENROLLMENT_REQUESTED,
  FUNNEL_EVENTS.DSN_PLUS_ENROLLMENT_COMPLETED,
];

/**
 * Client-side event recorder.
 *
 * Deliberately fire-and-forget with `keepalive`, so a member navigating away
 * mid-flow still has the event recorded, and a failed analytics write can never
 * surface as an error in front of them.
 */
export function trackEvent(
  event: FunnelEventName,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, metadata }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never interrupt the member.
    });
  } catch {
    // As above.
  }
}
