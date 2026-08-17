import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Shield, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ECOSYSTEM_ENTITIES, QUOTE_URL } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Drive Service Network",
  description:
    "Drive Service Network is a nationwide vehicle service and repair network built by operators for Turo hosts, car rental operators and fleets.",
};

/**
 * CHANGE 001 / GLOBAL POSITIONING RULE — the About page has been shortened and
 * aligned to the revamp. Unverified historical statistics that appeared on the
 * previous version (vehicle counts, parts-store counts, SKU counts, service-bay
 * counts and a founding year) have been removed pending verification rather
 * than rewritten. See the implementation report.
 */
const VALUES = [
  {
    icon: Target,
    title: "We Don't Sell Products. We Solve Problems.",
    description:
      "Every feature, every partnership and every decision at Drive Service Network is evaluated against one question: does this solve a real problem for operators?",
    color: "text-teal",
    bg: "bg-teal/10",
  },
  {
    icon: Heart,
    title: "Built by Operators. Designed for Operators.",
    description:
      "Drive Service Network was created by experienced fleet operators. That operational background shapes every aspect of the platform.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: Zap,
    title: "Simplicity Creates Trust.",
    description:
      "Operating vehicles is already complicated. DSN simplifies service decisions rather than introducing additional complexity.",
    color: "text-navy",
    bg: "bg-navy/10",
  },
  {
    icon: Shield,
    title: "Trust Must Be Earned.",
    description:
      "Trust is the result of every interaction — honest communication, transparent pricing and consistent execution.",
    color: "text-teal",
    bg: "bg-teal/10",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-hero pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="section-container">
          <div className="max-w-3xl">
            <p className="font-montserrat text-xs font-bold uppercase tracking-[0.2em] text-teal">
              About Drive Service Network
            </p>
            <h1 className="mt-5 font-montserrat text-4xl font-black leading-tight text-white md:text-5xl">
              Built From Real Experience.
            </h1>
            <p className="mt-6 font-opensans text-lg leading-relaxed text-white/75">
              Drive Service Network is a nationwide vehicle service and repair
              network built for Turo hosts, car rental operators and fleets — the
              operators who run vehicles as business assets.
            </p>
            <p className="mt-4 font-montserrat text-sm font-bold uppercase tracking-widest text-gold">
              Save Money. Save Hours. Reduce Downtime.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl">
            <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
              Why We Exist
            </p>
            <h2 className="heading-lg mt-3 text-navy">
              The Problem No One Was Solving
            </h2>
            <div className="mt-6 space-y-4 font-opensans text-base leading-relaxed text-gray-600">
              <p>
                Most companies begin with an idea. Drive Service Network began with
                operational necessity. Managing a rental fleet across multiple
                markets provides firsthand experience with virtually every
                operational challenge associated with fleet ownership.
              </p>
              <p>
                Although tens of thousands of repair facilities exist throughout the
                United States, there was no single nationwide resource designed
                specifically for Turo hosts, car rental operators and fleets.
              </p>
              <p className="font-semibold text-navy">
                Drive Service Network was created to fill that gap.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
              Our Mission
            </p>
            <h2 className="mt-4 font-montserrat text-3xl font-black leading-tight text-white md:text-4xl">
              Help Vehicle Operators Build{" "}
              <span className="text-gold">More Profitable Businesses.</span>
            </h2>
            <p className="mt-6 font-opensans text-base leading-relaxed text-white/70 md:text-lg">
              The mission extends beyond reducing repair costs. It includes helping
              operators increase vehicle availability, reduce downtime, better manage
              cash flow and operate with greater confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24" id="mission">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
              Our Philosophy
            </p>
            <h2 className="heading-lg mt-3 text-navy">
              The Principles That Guide Everything We Build
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="rounded-2xl border border-gray-100 bg-white p-8 shadow-card"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${value.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${value.color}`} />
                  </div>
                  <h3 className="mt-5 font-montserrat text-lg font-bold text-navy">
                    {value.title}
                  </h3>
                  <p className="mt-3 font-opensans text-sm leading-relaxed text-gray-500">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CHANGE 002 — the Drive ecosystem */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="heading-lg text-navy">
              Part of the Drive Family of Companies
            </h2>
            <p className="body-lg mt-4 text-gray-600">
              Drive Service Network Inc. is a Global Drive Holdings Inc. company.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ECOSYSTEM_ENTITIES.map((entity) => (
              <a
                key={entity.name}
                href={entity.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-gray-100 bg-white px-5 py-4 transition-colors hover:border-teal/40"
              >
                <p className="font-montserrat text-sm font-bold text-navy group-hover:text-teal">
                  {entity.name}
                </p>
                <p className="mt-1 font-opensans text-xs text-gray-500">
                  {entity.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-hero px-6 py-12 text-center md:px-12">
            <h2 className="font-montserrat text-2xl font-black text-white md:text-3xl">
              Keep Your Fleet Moving.
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="lg" asChild>
                <Link href={QUOTE_URL}>
                  Find Service
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="/contact"
                  className="border-white/70 text-white hover:bg-white hover:text-navy"
                >
                  Contact Our Team
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
