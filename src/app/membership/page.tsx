import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, Percent } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ECOSYSTEM_ENTITIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "FREE Drive Membership — One Registration. Easy Access to the Drive Ecosystem.",
  description:
    "Join once and make it easier to access the products, services and resources available across the Drive family of companies. No membership fee.",
};

/** CHANGE 003-A — the doorway list. */
const DOORWAY = [
  {
    name: "Drive Service Network",
    description:
      "Maintenance, repairs, tires, glass, collision, roadside assistance, inspections and other vehicle services.",
  },
  { name: "Drive Parts Network", description: "Automotive parts." },
  {
    name: "Drive KeZ",
    description: "GPS tracking, smoke detection and theft protection.",
  },
  {
    name: "Drive Protection",
    description:
      "Vehicle Service Contracts (VSC), GAP and other vehicle protection products.",
  },
  { name: "Drive Management", description: "Vehicle acquisition." },
  { name: "Drive Financial", description: "Automotive business financing." },
  { name: "Drive Connect", description: "Private car rental capability." },
  {
    name: "Drive Growth Partners Network",
    description:
      "Opportunities to earn commissions by helping other operators access Drive products and services.",
  },
  {
    name: "Drive Cloud",
    description: "Automotive technology and software capabilities.",
  },
  {
    name: "Monthly Drive Newsletter",
    description:
      "New products, savings opportunities, operating ideas, industry developments and other information relevant to Turo hosts, rental operators and fleets.",
  },
];

/** CHANGE 003-C — membership is the doorway, not an entitlement. */
const MAY_REQUIRE = [
  "Separate enrollment or application",
  "Credit approval",
  "Eligibility requirements",
  "Separate agreements",
  "Additional information",
  "Payment",
  "Third-party approval",
];

/** CHANGE 003-E — basic member profile. */
const PROFILE_FIELDS = [
  "Contact name",
  "Company/business name, if applicable",
  "Email",
  "Mobile phone",
  "Type of operator",
  "Approximate number of vehicles",
  "Primary operating market/location",
];

/** CHANGE 003-F — member communications. */
const NEWSLETTER_CONTENT = [
  "New Drive products and services",
  "Member savings opportunities",
  "Maintenance and repair ideas",
  "Fleet operating ideas",
  "Vehicle acquisition opportunities",
  "Financing programs",
  "Vehicle protection information",
  "Theft-prevention information",
  "Rental-industry developments",
  "New Drive ecosystem capabilities",
  "Drive Growth Partner opportunities",
];

/** CHANGE 003-G — cross-ecosystem discovery. */
const DISCOVERY = [
  "A DSN customer obtaining a brake repair may also need a VSC.",
  "A rental operator replacing vehicles may need vehicle acquisition and financing.",
  "A Turo host may need GPS tracking, smoke detection or theft protection.",
  "A fleet buying parts may also need installation or repair services.",
  "A rental operator may want to create private rentals through Drive Connect.",
  "A successful operator may want to become a Drive Growth Partner and earn commissions.",
];

export default function MembershipPage() {
  return (
    <>
      {/* Hero — CHANGE 003 principal message */}
      <section className="bg-gradient-hero pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="section-container">
          <div className="max-w-3xl">
            <p className="font-montserrat text-xs font-black uppercase tracking-[0.25em] text-gold">
              Free Membership
            </p>
            <h1 className="mt-5 font-montserrat text-3xl font-black leading-tight text-white md:text-5xl">
              One Registration. Easy Access to the Drive Ecosystem.
            </h1>
            <p className="mt-5 font-opensans text-lg leading-relaxed text-white/75">
              Drive Membership provides Turo hosts, car rental operators and fleets
              with a convenient doorway to the products, services, savings
              opportunities and resources available throughout the affiliated Drive
              companies.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button variant="gold" size="lg" asChild>
                <Link href="/membership/join">
                  Join Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="/auth/register"
                  className="border-white/70 text-white hover:bg-white hover:text-navy"
                >
                  Create Your FREE Membership
                </Link>
              </Button>
            </div>
            <p className="mt-5 font-montserrat text-sm font-bold uppercase tracking-widest text-teal">
              Membership is free. No membership fee.
            </p>
          </div>
        </div>
      </section>

      {/* CHANGE 003-A — doorway */}
      <section className="bg-white py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="heading-lg text-navy">
              Your FREE Drive Membership Is Your Doorway To:
            </h2>
            <p className="body-lg mt-4 text-gray-600">
              Join once and make it easier to access the products, services and
              resources available across the Drive family of companies.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DOORWAY.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal" />
                  <div>
                    <p className="font-montserrat text-base font-bold text-navy">
                      {item.name}
                    </p>
                    <p className="mt-1.5 font-opensans text-sm leading-relaxed text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CHANGE 011-C — membership vs optional subscription */}
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border-2 border-teal/30 bg-teal/5 p-7">
              <p className="font-montserrat text-sm font-black uppercase tracking-wide text-teal">
                Free Drive Membership
              </p>
              <p className="mt-3 font-opensans text-sm leading-relaxed text-gray-600">
                One registration. Easy access to the Drive ecosystem. Membership
                itself is FREE.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-gold/40 bg-gold/5 p-7">
              <p className="flex items-center gap-2 font-montserrat text-sm font-black uppercase tracking-wide text-navy">
                <Percent className="h-4 w-4 text-gold" />
                Optional DSN Discount Subscription
              </p>
              <p className="mt-3 font-opensans text-sm leading-relaxed text-gray-600">
                With your FREE Drive Membership, you may also subscribe to a
                special nationwide discount program offering savings of up to 25%
                on participating vehicle repairs and services.
              </p>
              <Link
                href="/discount-program-faq"
                className="mt-4 inline-flex items-center gap-1.5 font-montserrat text-sm font-semibold text-teal hover:underline"
              >
                See the DSN Discount Program FAQ
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE 003-C — doorway, not entitlement */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-montserrat text-2xl font-bold text-navy md:text-3xl">
              Easy Access to the Drive Ecosystem
            </h2>
            <p className="mt-4 text-center font-opensans text-base leading-relaxed text-gray-600">
              Membership provides easy access to the Drive ecosystem. Membership
              does not automatically qualify a member for every product or service.
              Certain products and services may require:
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {MAY_REQUIRE.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3.5 font-opensans text-sm text-navy"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE 003-D / 003-E — one registration, basic profile */}
      <section className="bg-white py-16 md:py-24">
        <div className="section-container">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="font-montserrat text-sm font-semibold uppercase tracking-widest text-teal">
                One Registration
              </p>
              <h2 className="mt-3 font-montserrat text-2xl font-bold text-navy md:text-3xl">
                Register Once. Be Recognized Across Drive.
              </h2>
              <p className="mt-4 font-opensans text-base leading-relaxed text-gray-600">
                To the greatest extent technically practical, a customer should not
                have to repeatedly enter the same basic information when moving
                among Drive companies.
              </p>
              <p className="mt-4 font-opensans text-sm leading-relaxed text-gray-500">
                Where separate third-party systems, applications or regulatory
                requirements make additional registration necessary, we retain the
                member&apos;s existing information wherever practical and minimize
                duplicate data entry.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-7">
              <p className="font-montserrat text-sm font-black uppercase tracking-wide text-navy">
                Basic Member Profile
              </p>
              <p className="mt-2 font-opensans text-sm text-gray-500">
                At registration we collect only the information reasonably
                necessary to establish the Drive Member relationship and identify
                the operator.
              </p>
              <ul className="mt-5 space-y-2.5">
                {PROFILE_FIELDS.map((field) => (
                  <li key={field} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
                    <span className="font-opensans text-sm text-navy">{field}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-montserrat text-sm font-bold uppercase tracking-wide text-teal">
                Easy to join. Easy to use.
              </p>
              <p className="mt-2 font-opensans text-xs text-gray-400">
                Additional information can be collected later when required for a
                specific product or service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE 003-F — member communications */}
      <section className="bg-navy py-16 md:py-24">
        <div className="section-container">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="flex items-center gap-2 font-montserrat text-sm font-semibold uppercase tracking-widest text-gold">
                <Mail className="h-4 w-4" />
                Member Communications
              </p>
              <h2 className="mt-3 font-montserrat text-2xl font-bold text-white md:text-3xl">
                Monthly Drive Newsletter
              </h2>
              <p className="mt-4 font-opensans text-base leading-relaxed text-white/70">
                Drive Membership creates an ongoing relationship rather than merely
                a one-time DSN transaction. Subject to appropriate marketing
                permissions and opt-out functionality, members may receive the
                Monthly Drive Newsletter.
              </p>
              <p className="mt-4 font-opensans text-sm leading-relaxed text-white/55">
                The newsletter provides useful information rather than functioning
                solely as advertising.
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {NEWSLETTER_CONTENT.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-opensans text-sm text-white/75"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE 003-G — cross-ecosystem discovery */}
      <section className="bg-white py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="heading-lg text-navy">We Don&apos;t Sell Products. We Solve Problems.</h2>
            <p className="body-lg mt-4 text-gray-600">
              Membership also helps customers discover solutions elsewhere within
              the Drive ecosystem.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {DISCOVERY.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-6 font-opensans text-sm leading-relaxed text-gray-600"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-12">
            <p className="text-center font-montserrat text-sm font-bold uppercase tracking-widest text-navy/50">
              From Our Affiliated Companies
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </section>

      {/* CHANGE 003-H — membership CTA */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-hero px-6 py-12 text-center md:px-12">
            <h2 className="font-montserrat text-2xl font-black text-white md:text-3xl">
              Join Free
            </h2>
            <p className="mt-4 font-opensans text-base text-white/75">
              One Registration. Easy Access to the Drive Ecosystem.
            </p>
            <div className="mt-7">
              <Button variant="gold" size="lg" asChild>
                <Link href="/membership/join">
                  Create Your FREE Membership
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="mt-5 font-montserrat text-xs font-bold uppercase tracking-widest text-gold">
              No Membership Fee.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
