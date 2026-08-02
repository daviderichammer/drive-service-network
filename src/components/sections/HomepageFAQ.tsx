"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";

const faqs = [
  {
    question: "Is it really free to join?",
    answer:
      "Yes — DSN Free costs nothing. Create your account, search our nationwide network, and book services immediately. No credit card required, no trial period, no catch. DSN+ is our optional paid upgrade for operators who want commercial fleet pricing and advanced tools.",
  },
  {
    question: "How is DSN different from just Googling a mechanic?",
    answer:
      "When you Google a mechanic, you get a list of shops with no pricing transparency, no quality vetting, and no leverage. DSN gives you access to 40,000+ pre-vetted facilities, negotiated commercial pricing (up to 25% below retail), and a single account that works in every market — whether your vehicles are in Miami, Chicago, or Los Angeles.",
  },
  {
    question: "Do I need a fleet to use Drive Service Network?",
    answer:
      "Not at all. Individual vehicle owners, single-car Turo hosts, and large commercial fleets all use DSN. The platform scales from 1 vehicle to 1,000+. Fleet operators get the most value from DSN+, but anyone can join DSN Free and start saving.",
  },
  {
    question: "What is DSN+ and how does it work?",
    answer:
      "DSN+ is the paid upgrade tier that unlocks commercial fleet pricing, priority scheduling, full service history tracking, the fleet dashboard, and dedicated operator support. You can pay for DSN+ with a 6-month prepaid plan, a 12-month prepaid plan (best value), or through monthly financed installments — a DSN-exclusive option not available anywhere else.",
  },
  {
    question: "What shops are in the network?",
    answer:
      "Our network includes over 40,000 U.S. repair facilities spanning national chains (Goodyear, Meineke, Firestone, Jiffy Lube, Pep Boys, Valvoline, Midas, AAMCO, and more) as well as independent shops. All network partners are vetted for quality and service standards.",
  },
  {
    question: "Can I manage multiple vehicles under one account?",
    answer:
      "Yes. DSN Free lets you add vehicles and track basic service history. DSN+ unlocks the full fleet dashboard with unlimited vehicle management, maintenance scheduling, and cost tracking across your entire operation. Fleet accounts also get a dedicated multi-vehicle enrollment path.",
  },
  {
    question: "How quickly can I book a service after signing up?",
    answer:
      "Immediately. Once your account is created, you can search for shops, view availability, and book appointments right away. No waiting period, no approval process — just find a shop and book.",
  },
];

export function HomepageFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="section-padding bg-white" id="faq">
      <div className="section-container">
        <div className="text-center mb-12">
          <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
            In Case You&apos;re Wondering
          </p>
          <h2 className="heading-lg text-navy">
            Straight Answers to{" "}
            <span className="text-teal">Common Questions</span>
          </h2>
          <p className="body-lg text-gray-500 mt-4 max-w-2xl mx-auto">
            No jargon. No runaround. Just honest answers about how Drive Service Network works.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.question}
              className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden hover:border-teal/30 transition-all duration-200"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-montserrat font-bold text-navy text-sm md:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-teal flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="font-opensans text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="font-opensans text-gray-400 text-sm mb-4">
            Still have questions? Our team is happy to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 font-montserrat font-semibold text-teal text-sm hover:text-teal-600 transition-colors duration-200"
          >
            Contact Our Team
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
