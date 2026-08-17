import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Gauge,
  Layers,
  MapPin,
  Phone,
  PhoneOff,
  Search,
  Timer,
  TrendingDown,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { DsnVideo } from "@/components/sections/DsnVideo";
import { NetworkBrandBar } from "@/components/sections/NetworkBrandBar";
import {
  CUSTOMER_GROUPS,
  QUOTE_URL,
  SERVICE_CATEGORIES,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Drive Service Network — One Nationwide Service Network for Your Fleet",
  description:
    "Keep your vehicles maintained, repaired and on the road with access to thousands of service facilities nationwide — with commercial pricing and discounts up to 25%. Built for Turo Hosts. Car Rental Operators. Fleets.",
};

/** CHANGE 001-E — the traditional process DSN replaces. */
const TRADITIONAL_STEPS = [
  "Identify several repair facilities.",
  "Call each facility separately.",
  "Explain the service or repair requirement repeatedly.",
  "Request pricing.",
  "Wait for estimates or written quotations.",
  "Follow up when quotations are not received.",
  "Compare the quotations manually.",
  "Decide where to send the vehicle.",
];

/** CHANGE 001-E — the DSN way. */
const DSN_QUOTE_STEPS = [
  "Tell DSN what the vehicle needs and where the vehicle is located.",
  "Receive multiple quotes from participating service facilities near the vehicle.",
  "Compare the available quotes.",
  "Choose the facility that works best for you.",
  "Get the vehicle serviced.",
  "Get it back on the road.",
];

/** CHANGE 001-D — the operator's three problems. */
const OPERATOR_PROBLEMS = [
  {
    number: "1",
    icon: DollarSign,
    title: "The Cost of the Service",
    description:
      "Every unnecessary dollar spent maintaining or repairing a vehicle reduces operating profitability.",
  },
  {
    number: "2",
    icon: Clock,
    title: "The Time Required to Find and Price the Service",
    description:
      "Operators traditionally spend substantial time locating shops, calling facilities, explaining the required service, requesting quotations and waiting for responses.",
  },
  {
    number: "3",
    icon: TrendingDown,
    title: "Vehicle Downtime",
    description:
      "Every unnecessary day a rental vehicle remains unavailable may represent another day of lost revenue.",
  },
];

/** CHANGE 001-H — why use Drive Service Network. */
const WHY_DSN = [
  {
    icon: MapPin,
    title: "Nationwide Access",
    description: "Access a nationwide network of vehicle service facilities.",
  },
  {
    icon: Timer,
    title: "Instant Quotes",
    description:
      "Request service once and receive multiple nearby quotations without individually calling multiple repair facilities.",
  },
  {
    icon: DollarSign,
    title: "Commercial Pricing",
    description:
      "Benefit from commercial/fleet pricing available through the network.",
  },
  {
    icon: TrendingDown,
    title: "Save Up to 25%",
    description:
      "Clearly communicated discounts available through participating providers.",
  },
  {
    icon: Layers,
    title: "Compare Your Options",
    description:
      "Compare nearby service providers and pricing before selecting where to have the vehicle serviced.",
  },
  {
    icon: Wrench,
    title: "One Network — Multiple Services",
    description:
      "Use DSN for routine maintenance, mechanical repairs, tires, glass, collision, roadside assistance, inspections and other vehicle-service needs.",
  },
  {
    icon: Gauge,
    title: "Reduce Downtime",
    description:
      "Spend less time locating facilities and obtaining quotations so vehicles can be serviced and returned to operation sooner.",
  },
  {
    icon: Users,
    title: "Built for Operators",
    description:
      "DSN is designed around the needs of Turo hosts, rental operators and fleets — not individual consumers.",
  },
];

/** CHANGE 001-I — the six-step process. */
const HOW_IT_WORKS_STEPS = [
  {
    title: "Tell Us What the Vehicle Needs",
    description:
      "Select the required maintenance or repair and identify where the vehicle is located.",
  },
  {
    title: "Get Multiple Nearby Quotes",
    description:
      "Receive pricing from participating service facilities near the vehicle without calling shops individually.",
  },
  {
    title: "Compare",
    description: "Review available service options and pricing in one place.",
  },
  {
    title: "Choose",
    description: "Select the facility that best meets the operator's needs.",
  },
  {
    title: "Get It Serviced",
    description: "Have the vehicle maintained or repaired.",
  },
  {
    title: "Get Back on the Road",
    description:
      "Reduce administrative time and unnecessary downtime so the vehicle can return to revenue-producing service.",
  },
];

const PROGRESSION = [
  "Need Service",
  "Get Quotes",
  "Compare",
  "Choose",
  "Get Serviced",
  "Get Back on the Road",
];

/** CHANGE 003-A — the FREE Drive Membership doorway. */
const MEMBERSHIP_DOORWAY = [
  {
    name: "Drive Service Network",
    description:
      "Maintenance, repairs, tires, glass, collision, roadside assistance, inspections and other vehicle services.",
  },
  { name: "Drive Parts Network", description: "Automotive parts." },
  { name: "Drive KeZ", description: "GPS tracking, smoke detection and theft protection." },
  {
    name: "Drive Protection",
    description: "Vehicle Service Contracts (VSC), GAP and other vehicle protection products.",
  },
  { name: "Drive Management", description: "Vehicle acquisition." },
  { name: "Drive Financial", description: "Automotive business financing." },
  { name: "Drive Connect", description: "Private car rental capability." },
  {
    name: "Drive Growth Partners Network",
    description:
      "Opportunities to earn commissions by helping other operators access Drive products and services.",
  },
  { name: "Drive Cloud", description: "Automotive technology and software capabilities." },
  {
    name: "Monthly Drive Newsletter",
    description:
      "New products, savings opportunities, operating ideas, industry developments and other information relevant to Turo hosts, rental operators and fleets.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── 001-A / 012 — Above the fold ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* LEFT — messaging and CTAs (012-A / 012-B) */}
            <div>
              <p className="font-montserrat text-xs font-bold uppercase tracking-[0.2em] text-teal">
                Built for Turo Hosts. Car Rental Operators. Fleets.
              </p>

              <h1 className="mt-5 font-montserrat text-4xl font-black leading-tight text-white md:text-5xl lg:text-[3.4rem]">
                One Nationwide Service Network{" "}
                <span className="text-gold">for Your Fleet</span>
              </h1>

              <p className="mt-5 max-w-xl font-opensans text-lg leading-relaxed text-white/75">
                Keep your vehicles maintained, repaired and on the road with
                access to thousands of service facilities nationwide — with
                commercial pricing and discounts up to 25%.
              </p>

              <p className="mt-6 font-montserrat text-lg font-black uppercase tracking-wide text-gold md:text-xl">
                Save Money. Save Hours. Reduce Downtime.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button variant="gold" size="lg" asChild>
                  <Link href={QUOTE_URL}>
                    Get an Instant Quote
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/how-it-works" className="border-white/70 text-white hover:bg-white hover:text-navy">
                    See How It Works
                  </Link>
                </Button>
              </div>
            </div>

            {/* RIGHT — embedded DSN video (012) */}
            <div className="lg:pl-4">
              <p className="mb-3 font-montserrat text-sm font-bold uppercase tracking-widest text-white/70">
                See How Drive Service Network Works
              </p>
              <DsnVideo />
            </div>
          </div>
        </div>
      </section>

      {/* ── 001-B — Who we serve ─────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
              Who We Serve
            </p>
            <h2 className="heading-lg mt-3 text-navy">
              Turo Hosts | Car Rental Operators | Fleets
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {CUSTOMER_GROUPS.map((group) => (
              <div
                key={group.name}
                className="rounded-2xl border border-gray-100 bg-white p-7 shadow-card"
              >
                <h3 className="font-montserrat text-xl font-bold text-navy">
                  {group.name}
                </h3>
                <p className="mt-3 font-opensans text-sm leading-relaxed text-gray-600">
                  {group.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 001-C / 007-C — What we do ───────────────────────────────────── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
              What We Do
            </p>
            <h2 className="heading-lg mt-3 text-navy">
              515+ Vehicle Services. <span className="text-teal">One Network.</span>
            </h2>
            <p className="body-lg mt-4 text-gray-500">
              From routine maintenance to major repairs, tires, glass, collision
              and more, Drive Service Network gives Turo hosts, car rental
              operators and fleets access to hundreds of vehicle services through
              one nationwide network.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_CATEGORIES.map((category) => (
              <div
                key={category.name}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal/10">
                  <ServiceIcon name={category.icon} className="text-teal" />
                </div>
                <h3 className="mt-4 font-montserrat text-base font-bold text-navy">
                  {category.name}
                </h3>
                <p className="mt-2 font-opensans text-sm leading-relaxed text-gray-500">
                  {category.description}
                </p>
              </div>
            ))}

            <div className="flex flex-col justify-center rounded-2xl bg-navy p-6 text-center">
              <p className="font-montserrat text-sm font-bold uppercase tracking-widest text-gold">
                515+ Services
              </p>
              <Link
                href="/services"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 font-montserrat text-sm font-bold text-navy transition-colors hover:bg-gold-600"
              >
                Explore 515+ Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center font-montserrat text-sm font-semibold uppercase tracking-widest text-navy/60">
            Maintenance | Mechanical Repairs | Tires | Glass | Collision | Roadside |
            Inspections
          </p>
        </div>
      </section>

      {/* ── 006 — National, local and independent providers ──────────────── */}
      <NetworkBrandBar />

      {/* ── 001-D — The operator's problem ───────────────────────────────── */}
      <section className="bg-navy py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-gold">
              The Operator&apos;s Problem
            </p>
            <h2 className="heading-lg mt-3 text-white">
              Our Customers Operate Revenue-Producing Vehicles
            </h2>
            <p className="body-lg mt-4 text-white/70">
              When one of those vehicles requires maintenance or repair, the
              operator actually faces three problems.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {OPERATOR_PROBLEMS.map((problem) => {
              const Icon = problem.icon;
              return (
                <div
                  key={problem.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-montserrat text-3xl font-black text-gold">
                      {problem.number}
                    </span>
                    <Icon className="h-6 w-6 text-teal" />
                  </div>
                  <h3 className="mt-4 font-montserrat text-lg font-bold text-white">
                    {problem.title}
                  </h3>
                  <p className="mt-2 font-opensans text-sm leading-relaxed text-white/65">
                    {problem.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-12 max-w-3xl rounded-2xl bg-white/10 px-6 py-8 text-center">
            <p className="font-opensans text-sm text-white/60">
              Drive Service Network addresses all three problems. The DSN
              proposition is much more than <em>find a repair facility</em>. It is:
            </p>
            <p className="mt-4 font-montserrat text-xl font-black leading-snug text-gold md:text-2xl">
              Find the Service. Compare the Price. Get the Vehicle Back on the
              Road.
            </p>
          </div>
        </div>
      </section>

      {/* ── 001-E — Instant quotations ───────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
              Instant Quotations
            </p>
            <h2 className="heading-lg mt-3 text-navy">
              Stop Calling Around for Repair Quotes.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <h3 className="font-montserrat text-base font-bold uppercase tracking-wide text-gray-500">
                  The Traditional Process
                </h3>
              </div>
              <ul className="mt-5 space-y-2.5">
                {TRADITIONAL_STEPS.map((step) => (
                  <li key={step} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                    <span className="font-opensans text-sm text-gray-500 line-through decoration-gray-300">
                      {step}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-montserrat text-sm font-bold text-gray-500">
                That process can consume hours — and sometimes days.
              </p>
            </div>

            <div className="rounded-2xl bg-navy p-7">
              <div className="flex items-center gap-2">
                <PhoneOff className="h-5 w-5 text-gold" />
                <h3 className="font-montserrat text-base font-bold uppercase tracking-wide text-gold">
                  Instant Quotes. Near the Vehicle. One Request.
                </h3>
              </div>
              <ol className="mt-5 space-y-3">
                {DSN_QUOTE_STEPS.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal font-montserrat text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="font-opensans text-sm leading-relaxed text-white/80">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="font-montserrat text-lg font-black uppercase tracking-wide text-gold">
                  Save Hours.
                </p>
                <p className="mt-2 font-opensans text-sm leading-relaxed text-white/65">
                  Instead of calling multiple shops and waiting for estimates, DSN
                  allows the operator to obtain and compare multiple nearby service
                  quotations through one process.
                </p>
                <Button variant="gold" size="md" className="mt-5" asChild>
                  <Link href={QUOTE_URL}>
                    Get an Instant Quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 001-F — The service follows the vehicle ──────────────────────── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="section-container">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
                The Service Follows the Vehicle
              </p>
              <h2 className="heading-lg mt-3 text-navy">
                Wherever the Vehicle Is, Find Service Nearby.
              </h2>
              <p className="body-lg mt-4 text-gray-600">
                The operator may be sitting in Miami while managing a vehicle
                requiring service in Atlanta, Dallas, Los Angeles or another
                market. The operator should not have to know the local repair
                market. DSN uses the location of the vehicle to identify nearby
                service options.
              </p>
              <p className="mt-4 font-opensans text-base text-gray-600">
                This makes DSN particularly valuable for operators managing
                vehicles across multiple locations and markets.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
                <Search className="h-6 w-6 text-teal" />
                <p className="mt-4 font-montserrat text-base font-bold text-navy">
                  Who near my vehicle can perform the service?
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
                <DollarSign className="h-6 w-6 text-teal" />
                <p className="mt-4 font-montserrat text-base font-bold text-navy">
                  What will it cost?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 001-G — Vehicles make money on the road ──────────────────────── */}
      <section className="bg-navy py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-montserrat text-3xl font-black leading-tight text-white md:text-4xl">
              Your Vehicles Make Money{" "}
              <span className="text-gold">When They&apos;re on the Road.</span>
            </h2>
            <p className="mt-6 font-montserrat text-lg font-bold text-teal md:text-xl">
              Maintenance and repairs are inevitable. Unnecessary downtime
              isn&apos;t.
            </p>
            <p className="mt-6 font-opensans text-base leading-relaxed text-white/70 md:text-lg">
              Drive Service Network helps Turo hosts, rental operators and fleets
              locate service, compare prices, control maintenance and repair costs
              and get vehicles back into service as quickly as possible.
            </p>
            <p className="mt-4 font-opensans text-sm leading-relaxed text-white/55">
              For a professional vehicle operator, the cost of a repair is only one
              component of the economics. A vehicle sitting unnecessarily may also
              represent lost rental or operating revenue.
            </p>
          </div>
        </div>
      </section>

      {/* ── 001-H — Why use Drive Service Network ────────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
              Why Use Drive Service Network?
            </p>
            <h2 className="heading-lg mt-3 text-navy">
              One Network. <span className="text-teal">Every Advantage.</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_DSN.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5">
                    <Icon className="h-5 w-5 text-navy" />
                  </div>
                  <h3 className="mt-4 font-montserrat text-base font-bold text-navy">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 font-opensans text-sm leading-relaxed text-gray-500">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 001-I — How it works ─────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
              How It Works
            </p>
            <h2 className="heading-lg mt-3 text-navy">Six Simple Steps</h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card"
              >
                <span className="font-montserrat text-3xl font-black text-teal/25">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-montserrat text-base font-bold text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 font-opensans text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 overflow-x-auto">
            <div className="flex min-w-max items-center justify-center gap-2">
              {PROGRESSION.map((label, index) => (
                <React.Fragment key={label}>
                  <span className="whitespace-nowrap rounded-full bg-navy px-4 py-2 font-montserrat text-xs font-bold uppercase tracking-wide text-white">
                    {label}
                  </span>
                  {index < PROGRESSION.length - 1 && (
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-teal" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button variant="primary" size="lg" asChild>
              <Link href={QUOTE_URL}>
                Find Service
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 001-J — Save Money. Save Hours. Reduce Downtime. ─────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-montserrat text-3xl font-black uppercase leading-tight tracking-tight text-navy md:text-4xl">
              Save Money. Save Hours. <span className="text-teal">Reduce Downtime.</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border-t-4 border-gold bg-gray-50 p-7">
              <h3 className="font-montserrat text-xl font-black uppercase text-navy">
                Save Money.
              </h3>
              <p className="mt-3 font-opensans text-sm leading-relaxed text-gray-600">
                Commercial/fleet pricing and discounts available through
                participating service providers help operators control maintenance
                and repair expenses.
              </p>
            </div>
            <div className="rounded-2xl border-t-4 border-teal bg-gray-50 p-7">
              <h3 className="font-montserrat text-xl font-black uppercase text-navy">
                Save Hours.
              </h3>
              <p className="mt-3 font-opensans text-sm leading-relaxed text-gray-600">
                One service request can replace the traditional process of finding
                shops, making multiple telephone calls, waiting for estimates and
                manually comparing quotations.
              </p>
            </div>
            <div className="rounded-2xl border-t-4 border-navy bg-gray-50 p-7">
              <h3 className="font-montserrat text-xl font-black uppercase text-navy">
                Reduce Downtime.
              </h3>
              <p className="mt-3 font-opensans text-sm leading-relaxed text-gray-600">
                Faster identification of nearby service options and pricing can
                help operators make service decisions faster and return vehicles to
                operation sooner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 001-K / 001-L — Network scale and commercial savings ─────────── */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="section-container">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
                Nationwide Scale
              </p>
              <h2 className="mt-3 font-montserrat text-3xl font-black leading-tight text-white md:text-4xl">
                Thousands of Service Facilities.{" "}
                <span className="text-gold">Nationwide.</span>
              </h2>
              <p className="mt-5 font-opensans text-base leading-relaxed text-white/70">
                Drive Service Network gives Turo hosts, car rental operators and
                fleets access to thousands of vehicle service facilities across the
                country — national brands, local service facilities and independent
                professionals.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-2xl md:p-10">
              <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
                Commercial Savings
              </p>
              <h3 className="mt-3 font-montserrat text-2xl font-black leading-tight text-navy md:text-3xl">
                Save Up to 25% on Vehicle Service &amp; Repairs
              </h3>
              <p className="mt-4 font-opensans text-sm leading-relaxed text-gray-600">
                DSN customers may receive commercial/fleet pricing and discounts
                through participating service providers.
              </p>
              <p className="mt-3 font-opensans text-xs leading-relaxed text-gray-400">
                Discounts, participating facilities, eligible services and pricing
                vary by location and service provider.
              </p>
              <Button variant="primary" size="md" className="mt-6" asChild>
                <Link href={QUOTE_URL}>
                  Find Service
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 001-M — One DSN regardless of fleet size ─────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
              One Drive Service Network
            </p>
            <h2 className="heading-lg mt-3 text-navy">
              Whether You Operate 5 Vehicles, 50 Vehicles or 5,000 Vehicles
            </h2>
            <p className="body-lg mt-4 text-gray-600">
              Drive Service Network helps you maintain them, repair them and keep
              them on the road.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {["5 Vehicles", "50 Vehicles", "5,000 Vehicles"].map((label) => (
                <div
                  key={label}
                  className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-8"
                >
                  <p className="font-montserrat text-2xl font-black text-navy">
                    {label}
                  </p>
                  <p className="mt-2 font-opensans text-sm text-gray-500">
                    Same network. Same process.
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-8 font-opensans text-sm leading-relaxed text-gray-500">
              Account functionality and additional services available to larger
              fleets can be discussed with our team.
            </p>
          </div>
        </div>
      </section>

      {/* ── 003-A — FREE Drive Membership ───────────────────────────────── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-montserrat text-sm font-black uppercase tracking-[0.2em] text-gold">
              Free Membership
            </p>
            <h2 className="heading-lg mt-3 text-navy">
              One Registration. Easy Access to the Drive Ecosystem.
            </h2>
            <p className="body-lg mt-4 text-gray-600">
              Join once and make it easier to access the products, services and
              resources available across the Drive family of companies.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MEMBERSHIP_DOORWAY.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
                  <div>
                    <p className="font-montserrat text-sm font-bold text-navy">
                      {item.name}
                    </p>
                    <p className="mt-1 font-opensans text-xs leading-relaxed text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-navy px-6 py-8 text-center">
            <p className="font-opensans text-sm leading-relaxed text-white/70">
              With your FREE Drive Membership, you may also subscribe to a special
              nationwide discount program offering savings of up to 25% on
              participating vehicle repairs and services.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="gold" size="lg" asChild>
                <Link href="/membership/join">
                  Join Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="/membership"
                  className="border-white/70 text-white hover:bg-white hover:text-navy"
                >
                  About FREE Drive Membership
                </Link>
              </Button>
            </div>
            <p className="mt-4 font-montserrat text-xs font-bold uppercase tracking-widest text-gold">
              No Membership Fee.
            </p>
          </div>
        </div>
      </section>

      {/* ── 001-N — Home page CTA ───────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-hero px-6 py-12 text-center md:px-12 md:py-16">
            <h2 className="font-montserrat text-3xl font-black leading-tight text-white md:text-4xl">
              Keep Your Fleet <span className="text-gold">Moving.</span>
            </h2>
            <p className="mt-5 font-opensans text-base leading-relaxed text-white/75 md:text-lg">
              One network. Thousands of service facilities. Multiple nearby quotes.
              Commercial pricing. Nationwide coverage.
            </p>
            <p className="mt-3 font-montserrat text-sm font-bold uppercase tracking-widest text-teal">
              Built for Turo hosts, car rental operators and fleets.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="lg" asChild>
                <Link href={QUOTE_URL}>
                  Find Service
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="/membership/join"
                  className="border-white/70 text-white hover:bg-white hover:text-navy"
                >
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
