import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { ArrowDown, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QUOTE_URL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Financing — Drive Financial | Drive Service Network",
  description:
    "Keep Your Vehicles Moving. Keep Your Capital Working. Through our affiliated company, Drive Financial, financing options may be available to help qualified Turo hosts, car rental operators and fleets finance vehicle maintenance and repairs.",
};

const DRIVE_FINANCIAL_URL = "https://drivefinancialgroup.com";

/** CHANGE 005-C — why financing maintenance and repairs may be valuable. */
const WHY_FINANCING = [
  {
    title: "Preserve Working Capital",
    description:
      "Keep operating cash available for vehicle acquisition, payroll, insurance and other business requirements.",
  },
  {
    title: "Avoid Deferred Maintenance",
    description:
      "Don't postpone necessary maintenance simply because several vehicles require service at the same time.",
  },
  {
    title: "Handle Unexpected Repairs",
    description:
      "Major repairs can occur without warning. Financing may allow qualified operators to address the repair without absorbing the entire expense immediately.",
  },
  {
    title: "Keep Revenue-Producing Vehicles Moving",
    description:
      "If financing helps an operator authorize a necessary repair sooner, it may also help return the vehicle to revenue-producing service sooner.",
  },
];

/** CHANGE 005-D — financing within the DSN service workflow. */
const WORKFLOW = [
  "Need Service",
  "Get Multiple Nearby Quotes",
  "Compare",
  "Need Financing?",
  "Explore Drive Financial Options",
  "Select the Service Provider",
  "Get the Vehicle Serviced",
  "Get Back on the Road",
];

export default function FinancingPage() {
  return (
    <>
      {/* CHANGE 005-A — begin with the customer's problem */}
      <section className="bg-gradient-hero pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="section-container">
          <div className="max-w-3xl">
            <p className="font-montserrat text-xs font-bold uppercase tracking-[0.2em] text-teal">
              Financing
            </p>
            <h1 className="mt-5 font-montserrat text-3xl font-black leading-tight text-white md:text-5xl">
              Keep Your Vehicles Moving.{" "}
              <span className="text-gold">Keep Your Capital Working.</span>
            </h1>
            <p className="mt-6 font-opensans text-lg leading-relaxed text-white/75">
              An unexpected repair shouldn&apos;t have to sideline a
              revenue-producing vehicle simply because you don&apos;t want to take
              thousands of dollars out of your operating cash.
            </p>
            <p className="mt-4 font-opensans text-base leading-relaxed text-white/70">
              Through our affiliated company, Drive Financial, financing options may
              be available to help qualified Turo hosts, car rental operators and
              fleets finance vehicle maintenance and repairs.
            </p>
            <p className="mt-6 font-montserrat text-base font-bold text-gold md:text-lg">
              Get the Vehicle Repaired. Preserve Your Working Capital. Get Back on
              the Road.
            </p>
            <div className="mt-8">
              <Button variant="gold" size="lg" asChild>
                <a href={DRIVE_FINANCIAL_URL} target="_blank" rel="noopener noreferrer">
                  Explore Financing Options
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE 005-B — introduce Drive Financial */}
      <section className="bg-white py-16 md:py-24">
        <div className="section-container">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="heading-lg text-navy">Financing Through Drive Financial</h2>
              <p className="mt-5 font-opensans text-base leading-relaxed text-gray-600">
                Drive Financial is an affiliated Global Drive Holdings company
                focused on financing solutions for automotive businesses.
              </p>
              <p className="mt-4 font-opensans text-base leading-relaxed text-gray-600">
                Drive Service Network helps operators locate service, obtain quotes
                and access commercial pricing. Drive Financial can help qualified
                operators explore financing options for eligible vehicle
                maintenance and repair expenses.
              </p>
              <p className="mt-6 font-montserrat text-base font-black uppercase leading-snug tracking-tight text-navy md:text-lg">
                Fix the vehicle without unnecessarily tying up your working capital.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 text-center md:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy">
                <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="#E9B44C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="mt-5 font-montserrat text-2xl font-black text-navy">
                Drive Financial
              </p>
              <p className="mt-2 font-opensans text-sm text-gray-500">
                Automotive Business Financing
              </p>
              <p className="mt-1 font-opensans text-xs text-gray-400">
                An affiliated Global Drive Holdings company
              </p>
              <Link
                href={DRIVE_FINANCIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 font-montserrat text-sm font-bold text-white transition-colors hover:bg-navy-700"
              >
                Visit Drive Financial
                <ExternalLink className="h-4 w-4" />
              </Link>
              <p className="mt-4 font-opensans text-xs leading-relaxed text-gray-400">
                Drive Financial logo to be supplied.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE 005-C — why financing maintenance and repairs */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="heading-lg text-navy">
              Why Financing Vehicle Maintenance and Repairs May Be Valuable
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {WHY_FINANCING.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-white p-7 shadow-card"
              >
                <h3 className="font-montserrat text-lg font-bold text-navy">
                  {item.title}
                </h3>
                <p className="mt-3 font-opensans text-sm leading-relaxed text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHANGE 005-D — connect financing to the DSN quotation process */}
      <section className="bg-navy py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-montserrat text-2xl font-bold text-white md:text-3xl">
              Financing Within the DSN Service Workflow
            </h2>
            <p className="mt-4 font-opensans text-base leading-relaxed text-white/70">
              The operator should not have to leave the DSN process, independently
              search for financing and then start the repair process again.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-md">
            {WORKFLOW.map((step, index) => (
              <React.Fragment key={step}>
                <div
                  className={`rounded-xl px-5 py-3.5 text-center font-montserrat text-sm font-bold uppercase tracking-wide ${
                    step === "Need Financing?" ||
                    step === "Explore Drive Financial Options"
                      ? "bg-gold text-navy"
                      : "border border-white/15 bg-white/5 text-white"
                  }`}
                >
                  {step}
                </div>
                {index < WORKFLOW.length - 1 && (
                  <div className="flex justify-center py-1.5">
                    <ArrowDown className="h-4 w-4 text-teal" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center font-opensans text-sm leading-relaxed text-white/55">
            The long-term objective is to make financing feel like an integrated
            option within the Drive ecosystem.
          </p>
        </div>
      </section>

      {/* CHANGE 005-E — no unsupported financing claims */}
      <section className="bg-white py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="font-montserrat text-sm font-bold uppercase tracking-widest text-navy/60">
              Important
            </p>
            <p className="mt-3 font-opensans text-base leading-relaxed text-gray-600">
              Financing subject to application, approval, eligibility and applicable
              terms and conditions.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl text-center">
            <p className="font-montserrat text-lg font-black uppercase leading-snug tracking-tight text-navy md:text-xl">
              One Problem. Multiple Drive Companies. One Connected Solution.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="primary" size="lg" asChild>
                <Link href={QUOTE_URL}>
                  Find Service
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href={DRIVE_FINANCIAL_URL} target="_blank" rel="noopener noreferrer">
                  Explore Financing Options
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
