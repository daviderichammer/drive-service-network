import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Percent } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FaqAccordion, type FaqItem } from "@/components/sections/FaqAccordion";
import {
  AppointmentMock,
  QuoteComparisonMock,
  ServiceRequestMock,
} from "@/components/sections/ExperienceMocks";
import { QUOTE_URL } from "@/lib/content";

export const metadata: Metadata = {
  title: "How It Works — Drive Service Network",
  description:
    "See what actually happens when you use Drive Service Network: describe the service need, get and compare multiple nearby quotes, schedule the service and access the optional discount program.",
};

/** CHANGE 007-G — In Case You're Wondering. */
const WONDERING: FaqItem[] = [
  {
    question: "Does it cost anything to get quotes?",
    answer:
      "No. There is no fee to request service or to receive quotes from participating service facilities near your vehicle.",
  },
  {
    question: "Am I obligated to choose one of the quotes?",
    answer:
      "No. You review the available options and decide. If none of them work for you, you are not obligated to proceed.",
  },
  {
    question: "Can I choose which service facility I use?",
    answer:
      "Yes. You select the participating facility you prefer based on price, location, appointment availability, ratings and other facility information.",
  },
  {
    question: "Are the prices shown before I book?",
    answer:
      "Yes. Pricing from participating facilities is shown before you schedule the appointment.",
  },
  {
    question: "Can I schedule my appointment online?",
    answer:
      "Yes. You choose the service facility, date and time that work for you and schedule the appointment through Drive Service Network.",
  },
  {
    question: "Can I communicate with the service facility?",
    answer:
      "Yes. Where the facility supports it, you can message the service facility about the appointment through Drive Service Network.",
  },
  {
    question: "What if the vehicle is in another city?",
    answer:
      "Drive Service Network uses the location of the vehicle — not your location — to identify nearby service options. You can arrange service for a vehicle located in another market.",
  },
  {
    question: "Can I use DSN for vehicles in multiple markets?",
    answer:
      "Yes. Drive Service Network is designed for operators managing vehicles across multiple locations and markets.",
  },
  {
    question: "How does the up-to-25% discount program work?",
    answer:
      "FREE Drive Members may subscribe to an optional nationwide discount program offering savings of up to 25% on participating vehicle repairs and services. Discounts, participating facilities, eligible services and pricing vary by location and service provider.",
  },
  {
    question: "Is Drive Membership really free?",
    answer:
      "Yes. There is no membership fee. The nationwide discount program is a separate optional subscription.",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Tell Us What the Vehicle Needs",
    lead: "Describe the service you need or the problem you're experiencing.",
    support: "Brake pads need replacement.",
    mock: <ServiceRequestMock />,
  },
  {
    number: "2",
    title: "Get Multiple Nearby Quotes",
    lead: "Compare. Then You Decide.",
    support: "One request. Multiple nearby service options. No calling around.",
    mock: <QuoteComparisonMock />,
  },
  {
    number: "3",
    title: "Schedule the Service",
    lead: "Service Appointment Confirmed.",
    support: "Choose the service facility, date and time that work for you.",
    mock: <AppointmentMock />,
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-gradient-hero pt-28 pb-14 md:pt-36 md:pb-16">
        <div className="section-container">
          <div className="max-w-3xl">
            <p className="font-montserrat text-xs font-bold uppercase tracking-[0.2em] text-teal">
              How It Works
            </p>
            <h1 className="mt-5 font-montserrat text-4xl font-black leading-tight text-white md:text-5xl">
              What Actually Happens When You Use DSN
            </h1>
            <p className="mt-5 font-opensans text-lg leading-relaxed text-white/75">
              Describe the service need. Get and compare multiple nearby quotes.
              Select and schedule the service. Then get back on the road.
            </p>
            <div className="mt-8">
              <Button variant="gold" size="lg" asChild>
                <Link href={QUOTE_URL}>
                  Get an Instant Quote
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE 007-E / 007-F — visual demonstration of the experience */}
      <section className="bg-white py-16 md:py-24">
        <div className="section-container space-y-16 md:space-y-24">
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy font-montserrat text-lg font-black text-gold">
                    {step.number}
                  </span>
                  <p className="font-montserrat text-xs font-bold uppercase tracking-widest text-teal">
                    Step {step.number}
                  </p>
                </div>
                <h2 className="mt-4 font-montserrat text-2xl font-bold text-navy md:text-3xl">
                  {step.title}
                </h2>
                <p className="mt-3 font-opensans text-base leading-relaxed text-gray-600 md:text-lg">
                  {step.lead}
                </p>
                <p className="mt-4 font-montserrat text-sm font-bold text-navy md:text-base">
                  {step.support}
                </p>
              </div>
              <div>{step.mock}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STEP 4 — Save Even More */}
      <section className="bg-navy py-16 md:py-24">
        <div className="section-container">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold font-montserrat text-lg font-black text-navy">
                  4
                </span>
                <p className="font-montserrat text-xs font-bold uppercase tracking-widest text-gold">
                  Step 4
                </p>
              </div>
              <h2 className="mt-4 font-montserrat text-2xl font-bold text-white md:text-3xl">
                Save Even More
              </h2>
              <p className="mt-3 font-montserrat text-xl font-black text-gold md:text-2xl">
                Save Up to 25% on Vehicle Service &amp; Repairs
              </p>
              <p className="mt-4 font-opensans text-base leading-relaxed text-white/70">
                FREE Drive Members may also subscribe to the special nationwide DSN
                discount program offering savings of up to 25% on participating
                vehicle repairs and services.
              </p>
            </div>

            {/* CHANGE 007-E / 011-C — membership and subscription distinguished */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
                <p className="font-montserrat text-sm font-black uppercase tracking-wide text-teal">
                  Free Drive Membership
                </p>
                <p className="mt-3 font-opensans text-sm leading-relaxed text-white/70">
                  One registration. Easy access to the Drive ecosystem.
                </p>
                <p className="mt-4 font-montserrat text-xs font-bold uppercase tracking-widest text-white">
                  Membership is free.
                </p>
              </div>
              <div className="rounded-2xl border border-gold/40 bg-gold/10 p-6">
                <p className="flex items-center gap-2 font-montserrat text-sm font-black uppercase tracking-wide text-gold">
                  <Percent className="h-4 w-4" />
                  Optional Discount Subscription
                </p>
                <p className="mt-3 font-opensans text-sm leading-relaxed text-white/70">
                  A separate optional subscription providing access to special
                  nationwide discounts of up to 25% on participating vehicle
                  repairs and services.
                </p>
                <p className="mt-4 font-opensans text-xs text-white/50">
                  Discounts and participating facilities vary by location.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="gold" size="lg" asChild>
              <Link href="/membership/join">
                Join Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link
                href="/discount-program-faq"
                className="border-white/70 text-white hover:bg-white hover:text-navy"
              >
                See the DSN Discount Program FAQ
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CHANGE 007-G — In Case You're Wondering */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-montserrat text-2xl font-bold text-navy md:text-3xl">
              In Case You&apos;re Wondering&hellip;
            </h2>
            <div className="mt-8">
              <FaqAccordion items={WONDERING} defaultOpen={0} />
            </div>

            <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-card">
              <p className="font-montserrat text-lg font-bold text-navy">
                Still Have Questions?
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-3 font-montserrat text-sm font-semibold text-white transition-colors hover:bg-navy-700"
                >
                  See the Drive Service Network FAQ
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/discount-program-faq"
                  className="inline-flex items-center gap-2 rounded-lg border border-navy/20 px-5 py-3 font-montserrat text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
                >
                  See the DSN Discount Program FAQ
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-white py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-hero px-6 py-12 text-center md:px-12">
            <h2 className="font-montserrat text-2xl font-black text-white md:text-3xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 font-opensans text-base text-white/75">
              Tell us what the vehicle needs and where it&apos;s located.
            </p>
            <div className="mt-7">
              <Button variant="gold" size="lg" asChild>
                <Link href={QUOTE_URL}>
                  Get an Instant Quote
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
