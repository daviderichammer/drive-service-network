import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Target, Heart, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Our Story — About Drive Service Network",
  description:
    "Drive Service Network was built from 220+ vehicles of real-world fleet operating experience. Learn why we exist and what drives us to help operators build more profitable businesses.",
};

const values = [
  {
    icon: Target,
    title: "We Don't Sell Products. We Solve Problems.",
    description:
      "Every feature, every partnership, and every decision at Drive Service Network is evaluated against one question: Does this solve a real problem for operators? If the answer is no, we don't build it.",
    color: "text-teal",
    bg: "bg-teal/10",
  },
  {
    icon: Heart,
    title: "Built by Operators. Designed for Operators.",
    description:
      "Unlike automotive technology companies founded by software engineers, Drive Service Network was created by experienced fleet operators. That operational background shapes every aspect of the platform.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: Zap,
    title: "Simplicity Creates Trust.",
    description:
      "Fleet management is already complicated. Our platform simplifies decisions rather than introducing additional complexity. The easiest solution is often the most valuable.",
    color: "text-navy",
    bg: "bg-navy/10",
  },
  {
    icon: Shield,
    title: "Trust Must Be Earned.",
    description:
      "Trust is not a marketing message. It is the result of every interaction — honest communication, transparent pricing, professional design, and consistent execution.",
    color: "text-teal",
    bg: "bg-teal/10",
  },
];

const challenges = [
  "Finding trustworthy repair facilities in unfamiliar cities",
  "Managing maintenance schedules across multiple locations",
  "Controlling repair costs and preventing markups",
  "Reducing vehicle downtime and lost revenue",
  "Coordinating service across multiple markets",
  "Negotiating commercial pricing without leverage",
  "Tracking repair history across an entire fleet",
  "Managing unexpected mechanical failures",
  "Preserving cash flow during high-repair periods",
  "Finding consistent quality across different providers",
];

const milestones = [
  {
    year: "The Beginning",
    title: "Operating a 220+ Vehicle Fleet",
    description:
      "Years of managing one of Florida's largest independent rental fleets revealed the operational gaps that no existing platform addressed.",
  },
  {
    year: "The Problem",
    title: "No Platform Built for Operators",
    description:
      "Thousands of repair facilities existed nationwide, but no single resource was designed specifically for independent fleet operators, rental businesses, and mobility providers.",
  },
  {
    year: "The Decision",
    title: "Build the Solution",
    description:
      "Rather than accept the limitations of existing options, we created Drive Service Network — combining operational experience, strategic partnerships, and modern technology.",
  },
  {
    year: "Today",
    title: "A Nationwide Operating Platform",
    description:
      "Drive Service Network connects operators with trusted service providers, commercial pricing, and the tools needed to run more profitable vehicle businesses.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="section-container">
          <div className="max-w-3xl">
            <Badge variant="teal" size="lg" className="mb-6">
              Our Story
            </Badge>
            <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
              Built From{" "}
              <span className="text-gold">Real Experience.</span>
              <br />
              Not From a Whiteboard.
            </h1>
            <p className="font-opensans text-white/80 text-lg md:text-xl leading-relaxed">
              Drive Service Network was created after managing a 220+ car rental fleet,
              operating 31 auto parts stores with 55,000 SKUs and repair facilities with 450+ service bays.
            </p>
          </div>
        </div>
      </section>

      {/* The Story */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-4">
                Why We Exist
              </p>
              <h2 className="heading-lg text-navy mb-6">
                The Problem No One Was Solving
              </h2>
              <div className="space-y-4 font-opensans text-gray-600 leading-relaxed">
                <p>
                  Most companies begin with an idea. Drive Service Network began
                  with operational necessity.
                </p>
                <p>
                  Years of managing a large rental fleet — more than 220 vehicles
                  across multiple Florida and Georgia markets — provided firsthand experience
                  with virtually every operational challenge associated with fleet
                  ownership.
                </p>
                <p>
                  Although tens of thousands of repair facilities exist throughout the
                  United States, there was no single nationwide resource designed
                  specifically for independent fleet operators, rental businesses,
                  dealerships, and mobility providers.
                </p>
                <p className="font-semibold text-navy">
                  Drive Service Network was created to fill that gap.
                </p>
              </div>
            </div>

            <div>
              <p className="font-montserrat font-semibold text-navy text-sm uppercase tracking-widest mb-4">
                The Challenges We Faced
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {challenges.map((challenge) => (
                  <div
                    key={challenge}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                    <span className="font-opensans text-gray-600 text-sm">
                      {challenge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-navy">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-4">
              Our Mission
            </p>
            <h2 className="font-montserrat font-black text-white text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
              Help Vehicle Operators Build{" "}
              <span className="text-gold">More Profitable Businesses.</span>
            </h2>
            <p className="font-opensans text-white/70 text-lg leading-relaxed mb-8">
              Every initiative undertaken by Drive Service Network supports this
              mission. The mission extends beyond reducing repair costs. It
              includes helping operators increase vehicle availability, reduce
              downtime, improve customer satisfaction, better manage cash flow,
              and operate with greater confidence.
            </p>
            <div className="divider-gold mx-auto" />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-gray-50" id="story">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              The Journey
            </p>
            <h2 className="heading-lg text-navy">
              From Fleet Operator to{" "}
              <span className="text-teal">Platform Builder</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal via-gold to-navy opacity-30" />

              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative flex gap-8">
                    {/* Dot */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-white border-2 border-teal rounded-full flex items-center justify-center shadow-sm z-10 relative">
                        <span className="font-montserrat font-black text-teal text-xs">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 flex-1 hover:shadow-card-hover transition-all duration-300">
                      <span className="font-montserrat font-semibold text-teal text-xs uppercase tracking-wide">
                        {milestone.year}
                      </span>
                      <h3 className="font-montserrat font-bold text-navy text-lg mt-1 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="font-opensans text-gray-500 text-sm leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-white" id="mission">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              Our Philosophy
            </p>
            <h2 className="heading-lg text-navy">
              The Principles That{" "}
              <span className="text-teal">Guide Everything We Build</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-white border border-gray-100 rounded-xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 ${value.bg} rounded-xl flex items-center justify-center mb-5`}
                  >
                    <Icon className={`w-6 h-6 ${value.color}`} />
                  </div>
                  <h3 className="font-montserrat font-bold text-navy text-lg mb-3">
                    {value.title}
                  </h3>
                  <p className="font-opensans text-gray-500 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Long-Term Vision */}
      <section className="section-padding bg-gradient-hero">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-4">
              Long-Term Vision
            </p>
            <h2 className="font-montserrat font-black text-white text-3xl md:text-4xl leading-tight mb-6">
              More Than a Repair Directory.{" "}
              <span className="text-gold">An Operating Platform.</span>
            </h2>
            <p className="font-opensans text-white/70 text-lg leading-relaxed mb-10">
              Drive Service Network is not intended to become another automotive
              marketplace. Its long-term vision is to become the operating
              platform that vehicle operators rely upon throughout the ownership
              lifecycle — from preventive maintenance to fleet analytics,
              financing, and beyond.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" asChild>
                <Link href="/membership/join">
                  <span className="text-navy font-bold">Join the Network</span>
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
