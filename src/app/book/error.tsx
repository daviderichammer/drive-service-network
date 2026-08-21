"use client";

/**
 * Booking flow error boundary — Priority 5
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * The booking flow is the revenue path, so a failure here is offered a way
 * forward rather than a dead end: retry, restart the quote, or reach a person.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DSN booking] unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h1 className="font-montserrat text-lg font-bold text-navy">
          We could not continue your booking
        </h1>
        <p className="mt-2 font-opensans text-sm leading-relaxed text-gray-600">
          Nothing has been booked and you have not been charged. You can pick up
          where you left off.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="primary" size="md" onClick={reset}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" size="md" asChild>
            <Link href="/book">Start a new quote</Link>
          </Button>
        </div>
        {error.digest && (
          <p className="mt-5 font-opensans text-xs text-gray-400">
            Reference <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </div>
  );
}
