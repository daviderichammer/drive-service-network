import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { ECOSYSTEM_ENTITIES, QUOTE_URL } from "@/lib/content";

/**
 * CHANGE 009 — footer navigation aligned to the simplified architecture.
 * "For Fleet Operators" and "Fleet Accounts" removed; "How It Works" retained.
 * CHANGE 011-F — Drive Service Network FAQ and DSN Discount Program FAQ added.
 * CHANGE 010 — customer-facing Openbay branding removed.
 */
const footerLinks = {
  network: {
    title: "Drive Service Network",
    links: [
      { href: QUOTE_URL, label: "Get an Instant Quote" },
      { href: "/services", label: "Services" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/membership", label: "FREE Drive Membership" },
      { href: "/financing", label: "Financing" },
    ],
  },
  help: {
    title: "Customer Help",
    links: [
      { href: "/faq", label: "Drive Service Network FAQ" },
      { href: "/discount-program-faq", label: "DSN Discount Program FAQ" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { href: "/about", label: "About Drive Service Network" },
      { href: "/membership/join", label: "Join Free" },
      { href: "/auth/login", label: "Sign In" },
    ],
  },
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-teal to-teal-600">
        <div className="section-container py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-montserrat font-bold text-white text-xl md:text-2xl">
                Keep Your Fleet Moving.
              </h3>
              <p className="font-opensans text-white/80 mt-1 text-sm md:text-base">
                Save Money. Save Hours. Reduce Downtime.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href={QUOTE_URL}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold text-navy font-montserrat font-bold text-sm rounded-lg hover:bg-gold-600 transition-all duration-200"
              >
                Find Service
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/membership/join"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white font-montserrat font-semibold text-sm rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30"
              >
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-container py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="#1B2B4D"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="font-montserrat font-bold text-white text-base leading-tight">
                  Drive Service Network
                </div>
                <div className="font-opensans text-white/50 text-xs leading-tight">
                  A Global Drive Holdings Inc. company
                </div>
              </div>
            </Link>

            <p className="font-opensans text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              A nationwide vehicle service and repair network built for Turo hosts,
              car rental operators and fleets.
            </p>

            <div className="space-y-2.5">
              <a
                href="tel:+17867663577"
                className="flex items-center gap-2.5 text-white/60 hover:text-gold transition-colors duration-200 text-sm font-opensans"
              >
                <Phone className="w-4 h-4 text-teal flex-shrink-0" />
                +1 (786) 766-3577
              </a>
              <a
                href="mailto:info@driveservicenetwork.com"
                className="flex items-center gap-2.5 text-white/60 hover:text-gold transition-colors duration-200 text-sm font-opensans"
              >
                <Mail className="w-4 h-4 text-teal flex-shrink-0" />
                info@driveservicenetwork.com
              </a>
              <div className="flex items-start gap-2.5 text-white/60 text-sm font-opensans">
                <MapPin className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                <span>Miami Beach, FL, United States</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-montserrat font-bold text-white text-sm uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-opensans text-white/55 hover:text-gold text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* More Products & Services — CHANGE 002 */}
          <div>
            <h4 className="font-montserrat font-bold text-white text-sm uppercase tracking-wider mb-4">
              More Products &amp; Services
            </h4>
            <ul className="space-y-2.5">
              {ECOSYSTEM_ENTITIES.map((entity) => (
                <li key={entity.name}>
                  <a
                    href={entity.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-opensans text-white/55 hover:text-gold text-sm transition-colors duration-200"
                  >
                    {entity.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="section-container py-5">
          <p className="font-opensans text-white/40 text-xs text-center sm:text-left">
            &copy; {currentYear} Drive Service Network Inc. All rights reserved. A
            Global Drive Holdings Inc. company. Service availability, participating
            facilities and pricing vary by location.
          </p>
        </div>
      </div>
    </footer>
  );
}
