import React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

const ecosystemProducts = [
  {
    name: "Drive Service Network",
    tagline: "Fleet Maintenance & Repair",
    description:
      "Nationwide fleet maintenance platform connecting vehicle operators with trusted repair providers. Commercial discounts, simplified scheduling, and fleet management.",
    icon: "🔧",
    color: "border-teal/50 hover:border-teal",
    badge: "You Are Here",
    badgeColor: "bg-teal/20 text-teal",
    href: "#",
  },
  {
    name: "Drive Cloud",
    tagline: "Fleet Data & Analytics",
    description:
      "Centralized fleet data management, maintenance history, and performance analytics. Make data-driven decisions that improve profitability.",
    icon: "☁️",
    color: "border-white/20 hover:border-teal/50",
    badge: "Coming Soon",
    badgeColor: "bg-white/10 text-white/60",
    href: "#",
  },
  {
    name: "Drive Connect",
    tagline: "Telematics & Connectivity",
    description:
      "Real-time vehicle tracking, diagnostics, and connected fleet management. Know where your vehicles are and how they're performing.",
    icon: "📡",
    color: "border-white/20 hover:border-gold/50",
    badge: "Coming Soon",
    badgeColor: "bg-white/10 text-white/60",
    href: "#",
  },
  {
    name: "Drive Growth Partners",
    tagline: "Business Growth Resources",
    description:
      "Access to financing, insurance, legal resources, and business development tools designed specifically for vehicle operators.",
    icon: "📈",
    color: "border-white/20 hover:border-white/40",
    badge: null,
    badgeColor: "",
    href: "#",
  },
  {
    name: "Drive Management Inc.",
    tagline: "Vehicle Acquisition & Financing",
    description:
      "Comprehensive vehicle acquisition and financing solutions for fleet operators. Build and scale your fleet with the right vehicles at the right terms.",
    icon: "🚗",
    color: "border-white/20 hover:border-teal/50",
    badge: null,
    badgeColor: "",
    href: "#",
  },
  {
    name: "Drive Financial Inc.",
    tagline: "Financial Products & Financing Solutions",
    description:
      "Financial products and financing solutions designed specifically for vehicle operators and fleet businesses.",
    icon: "💼",
    color: "border-white/20 hover:border-gold/50",
    badge: null,
    badgeColor: "",
    href: "#",
  },
];

// Alternating card backgrounds on navy:
// even index: semi-transparent white; odd index: gold-tinted
const cardBgs = ["bg-white/8", "bg-[#c8a84b]/10"];

export function EcosystemCrossSell() {
  return (
    <section className="section-padding bg-navy">
      <div className="section-container">
        <div className="text-center mb-14">
          <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
            Global Drive Holdings Ecosystem
          </p>
          <h2 className="heading-lg text-white">
            More Than Maintenance.{" "}
            <span className="text-gold">A Complete Operating Platform.</span>
          </h2>
          <p className="body-lg text-white/70 mt-4 max-w-2xl mx-auto">
            Drive Service Network, a Global Drive Holdings company that is part of a comprehensive ecosystem designed to help vehicle operators build more profitable businesses. Every product solves a real operational problem.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ecosystemProducts.map((product, index) => {
            const cardBg = cardBgs[index % 2];
            return (
              <Link
                key={product.name}
                href={product.href}
                className={`group ${cardBg} border-2 ${product.color} rounded-xl p-6 transition-all duration-300 hover:brightness-110 hover:shadow-card-hover block`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{product.icon}</div>
                  <div className="flex items-center gap-2">
                    {product.badge && (
                      <span
                        className={`${product.badgeColor} text-xs font-montserrat font-semibold px-2.5 py-1 rounded-full`}
                      >
                        {product.badge}
                      </span>
                    )}
                    <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-teal transition-colors duration-200" />
                  </div>
                </div>
                <h3 className="font-montserrat font-bold text-white text-base mb-0.5 group-hover:text-teal transition-colors duration-200">
                  {product.name}
                </h3>
                <p className="font-montserrat font-medium text-teal text-xs mb-3">
                  {product.tagline}
                </p>
                <p className="font-opensans text-white/60 text-sm leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-teal text-xs font-montserrat font-semibold">
                  Learn More
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            );
          })}
        </div>
        {/* Bottom Note */}
        <div className="mt-10 text-center">
          <p className="font-opensans text-white/40 text-sm">
            All Global Drive Holdings products are designed to work together seamlessly.
            <br />
            Subscribers receive preferred pricing across the entire ecosystem.
          </p>
        </div>
      </div>
    </section>
  );
}
