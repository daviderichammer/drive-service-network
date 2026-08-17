import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ServiceDirectory } from "@/components/sections/ServiceDirectory";
import { QUOTE_URL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services — Explore 515+ Maintenance & Repair Services",
  description:
    "Explore 515+ maintenance and repair services available through Drive Service Network: maintenance, mechanical repairs, tires, glass, collision, roadside assistance and inspections.",
};

export default function ServicesPage() {
  return (
    <>
      {/* CHANGE 007-D — lead-in */}
      <section className="bg-gradient-hero pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="section-container">
          <div className="max-w-3xl">
            <p className="font-montserrat text-xs font-bold uppercase tracking-[0.2em] text-teal">
              Turo Hosts | Car Rental Operators | Fleets
            </p>
            <h1 className="mt-5 font-montserrat text-4xl font-black leading-tight text-white md:text-5xl">
              What Does Your Vehicle Need?
            </h1>
            <p className="mt-4 font-montserrat text-xl font-bold text-gold md:text-2xl">
              Explore 515+ Maintenance &amp; Repair Services
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              {/* CHANGE 008-A — existing scheduling CTAs retained */}
              <Button variant="gold" size="lg" asChild>
                <Link href={QUOTE_URL}>
                  Schedule Service Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="/how-it-works"
                  className="border-white/70 text-white hover:bg-white hover:text-navy"
                >
                  See How It Works
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service directory with search and per-category CTAs */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="section-container">
          <ServiceDirectory />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-navy py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-montserrat text-2xl font-black leading-tight text-white md:text-3xl">
              Can DSN Help Me With This?
            </h2>
            <p className="mt-4 font-opensans text-base leading-relaxed text-white/70">
              Tell DSN what the vehicle needs and where the vehicle is located.
              Receive multiple quotes from participating service facilities near
              the vehicle, compare the available quotes and choose the facility
              that works best for you.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="lg" asChild>
                <Link href={QUOTE_URL}>
                  Schedule Service Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="/membership/join"
                  className="border-white/70 text-white hover:bg-white hover:text-navy"
                >
                  Join Free
                </Link>
              </Button>
            </div>
            <p className="mt-6 font-opensans text-xs text-white/45">
              Service availability, participating facilities and pricing vary by
              location.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
