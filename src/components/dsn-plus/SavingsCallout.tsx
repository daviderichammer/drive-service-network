"use client";

/**
 * DSN+ savings presentation — Priority 3
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Presents the FREE-membership price against the DSN+ member price so the
 * saving is explicit at the point of decision, and carries the enrollment call
 * to action through the workflow.
 *
 * Pricing rule (P3 directive, 21 August 2026): a flat 10% discount on all
 * services for DSN+ members. The rate is never hard-coded here — it comes from
 * `@/lib/dsn-plus/discount`, the single source of truth.
 *
 * Honesty rule (BUILD sections G and I): where the network has not returned a
 * price, no dollar figure is invented. The component then presents the discount
 * as a benefit statement instead of a calculation.
 */

import Link from "next/link";
import { ArrowRight, BadgePercent, Check } from "lucide-react";
import {
  DSN_PLUS_DISCOUNT_LABEL,
  applyMemberDiscount,
  formatCents,
} from "@/lib/dsn-plus/discount";
import { cn } from "@/lib/utils";

interface SavingsCalloutProps {
  /** Standard price in cents, when the network has supplied one. */
  standardCents?: number | null;
  /** Whether the vehicle in question is already enrolled in DSN+. */
  enrolled: boolean;
  /** Where the enrollment call to action should lead. */
  enrollHref?: string;
  variant?: "card" | "inline" | "banner";
  className?: string;
}

export function SavingsCallout({
  standardCents,
  enrolled,
  enrollHref = "/membership/dsn-plus",
  variant = "card",
  className,
}: SavingsCalloutProps) {
  const pricing = applyMemberDiscount(standardCents);

  if (enrolled) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-lg border border-teal/20 bg-teal/5 px-3 py-2",
          className
        )}
      >
        <Check className="h-4 w-4 flex-shrink-0 text-teal" />
        <span className="font-montserrat text-xs font-bold uppercase tracking-wide text-teal">
          DSN+ vehicle
        </span>
        <span className="font-opensans text-xs text-gray-600">
          {pricing.hasPrice ? (
            <>
              Your {DSN_PLUS_DISCOUNT_LABEL} member discount is applied —{" "}
              <span className="font-semibold text-navy">
                {formatCents(pricing.memberCents)}
              </span>{" "}
              <span className="text-gray-400 line-through">
                {formatCents(pricing.standardCents)}
              </span>
            </>
          ) : (
            <>Your {DSN_PLUS_DISCOUNT_LABEL} member discount applies to this service.</>
          )}
        </span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span className={cn("font-opensans text-xs text-gray-500", className)}>
        {pricing.hasPrice ? (
          <>
            DSN+ price{" "}
            <span className="font-montserrat font-bold text-teal">
              {formatCents(pricing.memberCents)}
            </span>{" "}
            — save {formatCents(pricing.savingsCents)}
          </>
        ) : (
          <>DSN+ members save {DSN_PLUS_DISCOUNT_LABEL} on this service</>
        )}
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex flex-col items-start justify-between gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4 sm:flex-row sm:items-center",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <BadgePercent className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" />
          <div>
            <p className="font-montserrat text-sm font-bold text-navy">
              Save {DSN_PLUS_DISCOUNT_LABEL} on this service with DSN+
            </p>
            <p className="mt-0.5 font-opensans text-xs leading-relaxed text-gray-600">
              {pricing.hasPrice ? (
                <>
                  This vehicle would pay{" "}
                  <span className="font-semibold text-teal">
                    {formatCents(pricing.memberCents)}
                  </span>{" "}
                  instead of {formatCents(pricing.standardCents)} — a saving of{" "}
                  {formatCents(pricing.savingsCents)} on this visit alone.
                </>
              ) : (
                <>
                  Enroll this vehicle and {DSN_PLUS_DISCOUNT_LABEL} comes off every
                  service, at every facility in the network.
                </>
              )}
            </p>
          </div>
        </div>
        <Link
          href={enrollHref}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-gold px-4 py-2.5 font-montserrat text-xs font-bold text-navy transition-colors hover:bg-gold-600"
        >
          Enroll this vehicle
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  // Default: side-by-side price card.
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-4", className)}>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="pr-4">
          <p className="font-montserrat text-xs font-semibold uppercase tracking-wide text-gray-400">
            Free membership
          </p>
          <p className="mt-1 font-montserrat text-xl font-bold text-navy">
            {pricing.hasPrice ? formatCents(pricing.standardCents) : "Standard price"}
          </p>
        </div>
        <div className="pl-4">
          <p className="font-montserrat text-xs font-semibold uppercase tracking-wide text-teal">
            DSN+ member
          </p>
          <p className="mt-1 font-montserrat text-xl font-bold text-teal">
            {pricing.hasPrice
              ? formatCents(pricing.memberCents)
              : `${DSN_PLUS_DISCOUNT_LABEL} off`}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <span className="font-opensans text-xs text-gray-500">
          {pricing.hasPrice ? (
            <>
              You would save{" "}
              <span className="font-montserrat font-bold text-navy">
                {formatCents(pricing.savingsCents)}
              </span>{" "}
              on this service
            </>
          ) : (
            <>DSN+ members save {DSN_PLUS_DISCOUNT_LABEL} on every service</>
          )}
        </span>
        <Link
          href={enrollHref}
          className="inline-flex items-center gap-1 font-montserrat text-xs font-bold text-teal hover:underline"
        >
          Enroll
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
