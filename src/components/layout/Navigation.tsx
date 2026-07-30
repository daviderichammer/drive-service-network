"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/membership", label: "Membership" },
  { href: "/fleet-operators", label: "For Fleets" },
  { href: "/contact", label: "Contact" },
];

const ecosystemLinks = [
  { href: "#", label: "Drive Protection", description: "Vehicle protection plans" },
  { href: "#", label: "Drive Parts Network", description: "OEM & aftermarket parts" },
  { href: "#", label: "Drive KeZ", description: "Key management solutions" },
  { href: "#", label: "Drive Cloud", description: "Fleet data & analytics" },
  { href: "#", label: "Drive Connect", description: "Telematics & connectivity" },
  { href: "#", label: "Drive Growth Partners", description: "Business growth resources" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [ecosystemOpen, setEcosystemOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-navy shadow-nav py-3"
          : "bg-navy/95 backdrop-blur-sm py-4"
      )}
    >
      <div className="section-container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center flex-shrink-0">
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
                <div className="font-montserrat font-bold text-white text-sm leading-tight">
                  Drive Service
                </div>
                <div className="font-montserrat font-bold text-gold text-sm leading-tight">
                  Network
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-opensans font-medium transition-all duration-200",
                  pathname === link.href
                    ? "text-gold bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* GDH Ecosystem Dropdown */}
            <div className="relative">
              <button
                onClick={() => setEcosystemOpen(!ecosystemOpen)}
                onBlur={() => setTimeout(() => setEcosystemOpen(false), 150)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-opensans font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                GDH Ecosystem
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    ecosystemOpen && "rotate-180"
                  )}
                />
              </button>

              {ecosystemOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="p-2">
                    {ecosystemLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-navy/5 transition-colors duration-150 group"
                      >
                        <span className="text-sm font-montserrat font-semibold text-navy group-hover:text-teal transition-colors">
                          {link.label}
                        </span>
                        <span className="text-xs text-gray-500 font-opensans">
                          {link.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+18005551234"
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-opensans transition-colors duration-200"
            >
              <Phone className="w-4 h-4" />
              <span>(800) 555-1234</span>
            </a>
            <Button variant="gold" size="sm" asChild>
              <Link href="/membership">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/10">
            <nav className="flex flex-col gap-1 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-opensans font-medium transition-colors duration-200",
                    pathname === link.href
                      ? "text-gold bg-white/10"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="px-4 py-2 text-xs font-montserrat font-semibold text-white/40 uppercase tracking-wider">
                  GDH Ecosystem
                </p>
                {ecosystemLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-opensans text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 px-4">
                <Button variant="gold" size="md" className="w-full" asChild>
                  <Link href="/membership">Get Started Today</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
