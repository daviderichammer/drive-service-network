import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const benefits = [
  "Commercial pricing on every service",
  "Nationwide shop network access",
  "Centralized fleet maintenance history",
  "Priority scheduling for fleet accounts",
  "Dedicated account management",
  "Cross-platform GDH ecosystem benefits",
];

export function FleetCTA() {
  return (
    <section className="section-padding bg-gradient-navy relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <circle cx="300" cy="200" r="200" fill="white" />
          <circle cx="350" cy="100" r="100" fill="white" />
        </svg>
      </div>

      <div className="relative section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-4">
              For Fleet Operators
            </p>
            <h2 className="font-montserrat font-black text-white text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
              Managing a Fleet?{" "}
              <span className="text-gold">We Built This For You.</span>
            </h2>
            <p className="font-opensans text-white/70 text-lg leading-relaxed mb-8">
              Whether you operate 5 vehicles or 500, Drive Service Network
              delivers the commercial tools, nationwide coverage, and operational
              expertise that independent fleet operators have needed for years.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="gold" size="lg" asChild>
                <Link href="/fleet-operators">
                  Fleet Operator Solutions
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">
                  Talk to Our Team
                </Link>
              </Button>
            </div>
          </div>

          {/* Right — Benefits */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <h3 className="font-montserrat font-bold text-white text-lg mb-6">
              Fleet Membership Includes
            </h3>
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal flex-shrink-0" />
                  <span className="font-opensans text-white/80 text-sm">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="font-opensans text-white/50 text-xs">
                Fleet accounts receive custom pricing based on fleet size and
                service volume. Contact our team for a personalized quote.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
