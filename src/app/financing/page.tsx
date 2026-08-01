import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowRight,
  TrendingUp,
  Wrench,
  Truck,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Clock,
  Shield,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FinancingPreQualForm } from "@/components/financing/FinancingPreQualForm";

export const metadata: Metadata = {
  title: "Fleet Financing — Drive Service Network",
  description:
    "Drive Service Network financing is a business tool, not just a payment option. Repair financing, maintenance financing, and commercial fleet financing designed for operators.",
};

const financingTypes = [
  {
    icon: Wrench,
    title: "Repair Financing",
    description:
      "When an unexpected repair threatens your cash flow, Drive Service Network financing keeps your vehicles on the road without draining your operating capital. Finance individual repairs from $500 to $50,000 with flexible terms.",
    benefits: [
      "Same-day approval decisions",
      "Finance repairs across our entire network",
      "No prepayment penalties",
      "Preserve working capital",
    ],
    useCase: "Best for: Unexpected breakdowns, major repairs, emergency service",
  },
  {
    icon: Clock,
    title: "Maintenance Financing",
    description:
      "Spread the cost of scheduled maintenance across manageable payments. Preventive maintenance is an investment — financing makes it accessible without disrupting your cash flow.",
    benefits: [
      "Finance routine maintenance packages",
      "Predictable monthly payments",
      "Multi-vehicle maintenance plans",
      "Seasonal fleet preparation",
    ],
    useCase: "Best for: Oil changes, tire rotations, brake service, fleet prep",
  },
  {
    icon: Truck,
    title: "Commercial Fleet Financing",
    description:
      "Purpose-built for fleet operators managing multiple vehicles. Commercial fleet financing provides the capital structure to maintain your entire fleet without sacrificing liquidity.",
    benefits: [
      "Fleet-wide credit lines",
      "Volume-based pricing",
      "Consolidated billing",
      "Enterprise payment terms",
    ],
    useCase: "Best for: Turo hosts, rental operators, commercial fleets, dealers",
  },
  {
    icon: BarChart3,
    title: "Payment Plans",
    description:
      "For operators who prefer structured payment schedules, Drive Service Network offers customized payment plans that align with your revenue cycles. Pay when your vehicles are earning.",
    benefits: [
      "Flexible payment schedules",
      "Revenue-aligned payment timing",
      "No hidden fees",
      "Transparent terms",
    ],
    useCase: "Best for: Seasonal operators, variable-income fleet owners",
  },
];

const businessBenefits = [
  {
    icon: TrendingUp,
    title: "Preserve Working Capital",
    description:
      "Keep cash in your business where it generates returns. Financing your vehicle maintenance means your capital stays available for growth opportunities, inventory, or operations.",
  },
  {
    icon: Shield,
    title: "Protect Your Fleet Value",
    description:
      "Deferred maintenance destroys vehicle value. Financing removes the financial barrier to proper upkeep, protecting your most valuable business assets.",
  },
  {
    icon: DollarSign,
    title: "Tax Advantages",
    description:
      "Business financing for vehicle maintenance may be fully deductible as a business expense. Consult your tax advisor about the specific benefits for your operation.",
  },
  {
    icon: BarChart3,
    title: "Predictable Cash Flow",
    description:
      "Convert unpredictable repair costs into predictable monthly payments. Better cash flow forecasting means better business decisions.",
  },
];

const approvalProcess = [
  {
    step: "1",
    title: "Submit Pre-Qualification",
    description:
      "Complete our simple pre-qualification form. No hard credit pull — just basic business and fleet information.",
    time: "5 minutes",
  },
  {
    step: "2",
    title: "Review & Decision",
    description:
      "Our financing team reviews your application and returns a decision, typically within 1 business day.",
    time: "1 business day",
  },
  {
    step: "3",
    title: "Receive Your Terms",
    description:
      "We present financing options tailored to your fleet size and service needs. No obligation to proceed.",
    time: "Same day",
  },
  {
    step: "4",
    title: "Book & Finance",
    description:
      "Once approved, use your financing line to book services across the Drive Service Network network at commercial pricing.",
    time: "Immediate",
  },
];

const faqs = [
  {
    question: "Is Drive Service Network financing a loan or a line of credit?",
    answer:
      "Drive Service Network financing is structured as a revolving commercial credit line for fleet operators, or as individual installment financing for single-vehicle repairs. The right structure depends on your fleet size and usage patterns — our team will recommend the best fit during the pre-qualification process.",
  },
  {
    question: "What credit score is required?",
    answer:
      "We evaluate applications holistically, considering business history, fleet size, and revenue — not just personal credit scores. Many fleet operators with complex credit histories qualify for Drive Service Network financing. We encourage all operators to apply.",
  },
  {
    question: "Can I finance services at any Drive Service Network network shop?",
    answer:
      "Yes. Once approved, your Drive Service Network financing is accepted at all participating shops in our nationwide network. You book through Drive Service Network, receive commercial pricing, and your financing handles the payment directly.",
  },
  {
    question: "Are there prepayment penalties?",
    answer:
      "No. Drive Service Network financing has no prepayment penalties. If you want to pay off your balance early, you can do so at any time without additional fees.",
  },
  {
    question: "How does fleet financing differ from individual repair financing?",
    answer:
      "Fleet financing provides a credit line that covers your entire fleet's service needs over time, with consolidated billing and volume-based pricing. Individual repair financing is for single vehicles or specific repairs. Fleet operators with 3+ vehicles typically benefit more from fleet financing.",
  },
  {
    question: "Is financing available for Turo hosts and rental operators?",
    answer:
      "Absolutely. Turo hosts and rental fleet operators are among our most common financing customers. We understand the revenue dynamics of rental operations and structure financing to align with your income cycles.",
  },
  {
    question: "What is the minimum and maximum financing amount?",
    answer:
      "Individual repair financing starts at $500 with no stated maximum for qualified fleet operators. Commercial fleet lines of credit are sized based on your fleet and projected service volume — typically $5,000 to $500,000+.",
  },
  {
    question: "Does applying affect my credit score?",
    answer:
      "The initial pre-qualification is a soft inquiry and does not affect your credit score. A hard inquiry is only performed if you proceed to full application and accept financing terms.",
  },
];

export default function FinancingPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-700 to-navy-900" />
        <div className="section-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full border border-gold/30 mb-6">
              <DollarSign className="w-4 h-4 text-gold" />
              <span className="font-montserrat font-semibold text-gold text-sm">
                Financing as a Business Tool
              </span>
            </div>
            <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-white mb-6 leading-tight">
              Keep Your Fleet Moving.{" "}
              <span className="text-gold">Keep Your Capital Working.</span>
            </h1>
            <p className="font-opensans text-white/80 text-lg leading-relaxed mb-10">
              Drive Service Network financing isn&apos;t just a payment option — it&apos;s a strategic business tool.
              Operators who finance their maintenance preserve working capital, protect fleet
              value, and grow faster than those who pay out of pocket.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="xl" asChild>
                <Link href="#pre-qualify">
                  Get Pre-Qualified
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-white text-white hover:bg-white hover:text-navy"
                asChild
              >
                <Link href="#how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Case */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="heading-lg text-navy mb-4">
              Why Smart Operators{" "}
              <span className="text-teal">Finance Their Fleet</span>
            </h2>
            <p className="font-opensans text-gray-500 text-lg max-w-2xl mx-auto">
              The most successful fleet operators don&apos;t pay cash for maintenance.
              They deploy capital strategically — and financing is how they do it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {businessBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-5 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal/30 hover:shadow-card transition-all duration-300"
              >
                <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-teal" />
                </div>
                <div>
                  <h3 className="font-montserrat font-bold text-navy text-base mb-2">
                    {benefit.title}
                  </h3>
                  <p className="font-opensans text-gray-500 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financing Types */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="heading-lg text-navy mb-4">
              Financing Options for{" "}
              <span className="text-teal">Every Operator</span>
            </h2>
            <p className="font-opensans text-gray-500 text-lg max-w-2xl mx-auto">
              Whether you have one vehicle or one hundred, Drive Service Network has a financing
              structure designed for your operation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {financingTypes.map((type) => (
              <div
                key={type.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 hover:border-teal/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-navy/5 rounded-xl flex items-center justify-center">
                    <type.icon className="w-5 h-5 text-navy" />
                  </div>
                  <h3 className="font-montserrat font-bold text-navy text-lg">
                    {type.title}
                  </h3>
                </div>
                <p className="font-opensans text-gray-500 text-sm leading-relaxed mb-4">
                  {type.description}
                </p>
                <ul className="space-y-1.5 mb-4">
                  {type.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                      <span className="font-opensans text-sm text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-navy/5 rounded-lg px-3 py-2">
                  <span className="font-opensans text-xs text-navy/70 italic">{type.useCase}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approval Process */}
      <section id="how-it-works" className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="heading-lg text-navy mb-4">
              Simple{" "}
              <span className="text-teal">Approval Process</span>
            </h2>
            <p className="font-opensans text-gray-500 text-lg max-w-2xl mx-auto">
              From application to approved — designed to be fast and straightforward
              for busy fleet operators.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {approvalProcess.map((step, index) => (
                <div key={step.step} className="text-center relative">
                  {index < approvalProcess.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="font-montserrat font-bold text-white text-xl">
                        {step.step}
                      </span>
                    </div>
                    <div className="inline-block bg-gold/20 text-gold-700 font-montserrat font-bold text-xs px-2 py-1 rounded-full mb-2">
                      {step.time}
                    </div>
                    <h3 className="font-montserrat font-bold text-navy text-sm mb-2">
                      {step.title}
                    </h3>
                    <p className="font-opensans text-gray-500 text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Qualification Form */}
      <section id="pre-qualify" className="section-padding bg-navy">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="heading-lg text-white mb-4">
                Get{" "}
                <span className="text-gold">Pre-Qualified</span>
              </h2>
              <p className="font-opensans text-white/70 text-lg">
                No hard credit pull. No obligation. Just a quick form to see what
                financing options are available for your operation.
              </p>
            </div>
            <FinancingPreQualForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="heading-lg text-navy mb-4">
              Frequently Asked{" "}
              <span className="text-teal">Questions</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="bg-white rounded-xl border border-gray-200 shadow-card group"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none hover:bg-gray-50 rounded-xl transition-colors">
                  <h3 className="font-montserrat font-bold text-navy text-base pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown className="w-5 h-5 text-navy/50 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 border-t border-gray-100">
                  <p className="font-opensans text-gray-700 text-sm leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="font-opensans text-gray-500 text-sm mb-4">
              Have more questions about fleet financing?
            </p>
            <Button variant="secondary" size="md" asChild>
              <Link href="/contact">
                Contact Our Team
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
