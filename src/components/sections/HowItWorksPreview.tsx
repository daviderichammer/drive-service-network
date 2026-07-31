import React from "react";
import Link from "next/link";
import { Search, CalendarCheck, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find a Shop in Your Zip Code",
    description:
      "Enter your ZIP code and vehicle details. Our platform instantly surfaces certified repair shops in your area with real-time availability — no phone calls, no waiting.",
    highlight: "A Nationwide Network since 2012",
    color: "bg-teal",
    iconColor: "text-teal",
    iconBg: "bg-teal/10",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Instant Quote & Schedule",
    description:
      "Select your service, choose a convenient time slot, and confirm your appointment in seconds. Our 3-step process replaces the industry's typical 6-step workflow.",
    highlight: "30-minute time slots, real-time availability",
    color: "bg-gold",
    iconColor: "text-gold",
    iconBg: "bg-gold/10",
  },
  {
    number: "03",
    icon: Wrench,
    title: "Get It Done",
    description:
      "Drop off your vehicle and let the certified technicians handle the rest. Track service status, receive updates, and maintain your complete service history in one place.",
    highlight: "Full service history, all vehicles, one dashboard",
    color: "bg-navy",
    iconColor: "text-navy",
    iconBg: "bg-navy/10",
  },
];

export function HowItWorksPreview() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="section-container">
        <div className="text-center mb-14">
          <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
            Find. Book. Repaired.
          </p>
          <h2 className="heading-lg text-navy">
            Service in{" "}
            <span className="text-teal">3 Simple Steps</span>
          </h2>
          <p className="body-lg text-gray-500 mt-4 max-w-2xl mx-auto">
            We eliminated the complexity. What used to take 6 steps and multiple
            phone calls now takes minutes — from any device, anywhere.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-teal via-gold to-navy opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Step Card */}
                  <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-300 h-full flex flex-col">
                    {/* Step Number + Icon */}
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-14 h-14 ${step.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-7 h-7 ${step.iconColor}`} />
                      </div>
                      <div
                        className={`font-montserrat font-black text-5xl ${step.iconColor} opacity-20 leading-none`}
                      >
                        {step.number}
                      </div>
                    </div>

                    <h3 className="font-montserrat font-bold text-navy text-xl mb-3">
                      {step.title}
                    </h3>

                    <p className="font-opensans text-gray-500 text-sm leading-relaxed flex-1">
                      {step.description}
                    </p>

                    {/* Highlight */}
                    <div className={`mt-5 pt-4 border-t border-gray-100`}>
                      <p className={`font-montserrat font-semibold text-xs ${step.iconColor} uppercase tracking-wide`}>
                        {step.highlight}
                      </p>
                    </div>
                  </div>

                  {/* Arrow between steps (mobile/tablet) */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center my-2">
                      <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="secondary" size="lg" asChild>
            <Link href="/how-it-works">
              See the Full Workflow
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <p className="mt-4 font-opensans text-gray-400 text-sm">
            No registration required to explore the platform
          </p>
        </div>
      </div>
    </section>
  );
}
