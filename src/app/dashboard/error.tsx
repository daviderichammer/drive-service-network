"use client";

/**
 * Dashboard error boundary — Priority 5
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Scoped to the member area so a failure in one panel — recalls, messages,
 * history — does not take down the navigation with it. The member keeps their
 * sidebar and can move to a section that is working.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DSN dashboard] unhandled error:", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-card">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <h2 className="font-montserrat text-base font-bold text-navy">
        We could not load this section
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm font-opensans text-sm text-gray-600">
        Your data is safe. This is a temporary fault on our side.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="sm" onClick={reset}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Try again
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/support">Contact support</Link>
        </Button>
      </div>
      {error.digest && (
        <p className="mt-5 font-opensans text-xs text-gray-400">
          Reference <span className="font-mono">{error.digest}</span>
        </p>
      )}
    </div>
  );
}
