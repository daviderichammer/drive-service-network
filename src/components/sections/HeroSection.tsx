"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const heroStats = [
  { value: "40,000", label: "U.S. Repair Facilities" },
  { value: "515+", label: "Services Available" },
  { value: "50 States", label: "Nationwide Coverage" },
  { value: "Up to 25%", label: "Commercial Savings" },
];

const heroTrustPoints = [
  "No hidden fees or markups",
  "Instant quotes & commercial fleet pricing for all subscribers",
  "Nationwide certified shop network",
  "Up to 25% Discounts Available",
];

export function HeroSection() {
  const router = useRouter();
  const [serviceQuery, setServiceQuery] = useState("");
  const [zipCode, setZipCode] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (serviceQuery) params.set("service", serviceQuery);
    if (zipCode) params.set("zip", zipCode);
    router.push(`/book?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/40" />
      {/* Teal accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal via-gold to-teal" />

      <div className="relative section-container pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column — Content */}
          <div>
            <Badge variant="teal" size="lg" className="mb-6">
              Built by Operators. Designed for Operators.
            </Badge>
            <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
              One Network.{" "}
              <span className="text-gold">Every Vehicle.</span>{" "}
              Nationwide.
            </h1>
            <p className="font-opensans text-white/80 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              Drive Service Network connects fleet operators with trusted repair
              and maintenance providers across the country — with commercial
              pricing, simplified scheduling, and real operational expertise
              behind every interaction.
            </p>

            {/* Service Search Box */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-hero">
                <p className="font-montserrat font-semibold text-white text-sm mb-3 uppercase tracking-wide">
                  Find a Service Near You
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Oil change, brakes, tires…"
                      value={serviceQuery}
                      onChange={(e) => setServiceQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-white rounded-lg text-sm font-opensans text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal border border-transparent"
                    />
                  </div>
                  <div className="relative sm:w-40">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      maxLength={10}
                      className="w-full pl-9 pr-4 py-3 bg-white rounded-lg text-sm font-opensans text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal border border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-gold text-navy font-montserrat font-bold text-sm rounded-lg hover:bg-yellow-400 transition-all duration-200 flex-shrink-0"
                  >
                    Search
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

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

          {/* Right Column — Video Player */}
          <div className="lg:flex justify-end hidden">
            <div className="w-full max-w-md">
              {/* Video Embed Card */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-hero">
                <h3 className="font-montserrat font-bold text-white text-lg mb-4">
                  See DSN in Action
                </h3>
                <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/GJunr8sRGR0"
                    title="Drive Service Network — Platform Overview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row — below hero, full width */}
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
