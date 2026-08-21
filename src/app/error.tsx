"use client";

/**
 * Application error boundary — Priority 5
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Catches unhandled render and data-fetch failures anywhere in the app.
 * Before this existed, an error in a server component produced Next.js's own
 * unstyled default page: no branding, no route back, and nothing the member
 * could act on.
 *
 * The digest is shown deliberately. When a member calls support, that string is
 * how the team finds the exact failure in the logs, and asking someone to
 * describe a blank screen instead is a waste of everyone's time.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DSN] unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h1 className="font-montserrat text-xl font-bold text-navy">
          Something went wrong at our end
        </h1>
        <p className="mx-auto mt-2 max-w-sm font-opensans text-sm leading-relaxed text-gray-600">
          This is a fault in Drive Service Network, not anything you did. Your
          vehicles, appointments and membership are unaffected.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="primary" size="md" onClick={reset}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" size="md" asChild>
            <Link href="/dashboard">
              <Home className="mr-1.5 h-4 w-4" />
              Go to my dashboard
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-6 border-t border-gray-100 pt-4 font-opensans text-xs text-gray-400">
            If you contact support, quote reference{" "}
            <span className="font-mono font-semibold text-gray-600">
              {error.digest}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
