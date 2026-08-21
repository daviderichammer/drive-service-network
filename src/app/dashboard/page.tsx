import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Car,
  Calendar,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  TrendingDown,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getMembershipSnapshot } from "@/lib/dsn-plus/enrollment";
import {
  DSN_PLUS_DISCOUNT_LABEL,
  formatCents,
} from "@/lib/dsn-plus/discount";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Drive Service Network",
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "Pending", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-600 bg-blue-50 border-blue-200", icon: CheckCircle2 },
  IN_PROGRESS: { label: "In Progress", color: "text-teal-600 bg-teal-50 border-teal-200", icon: Wrench },
  COMPLETED: { label: "Completed", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-600 bg-red-50 border-red-200", icon: AlertCircle },
  NO_SHOW: { label: "No Show", color: "text-gray-600 bg-gray-50 border-gray-200", icon: AlertCircle },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const [vehicles, appointments] = await Promise.all([
    prisma.vehicle.findMany({
      where: { userId: session.user.id, status: { not: "REMOVED" } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: { userId: session.user.id },
      include: {
        vehicle: { select: { year: true, make: true, model: true, nickname: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const upcomingAppointments = appointments.filter(
    (a) => ["PENDING", "CONFIRMED"].includes(a.status)
  );
  const completedAppointments = appointments.filter(
    (a) => a.status === "COMPLETED"
  );
  const enrolledVehicles = vehicles.filter(
    (v) => v.programStatus === "DSN_PLUS"
  ).length;

  // P3 membership tracking. Savings are only ever reported from prices that
  // were actually recorded against an appointment — never estimated.
  const snapshot = await getMembershipSnapshot(session.user.id);
  const unenrolled = vehicles.filter((v) => v.programStatus !== "DSN_PLUS");

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-navy rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-montserrat font-bold text-2xl mb-1">
              Welcome back, {session.user.firstName}!
            </h1>
            <p className="font-opensans text-white/70 text-sm">
              Manage vehicles, track service history and schedule service.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <Star className="w-4 h-4 text-gold" />
            <span className="font-montserrat font-semibold text-white text-sm">
              {session.user.membershipTier === "DSN_PLUS" ? "DSN+ Member" : "Drive Member"}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        {/* BUILD "Dashboard visibility" — registered vehicles and enrolled
            vehicles are always shown as distinct counts. */}
        <div className="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="font-montserrat font-bold text-2xl text-white">{vehicles.length}</div>
            <div className="font-opensans text-white/60 text-xs mt-0.5">Vehicles registered</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="font-montserrat font-bold text-2xl text-gold">{enrolledVehicles}</div>
            <div className="font-opensans text-white/60 text-xs mt-0.5">Enrolled in DSN+</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="font-montserrat font-bold text-2xl text-white">{upcomingAppointments.length}</div>
            <div className="font-opensans text-white/60 text-xs mt-0.5">Upcoming</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="font-montserrat font-bold text-2xl text-white">{completedAppointments.length}</div>
            <div className="font-opensans text-white/60 text-xs mt-0.5">Completed</div>
          </div>
        </div>

        {/* Realised DSN+ savings, shown only when there are real savings to
            report (BUILD sections G and I). */}
        {snapshot.lifetimeSavingsCents > 0 && (
          <p className="mt-4 font-opensans text-sm text-white/70">
            You have saved{" "}
            <span className="font-montserrat font-bold text-gold">
              {formatCents(snapshot.lifetimeSavingsCents)}
            </span>{" "}
            with DSN+ so far.
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/book"
          className="flex items-center gap-3 p-4 bg-teal rounded-xl text-white hover:bg-teal-600 transition-colors group"
        >
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="font-montserrat font-bold text-sm">Book a Service</div>
            <div className="font-opensans text-white/70 text-xs">Schedule now</div>
          </div>
          <ArrowRight className="w-4 h-4 ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/dashboard/vehicles"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-card hover:border-teal/30 transition-colors group"
        >
          <div className="w-10 h-10 bg-navy/5 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-navy" />
          </div>
          <div>
            <div className="font-montserrat font-bold text-navy text-sm">My Vehicles</div>
            <div className="font-opensans text-gray-500 text-xs">{vehicles.length} registered</div>
          </div>
          <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/financing"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-card hover:border-gold/30 transition-colors group"
        >
          <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <div className="font-montserrat font-bold text-navy text-sm">Financing</div>
            <div className="font-opensans text-gray-500 text-xs">Explore options</div>
          </div>
          <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-navy" />
              <h2 className="font-montserrat font-bold text-navy text-base">My Vehicles</h2>
            </div>
            <Link
              href="/dashboard/vehicles"
              className="font-opensans text-sm text-teal hover:text-teal-600 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <div className="p-8 text-center">
              <Car className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-montserrat font-semibold text-navy text-sm mb-1">
                No vehicles yet
              </p>
              <p className="font-opensans text-gray-400 text-xs mb-4">
                Add a vehicle to unlock pricing and booking
              </p>
              <Button variant="primary" size="sm" asChild>
                <Link href="/dashboard/vehicles/new">
                  <Plus className="w-4 h-4" />
                  Add Vehicle
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-navy/5 rounded-lg flex items-center justify-center">
                      <Car className="w-4 h-4 text-navy/60" />
                    </div>
                    <div>
                      <p className="font-montserrat font-semibold text-navy text-sm">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      {vehicle.nickname && (
                        <p className="font-opensans text-gray-400 text-xs">{vehicle.nickname}</p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/book?vehicleId=${vehicle.id}`}
                    className="font-opensans text-xs text-teal hover:text-teal-600 transition-colors"
                  >
                    Get a quote
                  </Link>
                </div>
              ))}
              <div className="px-6 py-3">
                <Link
                  href="/dashboard/vehicles/new"
                  className="flex items-center gap-2 font-opensans text-sm text-navy hover:text-teal transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add another vehicle
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-navy" />
              <h2 className="font-montserrat font-bold text-navy text-base">Recent Appointments</h2>
            </div>
            <Link
              href="/dashboard/appointments"
              className="font-opensans text-sm text-teal hover:text-teal-600 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-montserrat font-semibold text-navy text-sm mb-1">
                No appointments yet
              </p>
              <p className="font-opensans text-gray-400 text-xs mb-4">
                Book your first service to get started
              </p>
              <Button variant="primary" size="sm" asChild>
                <Link href="/book">
                  <Calendar className="w-4 h-4" />
                  Book Service
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {appointments.map((appt) => {
                const config = statusConfig[appt.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;
                return (
                  <div key={appt.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-montserrat font-semibold text-navy text-sm truncate">
                          {appt.serviceType}
                        </p>
                        {appt.vehicle && (
                          <p className="font-opensans text-gray-400 text-xs mt-0.5">
                            {appt.vehicle.year} {appt.vehicle.make} {appt.vehicle.model}
                            {appt.vehicle.nickname && ` · ${appt.vehicle.nickname}`}
                          </p>
                        )}
                        {appt.shopName && (
                          <p className="font-opensans text-gray-400 text-xs">{appt.shopName}</p>
                        )}
                        <p className="font-opensans text-gray-400 text-xs mt-1">
                          {new Date(appt.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-montserrat font-semibold border ${config.color} flex-shrink-0`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CHANGE 003-B / 011-C — membership is free; the nationwide discount
          program is a separate optional subscription.

          P3: the call to action is per vehicle, because enrolment is per
          vehicle. A member who has enrolled one of three vehicles still sees
          this, addressed to the two that are not covered. */}
      {unenrolled.length > 0 && (
        <div className="bg-gradient-to-r from-navy to-navy-700 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-montserrat font-bold text-white text-base mb-1">
              {enrolledVehicles > 0
                ? `${unenrolled.length} of your vehicles ${unenrolled.length === 1 ? "is" : "are"} not covered by DSN+`
                : `Save ${DSN_PLUS_DISCOUNT_LABEL} on Vehicle Service & Repairs`}
            </h3>
            <p className="font-opensans text-white/70 text-sm">
              Your Drive Membership is free. DSN+ is an optional subscription that
              takes {DSN_PLUS_DISCOUNT_LABEL} off every service, and it attaches to the
              vehicle rather than the account.
              {snapshot.forgoneSavingsCents > 0 && (
                <>
                  {" "}
                  On the work you have already booked, DSN+ would have saved you{" "}
                  <span className="font-semibold text-gold">
                    {formatCents(snapshot.forgoneSavingsCents)}
                  </span>
                  .
                </>
              )}
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap gap-3">
            <Button variant="gold" size="md" asChild>
              <Link href="/membership/dsn-plus">
                Enroll a vehicle
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="md" asChild>
              <Link
                href="/discount-program-faq"
                className="border-white/60 text-white hover:bg-white hover:text-navy"
              >
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
