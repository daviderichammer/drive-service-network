/**
 * DSN+ Pricing Configuration — SINGLE SOURCE OF TRUTH
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * REVAMP BUILD section H: "Do not hard-code pricing throughout multiple website
 * pages/components. Create one centralized pricing configuration so that DSN can
 * subsequently change fleet tiers, prepaid pricing, finance pricing, promotional
 * pricing and the Best Value designation without requiring changes throughout
 * the entire application. All DSN+ pricing displays should pull from the same
 * pricing source."
 *
 * Every DSN+ price rendered anywhere in the application MUST come from here.
 *
 * NOTE (FLAGS_FOR_DAVID.md F-8/F-9): these figures govern the DSN+ SUBSCRIPTION
 * cost only. They must never be used to compute or imply a discounted repair
 * price. Repair pricing may only come from the Platform API. The "up to 25%"
 * proposition is marketing copy, not a calculation input.
 */

export type PaymentPlanId = "PREPAID_6" | "PREPAID_12" | "FINANCE_12";

export interface PaymentPlan {
  id: PaymentPlanId;
  label: string;
  /** Number of months the term covers. */
  termMonths: number;
  /** True when the full term is collected up front. */
  prepaid: boolean;
  /** Marked as BEST VALUE in the UI (BUILD 16C). */
  bestValue: boolean;
  /**
   * Financing is NOT to be processed identically to prepaid membership.
   * David will determine the financing architecture (BUILD section P).
   * Until then this plan is presentational only and cannot be checked out.
   */
  requiresExternalFinancing: boolean;
}

export const PAYMENT_PLANS: readonly PaymentPlan[] = [
  {
    id: "PREPAID_6",
    label: "6-Month Prepaid",
    termMonths: 6,
    prepaid: true,
    bestValue: false,
    requiresExternalFinancing: false,
  },
  {
    id: "PREPAID_12",
    label: "12-Month Prepaid",
    termMonths: 12,
    prepaid: true,
    bestValue: true,
    requiresExternalFinancing: false,
  },
  {
    id: "FINANCE_12",
    label: "12-Month Finance",
    termMonths: 12,
    prepaid: false,
    bestValue: false,
    requiresExternalFinancing: true,
  },
] as const;

export interface FleetTier {
  id: string;
  label: string;
  minVehicles: number;
  /** null means unbounded (the 50+ tier). */
  maxVehicles: number | null;
  /** Monthly price per enrolled vehicle, in cents, keyed by payment plan. */
  monthlyPerVehicleCents: Record<PaymentPlanId, number>;
}

/**
 * Approved DSN+ fleet pricing (REVAMP BUILD section 16A).
 * Prices are per enrolled vehicle, per month, in cents.
 */
export const FLEET_TIERS: readonly FleetTier[] = [
  {
    id: "TIER_1_3",
    label: "1–3 Vehicles",
    minVehicles: 1,
    maxVehicles: 3,
    monthlyPerVehicleCents: { PREPAID_6: 1199, PREPAID_12: 999, FINANCE_12: 1499 },
  },
  {
    id: "TIER_4_9",
    label: "4–9 Vehicles",
    minVehicles: 4,
    maxVehicles: 9,
    monthlyPerVehicleCents: { PREPAID_6: 1149, PREPAID_12: 949, FINANCE_12: 1449 },
  },
  {
    id: "TIER_10_19",
    label: "10–19 Vehicles",
    minVehicles: 10,
    maxVehicles: 19,
    monthlyPerVehicleCents: { PREPAID_6: 1099, PREPAID_12: 899, FINANCE_12: 1349 },
  },
  {
    id: "TIER_20_49",
    label: "20–49 Vehicles",
    minVehicles: 20,
    maxVehicles: 49,
    monthlyPerVehicleCents: { PREPAID_6: 1049, PREPAID_12: 849, FINANCE_12: 1249 },
  },
  {
    id: "TIER_50_PLUS",
    label: "50+ Vehicles",
    minVehicles: 50,
    maxVehicles: null,
    monthlyPerVehicleCents: { PREPAID_6: 999, PREPAID_12: 799, FINANCE_12: 1199 },
  },
] as const;

/** The headline savings proposition. Must remain accurate — see BUILD 16E. */
export const DSN_PLUS_MAX_SAVINGS_LABEL = "up to 25%";

/**
 * Resolve the applicable fleet tier from a count of vehicles.
 *
 * BUILD section O: the tier is determined by the number of vehicles actually
 * being ENROLLED IN DSN+, not the number registered under the FREE membership.
 *
 * BUILD "Fleet Pricing — Billing-Date Snapshot": at each payment due date the
 * count is re-measured from ACTIVE enrolled vehicles and the tier recalculated.
 * Pass the active count on the due date to obtain the tier for that payment.
 */
export function resolveFleetTier(enrolledVehicleCount: number): FleetTier {
  const count = Math.max(1, Math.floor(enrolledVehicleCount));
  const tier = FLEET_TIERS.find(
    (t) => count >= t.minVehicles && (t.maxVehicles === null || count <= t.maxVehicles)
  );
  // Counts above the last bounded tier fall into 50+.
  return tier ?? FLEET_TIERS[FLEET_TIERS.length - 1];
}

export function getPaymentPlan(planId: PaymentPlanId): PaymentPlan {
  const plan = PAYMENT_PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown DSN+ payment plan: ${planId}`);
  return plan;
}

export interface EnrollmentQuote {
  vehicleCount: number;
  tier: FleetTier;
  plan: PaymentPlan;
  monthlyPerVehicleCents: number;
  /** Monthly equivalent across all selected vehicles. */
  monthlyTotalCents: number;
  /** Full amount due for the term (prepaid) or total of instalments (finance). */
  termTotalCents: number;
  perVehicleTermTotalCents: number;
}

/**
 * BUILD section N: "The member should never have to calculate pricing."
 * Number of DSN+ vehicles × applicable fleet-tier price × applicable term.
 */
export function calculateEnrollment(
  vehicleCount: number,
  planId: PaymentPlanId
): EnrollmentQuote {
  const tier = resolveFleetTier(vehicleCount);
  const plan = getPaymentPlan(planId);
  const monthlyPerVehicleCents = tier.monthlyPerVehicleCents[planId];
  const monthlyTotalCents = monthlyPerVehicleCents * vehicleCount;
  const perVehicleTermTotalCents = monthlyPerVehicleCents * plan.termMonths;

  return {
    vehicleCount,
    tier,
    plan,
    monthlyPerVehicleCents,
    monthlyTotalCents,
    termTotalCents: monthlyTotalCents * plan.termMonths,
    perVehicleTermTotalCents,
  };
}

/** Every plan priced for a given fleet size, for the comparison table. */
export function quoteAllPlans(vehicleCount: number): EnrollmentQuote[] {
  return PAYMENT_PLANS.map((plan) => calculateEnrollment(vehicleCount, plan.id));
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * BUILD "Billing Anniversary": the recurring monthly payment for a vehicle is
 * due on the same numerical day of each subsequent month as the enrolment date,
 * subject to normal processor treatment of shorter months. Newly enrolled
 * vehicles are NOT forced onto an existing anniversary and are NOT prorated.
 */
export function nextBillingDate(enrollmentDate: Date, monthsForward = 1): Date {
  const anniversaryDay = enrollmentDate.getUTCDate();
  const target = new Date(
    Date.UTC(
      enrollmentDate.getUTCFullYear(),
      enrollmentDate.getUTCMonth() + monthsForward,
      1,
      enrollmentDate.getUTCHours(),
      enrollmentDate.getUTCMinutes(),
      enrollmentDate.getUTCSeconds()
    )
  );
  const daysInTargetMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(anniversaryDay, daysInTargetMonth));
  return target;
}
