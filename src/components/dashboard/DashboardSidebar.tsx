"use client";

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
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/vehicles", label: "My Vehicles", icon: Car },
  { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
  { href: "/membership/join", label: "Upgrade to DSN+", icon: Star },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const tierColors: Record<string, string> = {
    FREE: "bg-gray-100 text-gray-600",
    BASIC: "bg-teal/10 text-teal",
    PROFESSIONAL: "bg-navy/10 text-navy",
    ENTERPRISE: "bg-gold/20 text-gold-600",
  };

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      {/* User Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center flex-shrink-0">
            <span className="font-montserrat font-bold text-white text-base">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-montserrat font-bold text-navy text-sm truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="font-opensans text-gray-500 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-montserrat font-bold", tierColors[user.membershipTier] || tierColors.FREE)}>
          <Star className="w-3 h-3" />
          {user.membershipTier} Member
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between px-4 py-3.5 transition-all duration-200 border-b border-gray-50 last:border-0",
              isActive(item.href, item.exact)
                ? "bg-navy text-white"
                : "text-gray-600 hover:bg-gray-50 hover:text-navy"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("w-4 h-4", isActive(item.href, item.exact) ? "text-gold" : "text-gray-400")} />
              <span className="font-opensans text-sm font-medium">{item.label}</span>
            </div>
            <ChevronRight className={cn("w-3.5 h-3.5 opacity-50", isActive(item.href, item.exact) && "text-white")} />
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-3.5 w-full text-left text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-opensans text-sm font-medium">Sign Out</span>
        </button>
      </nav>
    </aside>
  );
}
