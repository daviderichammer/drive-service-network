import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { NETWORK_BRANDS, QUOTE_URL } from "@/lib/content";

/**
 * CHANGE 006 — national, local and independent service providers.
 *
 * 006-A replaces the "Trusted Network Partners Include" lead-in.
 * 006-B displays recognizable brand logos rather than uniform text.
 * 006-C reinforces local and independent providers.
 * 006-D connects the section to the instant-quotation proposition.
 * 006-E avoids characterizing every provider as a DSN corporate partner.
 */
export function NetworkBrandBar() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-montserrat font-bold text-navy text-2xl md:text-3xl lg:text-4xl tracking-tight">
            Quality Service from National and Local Brands — and Independent
            Professionals
          </h2>
          <p className="font-opensans text-gray-500 text-base md:text-lg mt-4">
            Choose from recognizable national brands, quality local service
            facilities and independent professionals near your vehicle.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {NETWORK_BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="flex h-24 items-center justify-center rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                width={320}
                height={120}
                className="max-h-14 w-auto object-contain"
              />
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-navy px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-montserrat font-black text-gold text-lg md:text-xl tracking-tight">
                National Brands. Local Shops. Multiple Quotes.
              </p>
              <p className="font-opensans text-white/70 text-sm md:text-base mt-3 leading-relaxed">
                Tell us what your vehicle needs and where it&apos;s located. DSN
                helps you compare quotes from participating service providers
                nearby — so you can choose the combination of price, location and
                service that works best for you.
              </p>
            </div>
            <Link
              href={QUOTE_URL}
              className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 font-montserrat font-bold text-sm text-navy transition-colors duration-200 hover:bg-gold-600"
            >
              Get an Instant Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <p className="font-opensans text-gray-400 text-xs mt-6 text-center max-w-3xl mx-auto leading-relaxed">
          These are examples of the types of recognized national, local and
          independent service providers available through the network.
          Participating locations, services and pricing vary. Brand names and
          logos are the property of their respective owners.
        </p>
      </div>
    </section>
  );
}
