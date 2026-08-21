"use client";

/**
 * Member dashboard navigation
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Priority 4 adds the retention surfaces — service history, facility messages,
 * safety recalls and support — alongside the existing vehicle and appointment
 * pages.
 *
 * The sidebar is a horizontal, scrollable strip on small screens rather than
 * being hidden entirely, which is what it did before. Hiding navigation on
 * mobile stranded members on whichever page they happened to land on, and the
 * majority of this audience is on a phone (P5 mobile responsiveness).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Calendar,
  User,
  Star,
  LogOut,
  ChevronRight,
  MessageSquare,
  ShieldAlert,
  LifeBuoy,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface DashboardSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    membershipTier: string;
  };
  /** Live counts so the member can see where attention is needed. */
  badges?: {
    messages?: number;
    recalls?: number;
  };
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/vehicles", label: "My Vehicles", icon: Car },
  { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/dashboard/history", label: "Service History", icon: Wrench },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, badge: "messages" },
  { href: "/dashboard/recalls", label: "Safety Recalls", icon: ShieldAlert, badge: "recalls" },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
  { href: "/membership/dsn-plus", label: "DSN+ Discount Program", icon: Star },
] as const;

export function DashboardSidebar({ user, badges }: DashboardSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const badgeCount = (key?: string): number => {
    if (!key || !badges) return 0;
    return (badges as Record<string, number | undefined>)[key] ?? 0;
  };

  // Membership tier is FREE or DSN_PLUS only (REVAMP BUILD section J).
  const tierColors: Record<string, string> = {
    FREE: "bg-teal/10 text-teal",
    DSN_PLUS: "bg-gold/20 text-gold-600",
  };

  const tierLabel = user.membershipTier === "DSN_PLUS" ? "DSN+ Member" : "Drive Member";

  return (
    <>
      {/* Mobile: horizontal navigation strip */}
      <nav
        aria-label="Dashboard sections"
        className="scrollbar-hide -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:hidden"
      >
        {navItems.map((item) => {
          const count = badgeCount("badge" in item ? item.badge : undefined);
          const active = isActive(item.href, "exact" in item ? item.exact : undefined);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 font-montserrat text-xs font-semibold transition-colors",
                active
                  ? "bg-navy text-white"
                  : "bg-white text-gray-600 border border-gray-100"
              )}
            >
              <item.icon
                className={cn("h-3.5 w-3.5", active ? "text-gold" : "text-gray-400")}
              />
              {item.label}
              {count > 0 && (
                <span className="ml-0.5 rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-black text-navy">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Desktop: sidebar */}
      <aside className="hidden w-64 flex-shrink-0 md:block">
        {/* User Card */}
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-teal">
              <span className="font-montserrat text-base font-bold text-white">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate font-montserrat text-sm font-bold text-navy">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate font-opensans text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-montserrat text-xs font-bold",
              tierColors[user.membershipTier] || tierColors.FREE
            )}
          >
            <Star className="h-3 w-3" />
            {tierLabel}
          </div>
        </div>

        {/* Navigation */}
        <nav className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
          {navItems.map((item) => {
            const count = badgeCount("badge" in item ? item.badge : undefined);
            const active = isActive(item.href, "exact" in item ? item.exact : undefined);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between border-b border-gray-50 px-4 py-3.5 transition-all duration-200 last:border-0",
                  active ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-50 hover:text-navy"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn("h-4 w-4", active ? "text-gold" : "text-gray-400")}
                  />
                  <span className="font-opensans text-sm font-medium">{item.label}</span>
                </div>
                {count > 0 ? (
                  <span className="rounded-full bg-gold px-2 py-0.5 font-montserrat text-[10px] font-black text-navy">
                    {count}
                  </span>
                ) : (
                  <ChevronRight
                    className={cn("h-3.5 w-3.5 opacity-50", active && "text-white")}
                  />
                )}
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3.5 text-left text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-opensans text-sm font-medium">Sign Out</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
