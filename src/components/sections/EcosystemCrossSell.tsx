import React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

const ecosystemProducts = [
  {
    name: "Drive Protection",
    tagline: "Vehicle Protection Plans",
    description:
      "Comprehensive mechanical breakdown protection for your entire fleet. Reduce unexpected repair costs and protect your cash flow.",
    icon: "🛡️",
    color: "border-teal/30 hover:border-teal",
    badge: "Popular",
    badgeColor: "bg-teal text-white",
    href: "#",
  },
  {
    name: "Drive Parts Network",
    tagline: "OEM & Aftermarket Parts",
    description:
      "Access wholesale pricing on OEM and quality aftermarket parts. Direct sourcing eliminates markups and reduces your total repair costs.",
    icon: "🔩",
    color: "border-gold/30 hover:border-gold",
    badge: "New",
    badgeColor: "bg-gold text-navy",
    href: "#",
  },
  {
    name: "Drive KeZ",
    tagline: "Key Management Solutions",
    description:
      "Intelligent key management and vehicle access control for rental fleets. Eliminate key loss, unauthorized access, and operational headaches.",
    icon: "🔑",
    color: "border-navy/30 hover:border-navy",
    badge: null,
    badgeColor: "",
    href: "#",
  },
  {
    name: "Drive Cloud",
    tagline: "Fleet Data & Analytics",
    description:
      "Centralized fleet data management, maintenance history, and performance analytics. Make data-driven decisions that improve profitability.",
    icon: "☁️",
    color: "border-teal/30 hover:border-teal",
    badge: "Coming Soon",
    badgeColor: "bg-gray-200 text-gray-600",
    href: "#",
  },
  {
    name: "Drive Connect",
    tagline: "Telematics & Connectivity",
    description:
      "Real-time vehicle tracking, diagnostics, and connected fleet management. Know where your vehicles are and how they're performing.",
    icon: "📡",
    color: "border-gold/30 hover:border-gold",
    badge: "Coming Soon",
    badgeColor: "bg-gray-200 text-gray-600",
    href: "#",
  },
  {
    name: "Drive Growth Partners",
    tagline: "Business Growth Resources",
    description:
      "Access to financing, insurance, legal resources, and business development tools designed specifically for vehicle operators.",
    icon: "📈",
    color: "border-navy/30 hover:border-navy",
    badge: null,
    badgeColor: "",
    href: "#",
  },
];

export function EcosystemCrossSell() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="section-container">
        <div className="text-center mb-14">
          <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
            Global Drive Holdings Ecosystem
          </p>
          <h2 className="heading-lg text-navy">
            More Than Maintenance.{" "}
            <span className="text-teal">A Complete Operating Platform.</span>
          </h2>
          <p className="body-lg text-gray-500 mt-4 max-w-2xl mx-auto">
            Drive Service Network is one part of a comprehensive ecosystem
            designed to help vehicle operators build more profitable businesses.
            Every product solves a real operational problem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ecosystemProducts.map((product) => (
            <Link
              key={product.name}
              href={product.href}
              className={`group bg-white border-2 ${product.color} rounded-xl p-6 transition-all duration-300 hover:shadow-card-hover block`}
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
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-teal transition-colors duration-200" />
                </div>
              </div>

              <h3 className="font-montserrat font-bold text-navy text-base mb-0.5 group-hover:text-teal transition-colors duration-200">
                {product.name}
              </h3>
              <p className="font-montserrat font-medium text-teal text-xs mb-3">
                {product.tagline}
              </p>
              <p className="font-opensans text-gray-500 text-sm leading-relaxed">
                {product.description}
              </p>

              <div className="mt-4 flex items-center gap-1 text-teal text-xs font-montserrat font-semibold">
                Learn More
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-10 text-center">
          <p className="font-opensans text-gray-400 text-sm">
            All Global Drive Holdings products are designed to work together seamlessly.
            <br />
            Members receive preferred pricing across the entire ecosystem.
          </p>
        </div>
      </div>
    </section>
  );
}
