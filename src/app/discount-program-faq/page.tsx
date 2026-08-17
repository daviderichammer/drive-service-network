import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Percent } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { DISCOUNT_FAQ } from "@/lib/faq-content";

export const metadata: Metadata = {
  title: "DSN Discount Program FAQ",
  description:
    "How the optional DSN Discount Program works: nationwide discounts of up to 25% on participating vehicle repairs and services for FREE Drive Members.",
};

export default function DiscountProgramFaqPage() {
  return (
    <>
      <section className="bg-gradient-hero pt-28 pb-14 md:pt-36 md:pb-16">
        <div className="section-container">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 font-montserrat text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <Percent className="h-4 w-4" />
              Optional Subscription
            </p>
            <h1 className="mt-5 font-montserrat text-4xl font-black leading-tight text-white md:text-5xl">
              DSN Discount Program FAQ
            </h1>
            <p className="mt-5 font-opensans text-lg leading-relaxed text-white/75">
              The optional subscription program through which FREE Drive Members may
              receive special nationwide discounts of up to 25% on participating
              vehicle repairs and services.
            </p>
          </div>
        </div>
      </section>

      {/* CHANGE 011-C — membership and subscription clearly distinguished */}
      <section className="bg-white py-12 md:py-14">
        <div className="section-container">
          <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border-2 border-teal/30 bg-teal/5 p-7">
              <p className="font-montserrat text-sm font-black uppercase tracking-wide text-teal">
                Free Drive Membership
              </p>
              <p className="mt-3 font-opensans text-sm leading-relaxed text-gray-600">
                One Registration. Easy Access to the Drive Ecosystem. Membership
                itself is FREE.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-gold/40 bg-gold/5 p-7">
              <p className="font-montserrat text-sm font-black uppercase tracking-wide text-navy">
                Optional DSN Discount Subscription
              </p>
              <p className="mt-3 font-opensans text-sm leading-relaxed text-gray-600">
                A separate optional subscription providing access to special
                nationwide discounts of up to 25% on participating vehicle repairs
                and services.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl space-y-12">
            {DISCOUNT_FAQ.map((section) => (
              <div key={section.title}>
                <h2 className="mb-5 font-montserrat text-xl font-bold text-navy md:text-2xl">
                  {section.title}
                </h2>
                <FaqAccordion items={section.items} />
              </div>
            ))}

            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
              <p className="font-montserrat text-lg font-bold text-navy">
                Have a question about using DSN itself?
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button variant="primary" size="md" asChild>
                  <Link href="/faq">
                    See the Drive Service Network FAQ
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="md" asChild>
                  <Link href="/membership/join">Join Free</Link>
                </Button>
              </div>
              <p className="mt-6 font-opensans text-xs leading-relaxed text-gray-400">
                Discounts, participating facilities, eligible services and pricing
                vary by location and service provider.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
