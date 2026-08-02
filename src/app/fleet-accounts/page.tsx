import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Users,
  BarChart3,
  Shield,
  TrendingDown,
  MapPin,
  Clock,
  Truck,
  Building2,
  Car,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Fleet Accounts — Multi-Vehicle Fleet Management | Drive Service Network",
  description:
    "Drive Service Network Fleet Accounts are purpose-built for operators managing multiple vehicles. Create a fleet account, add all your vehicles, and manage maintenance across your entire operation from one dashboard.",
};

const fleetBenefits = [
  {
    icon: Users,
    title: "Multi-Vehicle Account",
    description:
      "Add unlimited vehicles to a single fleet account. Manage service history, maintenance schedules, and costs for every vehicle in your operation from one centralized dashboard.",
    color: "text-teal",
    bg: "bg-teal/10",
  },
  {
    icon: TrendingDown,
    title: "Commercial Fleet Pricing",
    description:
      "DSN+ Fleet accounts receive commercial pricing tiers negotiated on your behalf — typically 15-25% below standard retail rates across our 40,000+ facility network.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: MapPin,
    title: "Nationwide Coverage",
    description:
      "One fleet account covers every vehicle regardless of where it operates. Service in Miami, Chicago, Los Angeles — same pricing, same quality, same account.",
    color: "text-navy",
    bg: "bg-navy/10",
  },
  {
    icon: BarChart3,
    title: "Fleet Analytics Dashboard",
    description:
      "Track maintenance costs, service history, and fleet performance across all vehicles. Make data-driven decisions that improve profitability and reduce downtime.",
    color: "text-teal",
    bg: "bg-teal/10",
  },
  {
    icon: Users,
    title: "Dedicated Account Manager",
    description:
      "Fleet accounts receive dedicated support from operators who understand your business. Not a call center — a team that speaks your language.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: Shield,
    title: "Compliance & Inspections",
    description:
      "State inspections, emissions testing, DOT compliance, and commercial vehicle certifications — all available through the network with full documentation.",
    color: "text-navy",
    bg: "bg-navy/10",
  },
];

const fleetTypes = [
  {
    id: "turo",
    icon: Car,
    name: "Turo & Rental Hosts",
    description:
      "Managing a Turo or rental fleet means every day of downtime is lost revenue. A DSN Fleet Account gives you fast scheduling, commercial pricing, and nationwide coverage to minimize that downtime.",
    vehicles: "1–50 vehicles",
    highlights: [
      "Same-day and next-day appointment availability",
      "Nationwide network — service wherever your cars are",
      "Commercial pricing reduces repair costs 15-25%",
      "Centralized service history for every vehicle",
    ],
  },
  {
    id: "rental",
    icon: Building2,
    name: "Rental Operators",
    description:
      "Professional rental operators managing 20+ vehicles across multiple markets need a platform that scales with their operation. DSN Fleet Accounts deliver consistency, commercial pricing, and centralized management.",
    vehicles: "20–500+ vehicles",
    highlights: [
      "One platform for all vehicles in all markets",
      "Consistent quality through certified shop network",
      "Centralized service history for every vehicle",
      "Commercial pricing scales with fleet size",
    ],
  },
  {
    id: "commercial",
    icon: Truck,
    name: "Commercial Fleets",
    description:
      "Corporate fleet managers and commercial operators need enterprise-grade tools, compliance support, and maximum pricing leverage. DSN Fleet Accounts deliver all of it.",
    vehicles: "50–1,000+ vehicles",
    highlights: [
      "DOT-compliant inspection services nationwide",
      "Single vendor relationship for all markets",
      "Detailed cost reporting and analytics",
      "Priority scheduling for commercial accounts",
    ],
  },
];

const enrollmentSteps = [
  {
    step: "1",
    title: "Create Your Fleet Account",
    description:
      "Start with DSN Free — no credit card required. Select 'Fleet Account' during registration to unlock multi-vehicle management tools.",
    icon: Users,
  },
  {
    step: "2",
    title: "Add Your Vehicles",
    description:
      "Add all vehicles to your fleet account using VIN or year/make/model. Build your complete fleet roster in minutes.",
    icon: Car,
  },
  {
    step: "3",
    title: "Book Services for Any Vehicle",
    description:
      "Search shops, select a vehicle from your fleet, and book. All service history is automatically tracked per vehicle.",
    icon: Wrench,
  },
  {
    step: "4",
    title: "Upgrade to DSN+ for Commercial Pricing",
    description:
      "When you're ready for commercial fleet pricing, priority scheduling, and the full fleet dashboard, upgrade to DSN+ in one click.",
    icon: TrendingDown,
  },
];

const fleetStats = [
  { value: "40,000+", label: "U.S. Repair Facilities" },
  { value: "15-25%", label: "Average Cost Reduction (DSN+)" },
  { value: "50 States", label: "Nationwide Coverage" },
  { value: "Unlimited", label: "Vehicles Per Fleet Account" },
];

export default function FleetAccountsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="gold" size="lg" className="mb-6">
                Fleet Accounts
              </Badge>
              <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
                Built for Operators.{" "}
                <span className="text-gold">Scaled for Fleets.</span>
              </h1>
              <p className="font-opensans text-white/80 text-lg md:text-xl leading-relaxed mb-8">
                DSN Fleet Accounts are purpose-built for operators managing multiple vehicles.
                Unlike consumer-only platforms, DSN gives you a dedicated multi-vehicle account
                with centralized management, commercial pricing, and fleet-grade tools — starting free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="gold" size="lg" asChild>
                  <Link href="/auth/register?plan=free&account=fleet">
                    Create Fleet Account — Free
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

      {/* DSN Differentiator Banner */}
      <section className="bg-teal py-6">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-montserrat font-bold text-white text-lg">
                DSN Fleet Accounts: A Key Differentiator
              </p>
              <p className="font-opensans text-white/80 text-sm mt-1">
                Consumer-only platforms like Openbay are built for individual car owners. DSN is built for operators managing fleets.
              </p>
            </div>
            <Link
              href="/auth/register?plan=free&account=fleet"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-white text-teal font-montserrat font-bold text-sm rounded-lg hover:bg-gray-50 transition-all"
            >
              Create Fleet Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Fleet Enrollment Steps */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              Fleet Enrollment
            </p>
            <h2 className="heading-lg text-navy">
              Get Your Fleet Set Up in{" "}
              <span className="text-teal">Four Steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {enrollmentSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="text-center">
                  <div className="w-14 h-14 bg-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                    <Icon className="w-6 h-6 text-teal" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                      <span className="font-montserrat font-black text-navy text-xs">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="font-montserrat font-bold text-navy text-sm mb-2">{step.title}</h3>
                  <p className="font-opensans text-gray-500 text-xs leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/auth/register?plan=free&account=fleet">
                Start Your Fleet Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Fleet Types */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              Who We Serve
            </p>
            <h2 className="heading-lg text-navy">
              Fleet Accounts for Every{" "}
              <span className="text-teal">Type of Operator</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {fleetTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-navy" />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-montserrat font-bold text-navy text-lg">
                      {type.name}
                    </h3>
                    <span className="bg-teal/10 text-teal text-xs font-montserrat font-semibold px-2 py-0.5 rounded-full">
                      {type.vehicles}
                    </span>
                  </div>
                  <p className="font-opensans text-gray-500 text-sm leading-relaxed mb-5">
                    {type.description}
                  </p>
                  <ul className="space-y-2">
                    {type.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                        <span className="font-opensans text-gray-600 text-sm">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fleet Benefits */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              Fleet Account Features
            </p>
            <h2 className="heading-lg text-navy">
              Everything Your Fleet{" "}
              <span className="text-teal">Needs</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fleetBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-teal/30 hover:shadow-card transition-all duration-300 bg-gray-50"
                >
                  <div
                    className={`w-12 h-12 ${benefit.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <div>
                    <h3 className="font-montserrat font-bold text-navy text-sm mb-1">
                      {benefit.title}
                    </h3>
                    <p className="font-opensans text-gray-500 text-xs leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-hero">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-montserrat font-black text-white text-3xl md:text-4xl leading-tight mb-6">
              Ready to Manage Your Fleet{" "}
              <span className="text-gold">the Right Way?</span>
            </h2>
            <p className="font-opensans text-white/70 text-lg leading-relaxed mb-10">
              Create your DSN Fleet Account for free. Add your vehicles, book services, and upgrade to DSN+ for commercial pricing when you&apos;re ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" asChild>
                <Link href="/auth/register?plan=free&account=fleet">
                  <span className="text-navy font-bold">Create Fleet Account — Free</span>
                  <ArrowRight className="w-5 h-5 text-navy" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact" className="text-gold">Contact Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
