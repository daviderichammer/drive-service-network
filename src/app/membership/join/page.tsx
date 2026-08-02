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
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Join DSN Free — Free Enrollment | Drive Service Network",
  description:
    "Join Drive Service Network for free. Search 40,000+ shops, book services, and manage your vehicles at no cost. Upgrade to DSN+ for commercial fleet pricing and advanced tools.",
};

const comparisonFeatures = [
  {
    category: "Pricing & Savings",
    features: [
      { name: "Commercial pricing on all repairs", dsnFree: false, dsnPlus: true },
      { name: "Fleet volume discounts", dsnFree: false, dsnPlus: true },
      { name: "Parts pricing transparency", dsnFree: false, dsnPlus: true },
      { name: "Labor rate benchmarks", dsnFree: false, dsnPlus: true },
    ],
  },
  {
    category: "Vehicle & Fleet Records",
    features: [
      { name: "Vehicle service history tracking", dsnFree: "Up to 3 vehicles", dsnPlus: "Unlimited" },
      { name: "Multi-vehicle management", dsnFree: false, dsnPlus: true },
      { name: "Maintenance schedule reminders", dsnFree: false, dsnPlus: true },
      { name: "VIN-based vehicle profiles", dsnFree: true, dsnPlus: true },
    ],
  },
  {
    category: "Booking & Service",
    features: [
      { name: "Online service booking", dsnFree: true, dsnPlus: true },
      { name: "Priority booking access", dsnFree: false, dsnPlus: true },
      { name: "Booking history & records", dsnFree: false, dsnPlus: true },
      { name: "Appointment reminders", dsnFree: false, dsnPlus: true },
    ],
  },
  {
    category: "Support & Resources",
    features: [
      { name: "Dedicated account manager", dsnFree: false, dsnPlus: true },
      { name: "Fleet operator resources", dsnFree: false, dsnPlus: true },
      { name: "Financing access", dsnFree: false, dsnPlus: true },
      { name: "Standard customer support", dsnFree: true, dsnPlus: true },
    ],
  },
];

const memberBenefits = [
  {
    icon: TrendingDown,
    title: "Commercial Savings",
    description:
      "Access negotiated commercial rates across our nationwide network. DSN+ subscribers consistently save 15–35% compared to retail pricing on repairs and maintenance.",
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
      "DSN+ subscribers get early access to upcoming features: telematics integration, predictive maintenance alerts, commercial financing, and enterprise reporting.",
    stat: "Early access",
  },
];

const dsnPlusOptions = [
  {
    name: "DSN+ 6-Month Prepaid",
    price: "$119/mo",
    note: "Billed as $714 every 6 months",
    badge: null,
    color: "border-gray-200",
  },
  {
    name: "DSN+ 12-Month Prepaid",
    price: "$99/mo",
    note: "Billed as $1,188 annually — save 20%",
    badge: "Best Value",
    color: "border-teal",
  },
  {
    name: "DSN+ Financed",
    price: "$149/mo",
    note: "Month-to-month — no prepay required",
    badge: "DSN Exclusive",
    color: "border-gold",
  },
];

const enrollmentSteps = [
  { step: "1", title: "Create Free Account", description: "Fill in your name, email, and create a password — no credit card needed" },
  { step: "2", title: "Add Your Vehicles", description: "Add your vehicles to start tracking service history immediately" },
  { step: "3", title: "Book Your First Service", description: "Search shops, get quotes, and book — right away" },
  { step: "4", title: "Upgrade to DSN+ (Optional)", description: "When you're ready for commercial pricing and advanced tools, upgrade in one click" },
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
                DSN Free — No Credit Card Required
              </span>
            </div>
            <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-white mb-6 leading-tight">
              Join DSN Free.{" "}
              <span className="text-gold">Start Saving Today.</span>
            </h1>
            <p className="font-opensans text-white/80 text-lg leading-relaxed mb-10">
              Create your free account in seconds. Search 40,000+ shops, book services, and manage your vehicles at no cost.
              Upgrade to DSN+ when you&apos;re ready for commercial fleet pricing and advanced tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="xl" asChild>
                <Link href="/auth/register?plan=free">
                  Join DSN Free
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

      {/* How Enrollment Works */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="heading-lg text-navy">
              Four Steps to{" "}
              <span className="text-teal">Full Access</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {enrollmentSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-montserrat font-black text-teal text-lg">{step.step}</span>
                </div>
                <h3 className="font-montserrat font-bold text-navy text-sm mb-2">{step.title}</h3>
                <p className="font-opensans text-gray-500 text-xs leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="heading-lg text-navy mb-4">
              Why Upgrade to{" "}
              <span className="text-teal">DSN+</span>
            </h2>
            <p className="font-opensans text-gray-500 text-lg max-w-2xl mx-auto">
              DSN Free gets you started. DSN+ gives you the commercial tools that operators running profitable fleets rely on.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {memberBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-white rounded-xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-teal" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-montserrat font-bold text-navy text-base">
                          {benefit.title}
                        </h3>
                        <span className="bg-teal/10 text-teal text-xs font-montserrat font-semibold px-2 py-0.5 rounded-full">
                          {benefit.stat}
                        </span>
                      </div>
                      <p className="font-opensans text-gray-500 text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section-padding bg-white" id="comparison">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              Feature Comparison
            </p>
            <h2 className="heading-lg text-navy">
              DSN Free vs.{" "}
              <span className="text-teal">DSN+</span>
            </h2>
            <p className="font-opensans text-gray-500 mt-4 max-w-2xl mx-auto">
              The difference is clear. DSN+ subscribers get access to tools and pricing
              that DSN Free members can unlock at any time.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 mb-4 px-4">
              <div className="col-span-1" />
              <div className="text-center">
                <span className="font-montserrat font-bold text-navy text-sm">DSN Free</span>
                <div className="font-opensans text-gray-400 text-xs mt-0.5">$0/forever</div>
              </div>
              <div className="text-center">
                <span className="font-montserrat font-bold text-teal text-sm">DSN+</span>
                <div className="font-opensans text-teal text-xs mt-0.5">From $99/mo</div>
              </div>
            </div>

            {comparisonFeatures.map((group) => (
              <div key={group.category} className="mb-6">
                <div className="bg-gray-50 rounded-lg px-4 py-2 mb-2">
                  <span className="font-montserrat font-semibold text-navy text-xs uppercase tracking-wide">
                    {group.category}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.features.map((feature) => (
                    <div
                      key={feature.name}
                      className="grid grid-cols-3 gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="col-span-1 font-opensans text-gray-700 text-sm">
                        {feature.name}
                      </div>
                      <div className="flex justify-center items-center">
                        {feature.dsnFree === true ? (
                          <CheckCircle2 className="w-5 h-5 text-teal" />
                        ) : feature.dsnFree === false ? (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        ) : (
                          <span className="font-opensans text-gray-500 text-xs text-center">
                            {feature.dsnFree}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-center items-center">
                        {feature.dsnPlus === true ? (
                          <CheckCircle2 className="w-5 h-5 text-teal" />
                        ) : feature.dsnPlus === false ? (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        ) : (
                          <span className="font-opensans text-teal text-xs font-semibold text-center">
                            {feature.dsnPlus}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DSN+ Options — gated behind free account */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              DSN+ Upgrade Options
            </p>
            <h2 className="heading-lg text-navy">
              Three Ways to{" "}
              <span className="text-teal">Subscribe to DSN+</span>
            </h2>
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="font-opensans text-amber-700 text-sm">
                <strong>Create your free account first.</strong> DSN+ pricing is revealed after free enrollment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {dsnPlusOptions.map((option) => (
              <div
                key={option.name}
                className={`bg-white rounded-xl border-2 ${option.color} p-6 shadow-card relative`}
              >
                {option.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`${option.badge === "Best Value" ? "bg-teal text-white" : "bg-gold text-navy"} text-xs font-montserrat font-bold px-3 py-1 rounded-full`}>
                      {option.badge}
                    </span>
                  </div>
                )}
                <h3 className="font-montserrat font-bold text-navy text-base mb-1 mt-2">
                  {option.name}
                </h3>
                <div className="font-montserrat font-black text-teal text-2xl mb-1">
                  {option.price}
                </div>
                <p className="font-opensans text-gray-400 text-xs mb-4">{option.note}</p>
                <div className="flex items-center gap-2 text-gray-400">
                  <Lock className="w-3 h-3" />
                  <span className="font-opensans text-xs">Available after free enrollment</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="font-opensans text-gray-500 text-sm mb-6">
              Start with DSN Free — upgrade to DSN+ at any time from your account dashboard.
            </p>
            <Button variant="gold" size="lg" asChild>
              <Link href="/auth/register?plan=free">
                Join DSN Free — It&apos;s Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="section-padding bg-navy">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="font-montserrat font-black text-gold text-4xl mb-2">40,000+</div>
                <div className="font-opensans text-white/60 text-sm">U.S. Repair Facilities</div>
              </div>
              <div>
                <div className="font-montserrat font-black text-gold text-4xl mb-2">Up to 25%</div>
                <div className="font-opensans text-white/60 text-sm">Commercial Savings (DSN+)</div>
              </div>
              <div>
                <div className="font-montserrat font-black text-gold text-4xl mb-2">515+</div>
                <div className="font-opensans text-white/60 text-sm">Services Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
