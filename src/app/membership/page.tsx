import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, X, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Membership Plans — DSN Free & DSN+ | Drive Service Network",
  description:
    "Join DSN Free at no cost and unlock commercial pricing, fleet management, and nationwide shop access. Upgrade to DSN+ for advanced fleet tools and maximum savings.",
};

const dsnFreeFeatures = [
  { text: "Access to nationwide shop network (40,000+ facilities)", included: true },
  { text: "Online appointment booking", included: true },
  { text: "Service history tracking (up to 3 vehicles)", included: true },
  { text: "Basic vehicle profiles", included: true },
  { text: "Email support", included: true },
  { text: "GDH ecosystem discounts", included: true },
  { text: "Commercial fleet pricing", included: false },
  { text: "Fleet dashboard", included: false },
  { text: "Priority scheduling", included: false },
  { text: "Dedicated account manager", included: false },
  { text: "Unlimited vehicle tracking", included: false },
];

const dsnPlusFeatures = [
  { text: "Access to nationwide shop network (40,000+ facilities)", included: true },
  { text: "Online appointment booking", included: true },
  { text: "Unlimited vehicle tracking", included: true },
  { text: "Full vehicle profiles & VIN records", included: true },
  { text: "Priority email & phone support", included: true },
  { text: "Full GDH ecosystem benefits", included: true },
  { text: "Commercial fleet pricing (save up to 25%)", included: true },
  { text: "Advanced fleet dashboard", included: true },
  { text: "Priority scheduling", included: true },
  { text: "Dedicated account manager", included: true },
  { text: "Maintenance schedule reminders", included: true },
];

// DSN+ payment options
const dsnPlusOptions = [
  {
    id: "6month",
    name: "DSN+ 6-Month Prepaid",
    tagline: "Commit for 6 months, save vs. monthly",
    price: "11.99",
    period: "per month",
    billingNote: "Billed as $71.94 every 6 months",
    badge: null,
    badgeColor: "",
    highlight: false,
    cta: "Get DSN+ (6-Month)",
    ctaHref: "/auth/register?plan=dsn-plus-6month",
  },
  {
    id: "12month",
    name: "DSN+ 12-Month Prepaid",
    tagline: "Best value — maximum annual savings",
    price: "9.99",
    period: "per month",
    billingNote: "Billed as $119.88 annually — save nearly 20%",
    badge: "Best Value",
    badgeColor: "bg-teal text-white",
    highlight: true,
    cta: "Get DSN+ (Annual)",
    ctaHref: "/auth/register?plan=dsn-plus-12month",
  },
  {
    id: "financed",
    name: "DSN+ Financed",
    tagline: "Monthly installments — DSN exclusive",
    price: "14.99",
    period: "per month",
    billingNote: "Month-to-month financing — no prepay required",
    badge: "DSN Exclusive",
    badgeColor: "bg-gold text-navy",
    highlight: false,
    cta: "Get DSN+ (Financed)",
    ctaHref: "/auth/register?plan=dsn-plus-financed",
  },
];

const memberBenefits = [
  {
    title: "Commercial Pricing",
    description:
      "Access pricing tiers unavailable to the general public. Drive Service Network negotiates commercial rates with our network partners on behalf of all DSN+ members.",
    icon: "💰",
  },
  {
    title: "Nationwide Coverage",
    description:
      "One subscription covers every vehicle in your fleet, regardless of where it operates. Service in any market, same pricing, same quality.",
    icon: "🗺️",
  },
  {
    title: "Simplified Scheduling",
    description:
      "Book any service for any vehicle in any market in minutes. Our guided process eliminates the phone calls and back-and-forth of traditional scheduling.",
    icon: "📅",
  },
  {
    title: "Service History",
    description:
      "Complete maintenance history for every vehicle in your fleet, accessible from any device. Never lose track of what was done, when, and at what cost.",
    icon: "📋",
  },
  {
    title: "GDH Ecosystem Access",
    description:
      "Subscription includes preferred pricing across the entire Global Drive Holdings ecosystem — Drive Protection, Drive Parts Network, Drive KeZ, and more.",
    icon: "🌐",
  },
  {
    title: "Operator Support",
    description:
      "Our team understands fleet operations because we've operated fleets. Get support from people who speak your language and understand your challenges.",
    icon: "🤝",
  },
];

const faqs = [
  {
    question: "How quickly can I start using Drive Service Network after signing up?",
    answer:
      "Immediately. Once your account is active, you can search for shops, view availability, and book appointments right away. No waiting period, no approval process.",
  },
  {
    question: "Can I add vehicles to my account after signing up?",
    answer:
      "Yes. You can add vehicles to your account at any time. DSN Free members can track up to 3 vehicles. DSN+ members have unlimited vehicle tracking.",
  },
  {
    question: "How much can I save with DSN+ commercial pricing?",
    answer:
      "Savings vary by service type and market, but DSN+ subscribers typically save 15-25% compared to standard retail pricing. On major repairs, the savings often exceed the annual subscription cost.",
  },
  {
    question: "What is the DSN+ Financed option?",
    answer:
      "DSN+ Financed lets you access all premium features on a month-to-month basis without prepaying for 6 or 12 months. This is a DSN-exclusive option — no other automotive service platform offers financed membership installments.",
  },
  {
    question: "Can I cancel or change my plan?",
    answer:
      "DSN Free is always free — no cancellation needed. DSN+ Financed is month-to-month and can be cancelled anytime. Prepaid plans (6-month and 12-month) are non-refundable after the billing period begins but can be downgraded to DSN Free at renewal.",
  },
  {
    question: "How does Drive Service Network's partnership with Openbay work?",
    answer:
      "Drive Service Network is powered by Openbay's marketplace infrastructure. When you search for shops and book appointments, you're accessing Openbay's network of certified providers — all through the Drive Service Network experience with your commercial pricing applied automatically.",
  },
];

export default function MembershipPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="section-container">
          <div className="max-w-3xl">
            <Badge variant="gold" size="lg" className="mb-6">
              Membership Plans
            </Badge>
            <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
              Start Free.{" "}
              <span className="text-gold">Upgrade When Ready.</span>
            </h1>
            <p className="font-opensans text-white/80 text-lg md:text-xl leading-relaxed">
              Join DSN Free at no cost — search shops, book services, and manage your vehicles immediately.
              Upgrade to DSN+ when you&apos;re ready for commercial fleet pricing and advanced tools.
            </p>
          </div>
        </div>
      </section>

      {/* Free vs DSN+ Comparison */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              Choose Your Plan
            </p>
            <h2 className="heading-lg text-navy">
              DSN Free vs.{" "}
              <span className="text-teal">DSN+</span>
            </h2>
            <p className="body-lg text-gray-500 mt-4 max-w-2xl mx-auto">
              Every operator starts with DSN Free. Upgrade to DSN+ to unlock commercial pricing and the full fleet toolkit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* DSN Free */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-card bg-white">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-montserrat font-bold text-navy text-2xl">DSN Free</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs font-montserrat font-bold px-3 py-1 rounded-full">
                    Always Free
                  </span>
                </div>
                <p className="font-opensans text-gray-500 text-sm mb-6">
                  For individual operators and anyone getting started
                </p>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-montserrat font-black text-navy text-4xl">$0</span>
                    <span className="font-opensans text-gray-400 text-sm">/forever</span>
                  </div>
                  <p className="font-opensans text-gray-400 text-xs mt-1">No credit card required</p>
                </div>
                <Button variant="outline" size="md" className="w-full mb-8" asChild>
                  <Link href="/auth/register?plan=free">
                    Join DSN Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <div className="border-t border-gray-100 pt-6">
                  <ul className="space-y-3">
                    {dsnFreeFeatures.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        {feature.included ? (
                          <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`font-opensans text-sm ${
                            feature.included ? "text-gray-700" : "text-gray-400"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* DSN+ */}
            <div className="relative rounded-2xl overflow-hidden ring-2 ring-teal shadow-card-hover bg-white">
              <div className="absolute top-0 left-0 right-0 flex justify-center">
                <span className="bg-teal text-white text-xs font-montserrat font-bold px-4 py-1.5 rounded-b-lg">
                  Most Popular
                </span>
              </div>
              <div className="p-8 pt-10">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-montserrat font-bold text-navy text-2xl">DSN+</h3>
                  <span className="bg-teal/10 text-teal text-xs font-montserrat font-bold px-3 py-1 rounded-full">
                    Premium
                  </span>
                </div>
                <p className="font-opensans text-gray-500 text-sm mb-6">
                  For growing operators and commercial fleets
                </p>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-montserrat font-black text-navy text-4xl">FROM $9.99</span>
                    <span className="font-opensans text-gray-400 text-sm">/mo</span>
                  </div>
                  <p className="font-opensans text-teal text-xs mt-1">
                    3 payment options — including financed installments
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="font-opensans text-amber-700 text-xs leading-relaxed">
                    <strong>Create your free account first.</strong> DSN+ pricing and payment options are revealed after free enrollment — no commitment required.
                  </p>
                </div>
                <Button variant="secondary" size="md" className="w-full mb-8" asChild>
                  <Link href="/auth/register?plan=free&upgrade=dsn-plus">
                    Join DSN Free → Upgrade to DSN+
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <div className="border-t border-gray-100 pt-6">
                  <ul className="space-y-3">
                    {dsnPlusFeatures.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        {feature.included ? (
                          <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`font-opensans text-sm ${
                            feature.included ? "text-gray-700" : "text-gray-400"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DSN+ Payment Options */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              DSN+ Payment Options
            </p>
            <h2 className="heading-lg text-navy">
              Three Ways to{" "}
              <span className="text-teal">Subscribe to DSN+</span>
            </h2>
            <p className="body-lg text-gray-500 mt-4 max-w-2xl mx-auto">
              Choose the payment structure that works for your operation. All DSN+ options include the same full feature set.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {dsnPlusOptions.map((option) => (
              <div
                key={option.id}
                className={`relative rounded-2xl overflow-hidden ${
                  option.highlight
                    ? "ring-2 ring-teal shadow-card-hover"
                    : "border border-gray-200 shadow-card"
                } bg-white`}
              >
                {option.badge && (
                  <div className="absolute top-0 left-0 right-0 flex justify-center">
                    <span
                      className={`${option.badgeColor} text-xs font-montserrat font-bold px-4 py-1.5 rounded-b-lg`}
                    >
                      {option.badge}
                    </span>
                  </div>
                )}
                <div className={`p-6 ${option.badge ? "pt-10" : ""}`}>
                  <h3 className="font-montserrat font-bold text-navy text-lg mb-1">
                    {option.name}
                  </h3>
                  <p className="font-opensans text-gray-500 text-sm mb-5">
                    {option.tagline}
                  </p>
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="font-montserrat font-black text-navy text-3xl">
                        ${option.price}
                      </span>
                      <span className="font-opensans text-gray-400 text-sm">
                        /{option.period}
                      </span>
                    </div>
                    <p className="font-opensans text-teal text-xs mt-1">
                      {option.billingNote}
                    </p>
                  </div>
                  <Button
                    variant={option.highlight ? "secondary" : "outline"}
                    size="md"
                    className="w-full"
                    asChild
                  >
                    <Link href={option.ctaHref}>
                      {option.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 max-w-3xl mx-auto bg-navy/5 border border-navy/10 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h4 className="font-montserrat font-bold text-navy text-sm mb-1">
                  DSN+ Financed: A DSN-Exclusive Differentiator
                </h4>
                <p className="font-opensans text-gray-500 text-sm leading-relaxed">
                  No other automotive service platform offers financed membership installments. DSN+ Financed lets operators access all premium features on a month-to-month basis without a large prepayment — ideal for operators managing cash flow during high-repair periods.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center font-opensans text-gray-400 text-sm mt-8">
            All DSN+ plans include a 30-day satisfaction guarantee. No setup fees. Start with DSN Free — upgrade anytime.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              DSN+ Benefits
            </p>
            <h2 className="heading-lg text-navy">
              What DSN+{" "}
              <span className="text-teal">Delivers</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-teal/30 hover:shadow-card transition-all duration-300"
              >
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="font-montserrat font-bold text-navy text-base mb-2">
                  {benefit.title}
                </h3>
                <p className="font-opensans text-gray-500 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section-padding bg-navy">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gold fill-gold" />
              ))}
            </div>
            <blockquote className="font-opensans text-white/80 text-xl leading-relaxed mb-8 italic">
              &ldquo;The savings on our first major repair paid for an entire year
              of DSN+. Drive Service Network isn&apos;t a cost — it&apos;s an
              investment that pays for itself every month.&rdquo;
            </blockquote>
            <div>
              <div className="font-montserrat font-bold text-white">
                Robert M.
              </div>
              <div className="font-opensans text-teal text-sm mt-0.5">
                Fleet Operations Director · 85 Vehicles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="heading-lg text-navy">
              Frequently Asked{" "}
              <span className="text-teal">Questions</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-card"
              >
                <h3 className="font-montserrat font-bold text-navy text-base mb-3">
                  {faq.question}
                </h3>
                <p className="font-opensans text-gray-500 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="font-opensans text-gray-500 text-sm mb-4">
              Have more questions? Our team is ready to help.
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
