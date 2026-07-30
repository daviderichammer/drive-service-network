import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, CalendarCheck, Wrench, CheckCircle, Clock, MapPin, Car } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "How It Works — 3-Step Service Booking",
  description:
    "Schedule vehicle service in 3 simple steps with Drive Service Network. Find a shop, book an appointment, and get your vehicle serviced — all in minutes.",
};

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find a Certified Shop",
    description:
      "Enter your ZIP code and select the service your vehicle needs. Our platform instantly surfaces certified repair shops in your area with real-time availability, ratings, and service capabilities.",
    details: [
      "Search by ZIP code or city",
      "Filter by service type and vehicle make",
      "View shop ratings and reviews",
      "See real-time availability",
      "Compare pricing estimates",
    ],
    apiNote: "Powered by Openbay's nationwide network of 10,000+ certified shops",
    color: "teal",
    bgColor: "bg-teal/10",
    textColor: "text-teal",
    borderColor: "border-teal",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book Your Appointment",
    description:
      "Select your preferred time slot and confirm your appointment in seconds. Our streamlined booking process replaces the industry's typical 6-step workflow with a simple 3-step experience designed for busy operators.",
    details: [
      "30-minute time slot precision",
      "Same-day and next-day availability",
      "Instant confirmation",
      "Automatic reminders",
      "Easy rescheduling if needed",
    ],
    apiNote: "Real-time availability sync with shop management systems",
    color: "gold",
    bgColor: "bg-gold/10",
    textColor: "text-gold",
    borderColor: "border-gold",
  },
  {
    number: "03",
    icon: Wrench,
    title: "Get Your Vehicle Serviced",
    description:
      "Drop off your vehicle and let the certified technicians handle the rest. Receive status updates, review completed work, and maintain your complete service history — all within the Drive Service Network platform.",
    details: [
      "Service status notifications",
      "Digital inspection reports",
      "Complete service history",
      "Commercial pricing applied automatically",
      "All vehicles in one dashboard",
    ],
    apiNote: "Full service history synced across all fleet vehicles",
    color: "navy",
    bgColor: "bg-navy/10",
    textColor: "text-navy",
    borderColor: "border-navy",
  },
];

const vsComparison = [
  { feature: "Steps to book", dsn: "3 steps", typical: "6+ steps" },
  { feature: "Time to schedule", dsn: "Under 5 minutes", typical: "20-45 minutes" },
  { feature: "Phone calls required", dsn: "Zero", typical: "2-4 calls" },
  { feature: "Pricing transparency", dsn: "Upfront estimates", typical: "Quote after inspection" },
  { feature: "Commercial pricing", dsn: "Automatic for members", typical: "Must negotiate each time" },
  { feature: "Service history", dsn: "Centralized for all vehicles", typical: "Scattered across shops" },
  { feature: "Fleet management", dsn: "Built-in dashboard", typical: "Manual spreadsheets" },
  { feature: "Nationwide coverage", dsn: "50 states", typical: "Local only" },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="section-container">
          <div className="max-w-3xl">
            <Badge variant="teal" size="lg" className="mb-6">
              Simplified Workflow
            </Badge>
            <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
              Service in{" "}
              <span className="text-gold">3 Steps.</span>
              <br />
              Not Six.
            </h1>
            <p className="font-opensans text-white/80 text-lg md:text-xl leading-relaxed mb-8">
              We eliminated the complexity. What used to require multiple phone
              calls, back-and-forth negotiations, and a 6-step booking process
              now takes minutes — from any device, anywhere in the country.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal" />
                <span className="font-opensans text-white/70 text-sm">
                  Under 5 minutes to book
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold" />
                <span className="font-opensans text-white/70 text-sm">
                  50 states covered
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-white/60" />
                <span className="font-opensans text-white/70 text-sm">
                  All vehicle types
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Detail */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={step.number}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    !isEven ? "lg:grid-flow-dense" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={!isEven ? "lg:col-start-2" : ""}>
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-8 h-8 ${step.textColor}`} />
                      </div>
                      <div
                        className={`font-montserrat font-black text-7xl ${step.textColor} opacity-15 leading-none`}
                      >
                        {step.number}
                      </div>
                    </div>

                    <h2 className="heading-md text-navy mb-4">{step.title}</h2>
                    <p className="font-opensans text-gray-500 text-base leading-relaxed mb-6">
                      {step.description}
                    </p>

                    <ul className="space-y-2.5 mb-6">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-3">
                          <CheckCircle
                            className={`w-4 h-4 ${step.textColor} flex-shrink-0`}
                          />
                          <span className="font-opensans text-gray-600 text-sm">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 ${step.bgColor} rounded-lg`}
                    >
                      <span
                        className={`font-montserrat font-semibold ${step.textColor} text-xs`}
                      >
                        {step.apiNote}
                      </span>
                    </div>
                  </div>

                  {/* Visual */}
                  <div className={!isEven ? "lg:col-start-1 lg:row-start-1" : ""}>
                    <div
                      className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 border-2 ${step.borderColor} border-opacity-20 min-h-64 flex items-center justify-center`}
                    >
                      <div className="text-center">
                        <div
                          className={`w-24 h-24 ${step.bgColor} rounded-3xl flex items-center justify-center mx-auto mb-4`}
                        >
                          <Icon className={`w-12 h-12 ${step.textColor}`} />
                        </div>
                        <div
                          className={`font-montserrat font-black text-8xl ${step.textColor} opacity-10 leading-none`}
                        >
                          {step.number}
                        </div>
                        <p
                          className={`font-montserrat font-bold ${step.textColor} text-lg mt-2`}
                        >
                          {step.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DSN vs Typical */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              The Difference
            </p>
            <h2 className="heading-lg text-navy">
              DSN vs. The{" "}
              <span className="text-teal">Typical Experience</span>
            </h2>
            <p className="body-lg text-gray-500 mt-4 max-w-2xl mx-auto">
              We didn&apos;t just digitize the old process. We reimagined it from
              the operator&apos;s perspective.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-navy text-white">
                <div className="p-4 font-montserrat font-semibold text-sm text-white/60">
                  Feature
                </div>
                <div className="p-4 font-montserrat font-bold text-sm text-gold text-center border-l border-white/10">
                  Drive Service Network
                </div>
                <div className="p-4 font-montserrat font-semibold text-sm text-white/60 text-center border-l border-white/10">
                  Typical Process
                </div>
              </div>

              {/* Rows */}
              {vsComparison.map((row, index) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 border-b border-gray-100 last:border-0 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <div className="p-4 font-opensans text-navy text-sm font-medium">
                    {row.feature}
                  </div>
                  <div className="p-4 border-l border-gray-100 text-center">
                    <span className="font-montserrat font-semibold text-teal text-sm">
                      {row.dsn}
                    </span>
                  </div>
                  <div className="p-4 border-l border-gray-100 text-center">
                    <span className="font-opensans text-gray-400 text-sm">
                      {row.typical}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Openbay Partnership */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-4">
              Powered by Openbay
            </p>
            <h2 className="heading-lg text-navy mb-6">
              Enterprise-Grade Infrastructure.{" "}
              <span className="text-teal">DSN Experience.</span>
            </h2>
            <p className="font-opensans text-gray-500 text-lg leading-relaxed mb-8">
              Drive Service Network is powered by Openbay&apos;s industry-leading
              automotive marketplace infrastructure — giving you access to
              10,000+ certified shops, real-time availability, and seamless
              appointment management, all within the Drive Service Network
              experience.
            </p>
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="font-montserrat font-black text-3xl text-teal">10K+</div>
                <div className="font-opensans text-gray-500 text-xs mt-1">Certified Shops</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="font-montserrat font-black text-3xl text-gold">515+</div>
                <div className="font-opensans text-gray-500 text-xs mt-1">Services</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="font-montserrat font-black text-3xl text-navy">50</div>
                <div className="font-opensans text-gray-500 text-xs mt-1">States</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-navy">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-montserrat font-black text-white text-3xl md:text-4xl leading-tight mb-6">
              Ready to Experience the{" "}
              <span className="text-gold">3-Step Difference?</span>
            </h2>
            <p className="font-opensans text-white/70 text-lg leading-relaxed mb-8">
              Join Drive Service Network and schedule your first service in
              minutes. No long-term contracts. No hidden fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" asChild>
                <Link href="/membership">
                  Get Started Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Talk to Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
