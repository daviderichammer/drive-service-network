"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Phone, User, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/membership", label: "Subscription" },
  { href: "/fleet-operators", label: "For Fleets" },
  { href: "/financing", label: "Financing" },
  { href: "/contact", label: "Contact" },
];

const ecosystemLinks = [
  { href: "https://globaldriveholdings.com", label: "Global Drive Holdings", description: "Parent company" },
  { href: "https://drivecommercegroup.com", label: "Drive Commerce", description: "Automotive commerce & infrastructure" },
  { href: "https://drivecloudgroup.com", label: "Drive Cloud", description: "Fleet data & analytics" },
  { href: "https://trustdriveconnect.com", label: "Drive Connect", description: "Telematics & connectivity" },
  { href: "https://drivefinancialgroup.com", label: "Drive Financial", description: "Fleet financing solutions" },
  { href: "https://drivekez.com", label: "Drive KeZ", description: "Key management solutions" },
  { href: "https://drivemanagement.com", label: "Drive Management", description: "Fleet management platform" },
  { href: "https://drivepartsnetwork.com", label: "Drive Parts Network", description: "OEM & aftermarket parts" },
  { href: "https://driveprotectiongroup.com", label: "Drive Protection", description: "Vehicle protection plans" },
  { href: "https://driveservicenetwork.com", label: "Drive Service Network", description: "National service infrastructure" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [ecosystemOpen, setEcosystemOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
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
                <div className="font-montserrat font-bold text-white text-sm leading-tight">Drive Service</div>
                <div className="font-montserrat font-bold text-gold text-sm leading-tight">Network</div>
              </div>
            </div>
          </Link>

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

            <div className="relative">
              <button
                onClick={() => setEcosystemOpen(!ecosystemOpen)}
                onBlur={() => setTimeout(() => setEcosystemOpen(false), 150)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-opensans font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                GDH Ecosystem
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", ecosystemOpen && "rotate-180")} />
              </button>
              {ecosystemOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-2">
                    {ecosystemLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-navy/5 transition-colors duration-150 group"
                      >
                        <span className="text-sm font-montserrat font-semibold text-navy group-hover:text-teal transition-colors">{link.label}</span>
                        <span className="text-xs text-gray-500 font-opensans">{link.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+17867663577" className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-opensans transition-colors duration-200">
              <Phone className="w-4 h-4" />
              <span>+1 (786) 766-3577</span>
            </a>

            {status === "loading" ? null : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="w-7 h-7 bg-teal rounded-full flex items-center justify-center">
                    <span className="font-montserrat font-bold text-white text-xs">
                      {session.user.firstName?.[0]}{session.user.lastName?.[0]}
                    </span>
                  </div>
                  <span className="font-opensans text-sm text-white font-medium">{session.user.firstName}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-white/70 transition-transform", userMenuOpen && "rotate-180")} />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-montserrat font-semibold text-navy text-sm">{session.user.firstName} {session.user.lastName}</p>
                      <p className="font-opensans text-xs text-gray-500 mt-0.5">{session.user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-teal/10 text-teal text-xs font-montserrat font-semibold rounded-full">
                        {session.user.membershipTier} Member
                      </span>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-navy/60" />
                      <span className="font-opensans text-sm text-navy">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4 text-navy/60" />
                      <span className="font-opensans text-sm text-navy">My Profile</span>
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span className="font-opensans text-sm text-red-500">Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-white hover:text-white hover:bg-white/10">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button variant="gold" size="sm" asChild>
                  <Link href="/membership/join">Become a Subscriber</Link>
                </Button>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

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
            </nav>
            <div className="mt-4 px-4 flex flex-col gap-2">
              {session ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-lg text-white font-opensans text-sm">
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 px-4 py-3 bg-red-500/20 rounded-lg text-red-300 font-opensans text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="md" className="w-full border-white text-white hover:bg-white hover:text-navy" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button variant="gold" size="md" className="w-full" asChild>
                    <Link href="/membership/join">Become a Subscriber</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
