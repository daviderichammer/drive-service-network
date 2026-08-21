/**
 * DSN+ MEMBER DISCOUNT — SINGLE SOURCE OF TRUTH
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * REVAMP P3 (simplified pricing directive, 21 August 2026):
 *
 *   "DSN+ pricing: USE A FLAT 10% DISCOUNT for DSN+ members on all services
 *    (simplified from the complex tier pricing in the BUILD — we will revert to
 *    the full pricing model later)."
 *
 * Every DSN+ repair-price calculation anywhere in the application MUST come
 * from this module, so that reverting to the full tier model later is a single
 * edit rather than a hunt through components.
 *
 * Relationship to `pricing.ts`: that module governs what a DSN+ SUBSCRIPTION
 * costs (per-vehicle, per-month, by fleet tier and payment plan). This module
 * governs what a DSN+ member PAYS FOR A REPAIR relative to the standard price.
 * The two are deliberately separate concerns.
 *
 * FLAG F-8 context: Openbay offers carry a single price with no member-versus-
 * standard pair, so the member price is derived here, client-side of Openbay,
 * from the standard price. Where no price is available from the Platform API at
 * all, `applyMemberDiscount` returns nulls and the UI must present the discount
 * as a benefit statement rather than inventing a dollar figure.
 */

/** The flat DSN+ member discount rate. Change this one constant to change the programme. */
export const DSN_PLUS_DISCOUNT_RATE = 0.1;

/** Display form of the discount, used in all member-facing copy. */
export const DSN_PLUS_DISCOUNT_LABEL = "10%";

/** Short benefit line used on cards, badges and CTAs. */
export const DSN_PLUS_DISCOUNT_STATEMENT = `DSN+ members save ${DSN_PLUS_DISCOUNT_LABEL} on every service`;

export interface MemberPricing {
  /** The standard (FREE membership) price in cents, as sourced from the facility. */
  standardCents: number | null;
  /** The DSN+ member price in cents after the flat discount. */
  memberCents: number | null;
  /** The amount saved in cents. */
  savingsCents: number | null;
  /** The discount rate applied, as a fraction. */
  rate: number;
  /** True when a real price was available to discount. */
  hasPrice: boolean;
}

/**
 * Applies the flat DSN+ discount to a standard price.
 *
 * Rounding: the member price is rounded to the nearest cent using half-up, and
 * the saving is computed as the difference, so `standard = member + savings`
 * always holds exactly and no cent is lost or invented in the display.
 */
export function applyMemberDiscount(standardCents: number | null | undefined): MemberPricing {
  if (
    standardCents === null ||
    standardCents === undefined ||
    !Number.isFinite(standardCents) ||
    standardCents <= 0
  ) {
    return {
      standardCents: null,
      memberCents: null,
      savingsCents: null,
      rate: DSN_PLUS_DISCOUNT_RATE,
      hasPrice: false,
    };
  }

  const standard = Math.round(standardCents);
  const memberCents = Math.round(standard * (1 - DSN_PLUS_DISCOUNT_RATE));
  return {
    standardCents: standard,
    memberCents,
    savingsCents: standard - memberCents,
    rate: DSN_PLUS_DISCOUNT_RATE,
    hasPrice: true,
  };
}

/**
 * The price a specific member actually pays, given whether the VEHICLE is
 * enrolled in DSN+.
 *
 * BUILD "Discount eligibility must follow the vehicle": eligibility is a
 * property of the vehicle's enrolment, never of the member record alone. A
 * member with one enrolled vehicle and three free vehicles gets the discount on
 * the enrolled vehicle only.
 */
export function priceForVehicle(
  standardCents: number | null | undefined,
  vehicleIsEnrolled: boolean
): MemberPricing & { payableCents: number | null } {
  const pricing = applyMemberDiscount(standardCents);
  return {
    ...pricing,
    payableCents: vehicleIsEnrolled ? pricing.memberCents : pricing.standardCents,
  };
}

/** Total savings across a set of standard prices, for dashboards and summaries. */
export function totalSavings(standardCentsList: Array<number | null | undefined>): number {
  return standardCentsList.reduce<number>((sum, cents) => {
    const { savingsCents } = applyMemberDiscount(cents);
    return sum + (savingsCents ?? 0);
  }, 0);
}

export function formatCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
