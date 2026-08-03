"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import InstantQuoteWidget from "@/components/sections/InstantQuoteWidget";

const heroTrustPoints = [
  "Free to join — no hidden fees",
  "Vetted shops with guaranteed service",
  "Commercial fleet discounts available",
  "Book in minutes, not hours",
];

const heroStats = [
  { value: "10,000+", label: "Verified Shops" },
  { value: "50 States", label: "Nationwide Coverage" },
  { value: "4.8★", label: "Average Rating" },
  { value: "Free", label: "To Join & Use" },
];

export function HeroSection() {
  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column — Copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
              <span className="font-opensans text-white/80 text-xs font-semibold tracking-wide uppercase">
                Powered by Openbay
              </span>
            </div>

            <h1 className="font-montserrat font-black text-white text-display-sm md:text-display-md leading-tight mb-4">
              Vehicle Service,{" "}
              <span className="text-gold">Made Easy</span>
            </h1>

            <p className="font-opensans text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
              Compare prices from top-rated local shops, get instant quotes, and book your appointment online — all in one place.
            </p>

            {/* Trust Points */}
            <ul className="space-y-2.5 mb-10">
              {heroTrustPoints.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal flex-shrink-0" />
                  <span className="font-opensans text-white/80 text-sm">{point}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="gold" size="lg" asChild>
                <Link href="/membership/join">
                  Join DSN Free
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/how-it-works" className="text-gold">
                  See How It Works
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <p className="mt-6 font-opensans text-white/50 text-xs">
              Trusted by Turo hosts, rental operators, and commercial fleet managers nationwide
            </p>
          </div>

          {/* Right Column — Instant Quote Widget */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-lg">
              <InstantQuoteWidget />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center"
            >
              <div className="font-montserrat font-black text-gold text-2xl md:text-3xl">{stat.value}</div>
              <div className="font-opensans text-white/60 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
