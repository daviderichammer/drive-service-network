"use client";

/**
 * Declarative funnel instrumentation — Priority 5
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Drops into any page to record that it was reached. Keeping the call in a
 * component rather than scattering `useEffect` blocks means the event fires
 * exactly once per mount and cannot accidentally be duplicated by a re-render.
 */

import { useEffect, useRef } from "react";
import { trackEvent, type FunnelEventName } from "@/lib/analytics/funnel";

export function TrackEvent({
  event,
  metadata,
}: {
  event: FunnelEventName;
  metadata?: Record<string, unknown>;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(event, metadata);
    // Metadata is intentionally captured at first mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
