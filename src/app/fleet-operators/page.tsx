import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, TrendingDown, Clock, MapPin, BarChart3, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "For Fleet Operators — Turo Hosts, Rental Operators & Commercial Fleets",
  description:
    "Drive Service Network was built for fleet operators. Turo hosts, rental operators, and commercial fleets get commercial pricing, nationwide coverage, and fleet management tools.",
};

const segments = [
  {
    id: "turo",
    name: "Turo Hosts",
    icon: "🚗",
    description:
      "Managing a Turo fleet means every day of downtime is lost revenue. DSN gives you the tools to minimize that downtime with fast scheduling, commercial pricing, and nationwide coverage.",
    challenges: [
      "Unexpected repairs disrupting rental income",
      "Finding trustworthy shops in unfamiliar markets",
      "High repair costs eating into margins",
      "Limited cash flow for major repairs",
    ],
    solutions: [
      "Same-day and next-day appointment availability",
      "Nationwide network — service wherever your cars are",
      "Commercial pricing reduces repair costs 15-25%",
      "Financing options for major repairs (Phase 2)",
    ],
    stat: "1-10 vehicles",
    statLabel: "Typical fleet size",
  },
  {
    id: "rental",
    name: "Rental Operators",
    icon: "🏢",
    description:
      "Professional rental operators managing 20+ vehicles across multiple markets need a platform that scales with their operation. DSN delivers consistency, commercial pricing, and centralized management.",
    challenges: [
      "Coordinating repairs across multiple markets",
      "Inconsistent vendor quality and pricing",
      "Administrative overhead of managing maintenance",
      "Tracking service history across a large fleet",
    ],
    solutions: [
      "One platform for all vehicles in all markets",
      "Consistent quality through certified shop network",
      "Centralized service history for every vehicle",
      "Commercial pricing scales with fleet size",
    ],
    stat: "20-500+",
    statLabel: "Vehicles served",
  },
  {
    id: "commercial",
    name: "Commercial Fleets",
    icon: "🚛",
    description:
      "Corporate fleet managers and commercial operators need enterprise-grade tools, compliance support, and maximum pricing leverage. DSN Enterprise delivers all of it.",
    challenges: [
      "DOT compliance and inspection management",
      "Vendor management across multiple providers",
      "Cost control and budget forecasting",
      "Fleet uptime and operational continuity",
    ],
    solutions: [
      "DOT-compliant inspection services nationwide",
      "Single vendor relationship for all markets",
      "Detailed cost reporting and analytics",
      "Priority scheduling for commercial accounts",
    ],
    stat: "Enterprise",
    statLabel: "Custom solutions",
  },
];

const keyBenefits = [
  {
    icon: TrendingDown,
    title: "Commercial Pricing",
    description:
      "DSN negotiates commercial rates with our network partners. Subscribers receive pricing tiers unavailable to the general public — typically 15-25% below standard retail.",
    color: "text-teal",
    bg: "bg-teal/10",
  },
  {
    icon: MapPin,
    title: "Nationwide Coverage",
    description:
      "One subscription covers every vehicle in your fleet, regardless of where it operates. Service in any market, same pricing, same quality standard.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: Clock,
    title: "Minimal Downtime",
    description:
      "Fast scheduling, priority access for fleet accounts, and a nationwide network means your vehicles spend less time in the shop and more time generating revenue.",
    color: "text-navy",
    bg: "bg-navy/10",
  },
  {
    icon: BarChart3,
    title: "Fleet Analytics",
    description:
      "Track maintenance costs, service history, and fleet performance across all vehicles in one centralized dashboard. Make data-driven decisions that improve profitability.",
    color: "text-teal",
    bg: "bg-teal/10",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description:
      "Fleet accounts receive dedicated account management from operators who understand your business. Not a call center — a team that speaks your language.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: Shield,
    title: "Compliance Ready",
    description:
      "State inspections, emissions testing, DOT compliance, and commercial vehicle certifications — all available through the DSN network with documentation.",
    color: "text-navy",
    bg: "bg-navy/10",
  },
];

const fleetStats = [
  { value: "220+", label: "Vehicles in our founding fleet" },
  { value: "15-25%", label: "Average cost reduction" },
  { value: "5 min", label: "Average booking time" },
  { value: "50", label: "States covered" },
];

export default function FleetOperatorsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="gold" size="lg" className="mb-6">
                For Fleet Operators
              </Badge>
              <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
                We Built This{" "}
                <span className="text-gold">For You.</span>
              </h1>
              <p className="font-opensans text-white/80 text-lg md:text-xl leading-relaxed mb-8">
                Drive Service Network was created by fleet operators who
                experienced every challenge you face. We didn&apos;t build a
                product and then look for customers. We built the solution our
                own operation needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="gold" size="lg" asChild>
                  <Link href="/membership">
                    Get Fleet Pricing
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/contact" className="text-gold">Talk to Our Team</Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {fleetStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center"
                >
                  <div className="font-montserrat font-black text-gold text-3xl md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="font-opensans text-white/60 text-xs mt-2 leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Operator Segments */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              Who We Serve
            </p>
            <h2 className="heading-lg text-navy">
              Solutions for Every{" "}
              <span className="text-teal">Type of Operator</span>
            </h2>
          </div>

          <div className="space-y-8">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                id={segment.id}
                className={`rounded-2xl border border-gray-100 overflow-hidden shadow-card ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Left */}
                  <div className="p-8 lg:p-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{segment.icon}</span>
                      <div>
                        <h3 className="font-montserrat font-bold text-navy text-xl">
                          {segment.name}
                        </h3>
                        <span className="font-opensans text-teal text-sm">
                          {segment.stat} · {segment.statLabel}
                        </span>
                      </div>
                    </div>
                    <p className="font-opensans text-gray-600 text-sm leading-relaxed mb-6">
                      {segment.description}
                    </p>

                    <div>
                      <p className="font-montserrat font-semibold text-navy text-sm uppercase tracking-wide mb-3">
                        Common Challenges
                      </p>
                      <ul className="space-y-2">
                        {segment.challenges.map((challenge) => (
                          <li
                            key={challenge}
                            className="flex items-start gap-2.5"
                          >
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-2 flex-shrink-0" />
                            <span className="font-opensans text-gray-500 text-sm">
                              {challenge}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="p-8 lg:p-10 bg-navy/5 border-l border-gray-100">
                    <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-wide mb-4">
                      DSN Solutions
                    </p>
                    <ul className="space-y-3">
                      {segment.solutions.map((solution) => (
                        <li key={solution} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                          <span className="font-opensans text-navy text-sm font-medium">
                            {solution}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8">
                      <Button variant="secondary" size="md" asChild>
                        <Link href="/membership">
                          View Plans for {segment.name}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              Platform Benefits
            </p>
            <h2 className="heading-lg text-navy">
              Built for the Way{" "}
              <span className="text-teal">Operators Actually Work</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-white rounded-xl p-7 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 ${benefit.bg} rounded-xl flex items-center justify-center mb-5`}
                  >
                    <Icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <h3 className="font-montserrat font-bold text-navy text-base mb-2">
                    {benefit.title}
                  </h3>
                  <p className="font-opensans text-gray-500 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Operator Story */}
      <section className="section-padding bg-navy">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-4">
              Our Story
            </p>
            <h2 className="font-montserrat font-black text-white text-3xl md:text-4xl leading-tight mb-6">
              We Operated 220+ Vehicles.{" "}
              <span className="text-gold">We Know Your Challenges.</span>
            </h2>
            <div className="space-y-4 font-opensans text-white/70 text-lg leading-relaxed mb-8">
              <p>
                Drive Service Network was created after years of managing one of
                Florida&apos;s largest independent rental fleets. Every challenge
                you face — finding trustworthy shops, controlling costs, managing
                downtime, coordinating across markets — we faced them too.
              </p>
              <p>
                We built the platform we wished existed. Not because it was a
                good business idea, but because we needed it ourselves.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="gold" size="lg" asChild>
                <Link href="/about">
                  Read Our Story
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/membership" className="text-gold">View Fleet Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="heading-lg text-navy mb-6">
              Ready to Reduce Your{" "}
              <span className="text-teal">Fleet Maintenance Costs?</span>
            </h2>
            <p className="font-opensans text-gray-500 text-lg leading-relaxed mb-8">
              Join Drive Service Network and start accessing commercial pricing,
              nationwide coverage, and the operational tools your fleet needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" asChild>
                <Link href="/membership">
                  Get Started Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Request a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
