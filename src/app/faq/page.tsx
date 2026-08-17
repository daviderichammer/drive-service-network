import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { DSN_FAQ } from "@/lib/faq-content";
import { QUOTE_URL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Drive Service Network FAQ",
  description:
    "Answers for Turo hosts, car rental operators and fleets about using Drive Service Network: quotes, pricing, scheduling, coverage, multiple markets and FREE Drive Membership.",
};

export default function FaqPage() {
  return (
    <>
      <section className="bg-gradient-hero pt-28 pb-14 md:pt-36 md:pb-16">
        <div className="section-container">
          <div className="max-w-3xl">
            <p className="font-montserrat text-xs font-bold uppercase tracking-[0.2em] text-teal">
              Turo Hosts | Car Rental Operators | Fleets
            </p>
            <h1 className="mt-5 font-montserrat text-4xl font-black leading-tight text-white md:text-5xl">
              Drive Service Network FAQ
            </h1>
            <p className="mt-5 font-opensans text-lg leading-relaxed text-white/75">
              Short, direct answers about finding service, comparing quotes,
              scheduling appointments and using DSN across multiple vehicles and
              markets.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl space-y-12">
            {DSN_FAQ.map((section) => (
              <div key={section.title}>
                <h2 className="mb-5 font-montserrat text-xl font-bold text-navy md:text-2xl">
                  {section.title}
                </h2>
                <FaqAccordion items={section.items} />
              </div>
            ))}

            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
              <p className="font-montserrat text-lg font-bold text-navy">
                Looking for the optional discount program?
              </p>
              <p className="mx-auto mt-3 max-w-xl font-opensans text-sm leading-relaxed text-gray-500">
                FREE Drive Membership is free. The nationwide discount program is a
                separate optional subscription.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button variant="primary" size="md" asChild>
                  <Link href="/discount-program-faq">
                    See the DSN Discount Program FAQ
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="md" asChild>
                  <Link href={QUOTE_URL}>Get an Instant Quote</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
