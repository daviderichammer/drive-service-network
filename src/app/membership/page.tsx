import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, X, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Membership — Commercial Pricing & Fleet Benefits",
  description:
    "Drive Service Network membership delivers commercial pricing, nationwide shop access, fleet management tools, and GDH ecosystem benefits. Plans for every operator.",
};

const tiers = [
  {
    name: "Basic",
    tagline: "For individual operators",
    price: "49",
    period: "per month",
    annualPrice: "39",
    description:
      "Essential access to the DSN network for individual vehicle owners and small Turo hosts.",
    badge: null,
    badgeColor: "",
    features: [
      { text: "Access to nationwide shop network", included: true },
      { text: "Commercial pricing on services", included: true },
      { text: "Online appointment booking", included: true },
      { text: "Service history tracking (up to 3 vehicles)", included: true },
      { text: "Email support", included: true },
      { text: "GDH ecosystem discounts", included: true },
      { text: "Fleet dashboard", included: false },
      { text: "Priority scheduling", included: false },
      { text: "Dedicated account manager", included: false },
      { text: "Commercial account pricing", included: false },
    ],
    cta: "Start Basic",
    ctaVariant: "outline" as const,
    highlight: false,
  },
  {
    name: "Professional",
    tagline: "For growing operators",
    price: "149",
    period: "per month",
    annualPrice: "119",
    description:
      "Advanced tools and deeper discounts for Turo hosts and rental operators managing multiple vehicles.",
    badge: "Most Popular",
    badgeColor: "bg-teal text-white",
    features: [
      { text: "Access to nationwide shop network", included: true },
      { text: "Enhanced commercial pricing", included: true },
      { text: "Online appointment booking", included: true },
      { text: "Service history tracking (up to 25 vehicles)", included: true },
      { text: "Priority email & phone support", included: true },
      { text: "GDH ecosystem discounts", included: true },
      { text: "Fleet dashboard", included: true },
      { text: "Priority scheduling", included: true },
      { text: "Dedicated account manager", included: false },
      { text: "Commercial account pricing", included: false },
    ],
    cta: "Start Professional",
    ctaVariant: "secondary" as const,
    highlight: true,
  },
  {
    name: "Enterprise",
    tagline: "For commercial fleets",
    price: "Custom",
    period: "contact us",
    annualPrice: null,
    description:
      "Full-featured commercial fleet program with maximum discounts, dedicated support, and custom integrations.",
    badge: "Best Value",
    badgeColor: "bg-gold text-navy",
    features: [
      { text: "Access to nationwide shop network", included: true },
      { text: "Maximum commercial pricing", included: true },
      { text: "Online appointment booking", included: true },
      { text: "Unlimited vehicle tracking", included: true },
      { text: "24/7 priority support", included: true },
      { text: "Full GDH ecosystem benefits", included: true },
      { text: "Advanced fleet dashboard", included: true },
      { text: "Priority scheduling", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Commercial account pricing", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "primary" as const,
    highlight: false,
  },
];

const memberBenefits = [
  {
    title: "Commercial Pricing",
    description:
      "Access pricing tiers unavailable to the general public. DSN negotiates commercial rates with our network partners on behalf of all members.",
    icon: "💰",
  },
  {
    title: "Nationwide Coverage",
    description:
      "One membership covers every vehicle in your fleet, regardless of where it operates. Service in any market, same pricing, same quality.",
    icon: "🗺️",
  },
  {
    title: "Simplified Scheduling",
    description:
      "Book any service for any vehicle in any market in minutes. Our 3-step process eliminates the phone calls and back-and-forth of traditional scheduling.",
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
      "Membership includes preferred pricing across the entire Global Drive Holdings ecosystem — Drive Protection, Drive Parts Network, Drive KeZ, and more.",
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
    question: "How quickly can I start using DSN after signing up?",
    answer:
      "Immediately. Once your membership is active, you can search for shops, view availability, and book appointments right away. No waiting period, no approval process.",
  },
  {
    question: "Can I add vehicles to my account after signing up?",
    answer:
      "Yes. You can add vehicles to your account at any time. Basic members can track up to 3 vehicles, Professional members up to 25, and Enterprise members have unlimited vehicle tracking.",
  },
  {
    question: "How much can I save with commercial pricing?",
    answer:
      "Savings vary by service type and market, but DSN members typically save 15-30% compared to standard retail pricing. On major repairs, the savings often exceed the annual membership cost.",
  },
  {
    question: "Is there a contract or long-term commitment?",
    answer:
      "No long-term contracts. Basic and Professional memberships are month-to-month with the option to save by paying annually. Enterprise plans are customized based on fleet size and requirements.",
  },
  {
    question: "What if I need service in a market where I don't have a regular shop?",
    answer:
      "That's exactly what DSN was built for. Our nationwide network means you can find certified shops in any market, with the same commercial pricing and booking experience regardless of location.",
  },
  {
    question: "How does the Openbay integration work?",
    answer:
      "Drive Service Network is powered by Openbay's marketplace infrastructure. When you search for shops and book appointments, you're accessing Openbay's network of certified providers — all through the DSN experience with your commercial pricing applied automatically.",
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
              Commercial Pricing.{" "}
              <span className="text-gold">Nationwide Access.</span>
            </h1>
            <p className="font-opensans text-white/80 text-lg md:text-xl leading-relaxed">
              Drive Service Network membership delivers the commercial tools,
              pricing, and support that vehicle operators need to reduce costs
              and simplify maintenance — at every scale.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              Choose Your Plan
            </p>
            <h2 className="heading-lg text-navy">
              Plans for Every{" "}
              <span className="text-teal">Operator</span>
            </h2>
            <p className="body-lg text-gray-500 mt-4 max-w-2xl mx-auto">
              Whether you operate 1 vehicle or 500, Drive Service Network has a
              membership plan designed for your operation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl overflow-hidden ${
                  tier.highlight
                    ? "ring-2 ring-teal shadow-card-hover"
                    : "border border-gray-200 shadow-card"
                } bg-white`}
              >
                {/* Popular Badge */}
                {tier.badge && (
                  <div className="absolute top-0 left-0 right-0 flex justify-center">
                    <span
                      className={`${tier.badgeColor} text-xs font-montserrat font-bold px-4 py-1.5 rounded-b-lg`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="p-8 pt-10">
                  {/* Tier Name */}
                  <h3 className="font-montserrat font-bold text-navy text-xl mb-1">
                    {tier.name}
                  </h3>
                  <p className="font-opensans text-gray-500 text-sm mb-6">
                    {tier.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    {tier.annualPrice ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="font-montserrat font-black text-navy text-4xl">
                            ${tier.price}
                          </span>
                          <span className="font-opensans text-gray-400 text-sm">
                            /{tier.period}
                          </span>
                        </div>
                        <p className="font-opensans text-teal text-xs mt-1">
                          ${tier.annualPrice}/mo billed annually — save 20%
                        </p>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="font-montserrat font-black text-navy text-4xl">
                          {tier.price}
                        </span>
                        <span className="font-opensans text-gray-400 text-sm">
                          — {tier.period}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="font-opensans text-gray-500 text-sm leading-relaxed mb-6">
                    {tier.description}
                  </p>

                  {/* CTA */}
                  <Button
                    variant={tier.ctaVariant}
                    size="md"
                    className="w-full mb-8"
                    asChild
                  >
                    <Link href="/contact">
                      {tier.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>

                  {/* Features */}
                  <div className="border-t border-gray-100 pt-6">
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
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
            ))}
          </div>

          <p className="text-center font-opensans text-gray-400 text-sm mt-8">
            All plans include a 30-day satisfaction guarantee. No setup fees.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              Member Benefits
            </p>
            <h2 className="heading-lg text-navy">
              What Your Membership{" "}
              <span className="text-teal">Delivers</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-teal/30 hover:shadow-card transition-all duration-300"
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
              of Professional membership. DSN isn&apos;t a cost — it&apos;s an
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
