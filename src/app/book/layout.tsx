import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Car, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { requireQuoteEligibility } from "@/lib/membership/gate";

export const metadata: Metadata = {
  title: "Get a Quote — Drive Service Network",
  description:
    "Members get pricing from participating service facilities near their vehicle through Drive Service Network.",
};

export const dynamic = "force-dynamic";

/**
 * REVAMP BUILD Absolute Rules 1 and 2, enforced server-side:
 *   - No quotes or bookings until the visitor creates a FREE DSN membership.
 *   - Every quote must be tied to a vehicle in the member's profile.
 *
 * The gate is a full, explanatory interstitial rather than a bare redirect, so
 * the visitor understands what is being asked and why (BUILD section 6).
 */
export default async function BookLayout({ children }: { children: React.ReactNode }) {
  const gate = await requireQuoteEligibility("/book");

  if (gate.allowed) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const isMembershipGate = gate.reason === "NO_MEMBERSHIP";

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24">
      <div className="section-container">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card md:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy/5">
            {isMembershipGate ? (
              <Lock className="h-6 w-6 text-navy/50" />
            ) : (
              <Car className="h-6 w-6 text-navy/50" />
            )}
          </div>

          <h1 className="mt-6 font-montserrat text-2xl font-bold text-navy">
            {isMembershipGate
              ? "One quick step before we show you pricing"
              : "Add a vehicle to continue"}
          </h1>

          <p className="mx-auto mt-3 max-w-md font-opensans text-sm leading-relaxed text-gray-500">
            {gate.message}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="gold" size="lg" asChild>
              <Link href={gate.redirectTo}>
                {isMembershipGate ? "Create My Free Membership" : "Add My Vehicle"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>

            {isMembershipGate && (
              <Button variant="ghost" size="lg" asChild>
                <Link href="/auth/login?callbackUrl=/book">I already have an account</Link>
              </Button>
            )}
          </div>

          {isMembershipGate && (
            <p className="mt-6 font-montserrat text-xs font-bold uppercase tracking-widest text-teal">
              No membership fee. No credit card.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
