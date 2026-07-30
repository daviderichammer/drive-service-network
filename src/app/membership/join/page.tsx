import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  TrendingDown,
  FileText,
  Truck,
  Star,
  Zap,
  Users,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Join DSN Membership — Free Enrollment",
  description:
    "Become a Drive Service Network member and unlock commercial pricing, fleet records, vehicle history, and priority service access. Free enrollment — no credit card required.",
};

const comparisonFeatures = [
  {
    category: "Pricing & Savings",
    features: [
      { name: "Commercial pricing on all repairs", member: true, nonMember: false },
      { name: "Fleet volume discounts", member: true, nonMember: false },
      { name: "Parts pricing transparency", member: true, nonMember: false },
      { name: "Labor rate benchmarks", member: true, nonMember: false },
    ],
  },
  {
    category: "Vehicle & Fleet Records",
    features: [
      { name: "Vehicle service history tracking", member: true, nonMember: false },
      { name: "Multi-vehicle management", member: true, nonMember: false },
      { name: "Maintenance schedule reminders", member: true, nonMember: false },
      { name: "VIN-based vehicle profiles", member: true, nonMember: false },
    ],
  },
  {
    category: "Booking & Service",
    features: [
      { name: "Online service booking", member: true, nonMember: true },
      { name: "Priority booking access", member: true, nonMember: false },
      { name: "Booking history & records", member: true, nonMember: false },
      { name: "Appointment reminders", member: true, nonMember: false },
    ],
  },
  {
    category: "Support & Resources",
    features: [
      { name: "Dedicated member support", member: true, nonMember: false },
      { name: "Fleet operator resources", member: true, nonMember: false },
      { name: "Financing access", member: true, nonMember: false },
      { name: "Standard customer support", member: true, nonMember: true },
    ],
  },
];

const memberBenefits = [
  {
    icon: TrendingDown,
    title: "Commercial Savings",
    description:
      "Access negotiated commercial rates across our nationwide network. Members consistently save 15–35% compared to retail pricing on repairs and maintenance.",
    stat: "Up to 35% savings",
  },
  {
    icon: FileText,
    title: "Vehicle History",
    description:
      "Every service visit is automatically logged. Build a complete maintenance record for each vehicle — invaluable for resale, insurance, and fleet audits.",
    stat: "Full service history",
  },
  {
    icon: Truck,
    title: "Fleet Records",
    description:
      "Manage multiple vehicles under one account. Track service status, costs, and schedules across your entire fleet from a single dashboard.",
    stat: "Unlimited vehicles",
  },
  {
    icon: Zap,
    title: "Future Features",
    description:
      "Members get early access to upcoming features: telematics integration, predictive maintenance alerts, commercial financing, and enterprise reporting.",
    stat: "Early access",
  },
];

const futureTiers = [
  {
    name: "Basic",
    price: "Coming Soon",
    description: "For individual operators and small fleets",
    features: ["Up to 5 vehicles", "Basic reporting", "Email support", "Commercial pricing"],
    color: "border-gray-200",
    badge: null,
  },
  {
    name: "Professional",
    price: "Coming Soon",
    description: "For growing fleets and serious operators",
    features: [
      "Up to 25 vehicles",
      "Advanced analytics",
      "Priority support",
      "Commercial pricing",
      "Fleet dashboards",
      "Multi-user access",
    ],
    color: "border-teal",
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large commercial fleets and organizations",
    features: [
      "Unlimited vehicles",
      "Enterprise reporting",
      "Dedicated account manager",
      "Commercial financing",
      "API access",
      "Custom integrations",
    ],
    color: "border-gold",
    badge: "Best Value",
  },
];

const enrollmentSteps = [
  { step: "1", title: "Create Account", description: "Fill in your name, email, and create a password" },
  { step: "2", title: "Add Your Vehicles", description: "Add your vehicles to start tracking service history" },
  { step: "3", title: "Book Your First Service", description: "Access commercial pricing immediately" },
];

export default function MembershipJoinPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-700 to-navy-900" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
          <div className="w-full h-full bg-gradient-to-l from-teal to-transparent" />
        </div>
        <div className="section-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full border border-gold/30 mb-6">
              <Star className="w-4 h-4 text-gold" />
              <span className="font-montserrat font-semibold text-gold text-sm">
                Free Enrollment — No Credit Card Required
              </span>
            </div>
            <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-white mb-6 leading-tight">
              Membership That{" "}
              <span className="text-gold">Pays for Itself</span>
            </h1>
            <p className="font-opensans text-white/80 text-lg leading-relaxed mb-10">
              DSN membership isn&apos;t a cost — it&apos;s an investment. Commercial pricing,
              complete vehicle records, and fleet management tools that save operators
              thousands every year. Start free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="xl" asChild>
                <Link href="/auth/register">
                  Become a Member — It&apos;s Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-white text-white hover:bg-white hover:text-navy"
                asChild
              >
                <Link href="#comparison">See What You Get</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="heading-lg text-navy mb-4">
              Why Operators Choose{" "}
              <span className="text-teal">DSN Membership</span>
            </h2>
            <p className="font-opensans text-gray-500 text-lg max-w-2xl mx-auto">
              We built DSN because operators deserve the same commercial advantages
              that large fleets have always had. Membership levels the playing field.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {memberBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal/30 hover:shadow-card transition-all duration-300"
              >
                <div className="w-14 h-14 bg-teal/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-7 h-7 text-teal" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-montserrat font-bold text-navy text-lg">
                      {benefit.title}
                    </h3>
                    <span className="font-montserrat font-bold text-teal text-sm bg-teal/10 px-3 py-1 rounded-full">
                      {benefit.stat}
                    </span>
                  </div>
                  <p className="font-opensans text-gray-500 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="heading-lg text-navy mb-4">
              Member vs.{" "}
              <span className="text-teal">Non-Member</span>
            </h2>
            <p className="font-opensans text-gray-500 text-lg max-w-2xl mx-auto">
              The difference is clear. DSN members get access to tools and pricing
              that non-members simply cannot access.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-1" />
              <div className="bg-teal rounded-xl p-4 text-center shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield className="w-5 h-5 text-white" />
                  <span className="font-montserrat font-bold text-white text-base">
                    DSN Member
                  </span>
                </div>
                <span className="font-opensans text-teal-100 text-sm">Free to join</span>
              </div>
              <div className="bg-gray-200 rounded-xl p-4 text-center">
                <span className="font-montserrat font-bold text-gray-600 text-base">
                  Non-Member
                </span>
                <p className="font-opensans text-gray-500 text-sm mt-1">Standard access</p>
              </div>
            </div>

            {/* Feature Categories */}
            {comparisonFeatures.map((category) => (
              <div key={category.category} className="mb-6">
                <div className="bg-navy/5 rounded-lg px-4 py-2 mb-2">
                  <span className="font-montserrat font-bold text-navy text-sm uppercase tracking-wide">
                    {category.category}
                  </span>
                </div>
                <div className="space-y-1">
                  {category.features.map((feature) => (
                    <div
                      key={feature.name}
                      className="grid grid-cols-3 gap-4 items-center px-4 py-3 bg-white rounded-lg border border-gray-100"
                    >
                      <span className="font-opensans text-sm text-gray-700 col-span-1">
                        {feature.name}
                      </span>
                      <div className="flex justify-center">
                        {feature.member ? (
                          <CheckCircle2 className="w-5 h-5 text-teal" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex justify-center">
                        {feature.nonMember ? (
                          <CheckCircle2 className="w-5 h-5 text-gray-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* CTA Row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="col-span-1" />
              <div className="text-center">
                <Button variant="gold" size="lg" asChild className="w-full">
                  <Link href="/auth/register">
                    Join Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="text-center">
                <Button variant="outline" size="lg" asChild className="w-full">
                  <Link href="/book">Book Without Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Steps */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="heading-lg text-navy mb-4">
              Get Started in{" "}
              <span className="text-teal">3 Simple Steps</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {enrollmentSteps.map((step, index) => (
                <div key={step.step} className="text-center relative">
                  {index < enrollmentSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="font-montserrat font-bold text-white text-xl">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="font-montserrat font-bold text-navy text-base mb-2">
                      {step.title}
                    </h3>
                    <p className="font-opensans text-gray-500 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="gold" size="xl" asChild>
                <Link href="/auth/register">
                  Create My Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <p className="font-opensans text-gray-400 text-sm mt-4">
                No credit card required. No commitment. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Tiers Preview */}
      <section className="section-padding bg-navy">
        <div className="section-container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full border border-gold/30 mb-6">
              <Zap className="w-4 h-4 text-gold" />
              <span className="font-montserrat font-semibold text-gold text-sm">
                Coming Soon — Tiered Membership
              </span>
            </div>
            <h2 className="heading-lg text-white mb-4">
              Paid Tiers Are{" "}
              <span className="text-gold">On the Way</span>
            </h2>
            <p className="font-opensans text-white/70 text-lg max-w-2xl mx-auto">
              We&apos;re building out Professional and Enterprise tiers with advanced fleet
              dashboards, multi-user accounts, and enterprise reporting. Join free now
              and be first in line.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {futureTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 ${tier.color} relative`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gold text-navy font-montserrat font-bold text-xs px-3 py-1 rounded-full">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-montserrat font-bold text-white text-xl mb-1">
                    {tier.name}
                  </h3>
                  <p className="font-opensans text-white/60 text-sm">{tier.description}</p>
                  <div className="mt-3">
                    <span className="font-montserrat font-bold text-gold text-2xl">
                      {tier.price}
                    </span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                      <span className="font-opensans text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal" />
                <span className="font-opensans text-white/70 text-sm">Multi-user accounts</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal" />
                <span className="font-opensans text-white/70 text-sm">Enterprise reporting</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal" />
                <span className="font-opensans text-white/70 text-sm">Fleet dashboards</span>
              </div>
            </div>
            <div className="mt-8">
              <Button variant="gold" size="xl" asChild>
                <Link href="/auth/register">
                  Join Free — Upgrade Later
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="section-container">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-teal" />
              <span className="font-opensans text-gray-600 text-sm">
                Your data is never sold
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-teal" />
              <span className="font-opensans text-gray-600 text-sm">
                Cancel anytime, no fees
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-gold" />
              <span className="font-opensans text-gray-600 text-sm">
                Trusted by fleet operators nationwide
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
