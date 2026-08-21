"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Car,
  MapPin,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCents } from "@/lib/dsn-plus/discount";

interface Appointment {
  id: string;
  serviceType: string;
  serviceDescription?: string | null;
  shopName?: string | null;
  shopAddress?: string | null;
  /** Offset-bearing timestamp of the booked slot. */
  scheduledAt?: string | null;
  status: string;
  quotedPriceCents?: number | null;
  finalPriceCents?: number | null;
  dsnPlusSavingsCents?: number | null;
  createdAt: string;
  vehicle?: {
    year: number;
    make: string;
    model: string;
    nickname?: string | null;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "Pending", color: "text-yellow-700 bg-yellow-50 border-yellow-200", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-700 bg-blue-50 border-blue-200", icon: CheckCircle2 },
  IN_PROGRESS: { label: "In Progress", color: "text-teal-700 bg-teal-50 border-teal-200", icon: Wrench },
  COMPLETED: { label: "Completed", color: "text-green-700 bg-green-50 border-green-200", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-700 bg-red-50 border-red-200", icon: AlertCircle },
  NO_SHOW: { label: "No Show", color: "text-gray-700 bg-gray-50 border-gray-200", icon: AlertCircle },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/dashboard/appointments");
        const data = await res.json();
        setAppointments(data.appointments || []);
      } catch {
        console.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filtered = filter === "ALL"
    ? appointments
    : appointments.filter((a) => a.status === filter);

  const upcoming = appointments.filter((a) => ["PENDING", "CONFIRMED"].includes(a.status));
  const completed = appointments.filter((a) => a.status === "COMPLETED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-navy text-2xl">Appointments</h1>
          <p className="font-opensans text-gray-500 text-sm mt-1">
            Your complete service history and upcoming appointments
          </p>
        </div>
        <Button variant="primary" size="md" asChild leftIcon={<Plus className="w-4 h-4" />}>
          <Link href="/book">Book Service</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 text-center">
          <div className="font-montserrat font-bold text-2xl text-navy">{appointments.length}</div>
          <div className="font-opensans text-gray-500 text-xs mt-0.5">Total</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 text-center">
          <div className="font-montserrat font-bold text-2xl text-teal">{upcoming.length}</div>
          <div className="font-opensans text-gray-500 text-xs mt-0.5">Upcoming</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 text-center">
          <div className="font-montserrat font-bold text-2xl text-green-600">{completed.length}</div>
          <div className="font-opensans text-gray-500 text-xs mt-0.5">Completed</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-opensans text-sm font-medium transition-all ${
              filter === status
                ? "bg-navy text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-navy/30"
            }`}
          >
            {status === "ALL" ? "All" : statusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-teal animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-montserrat font-bold text-navy text-lg mb-2">
            {filter === "ALL" ? "No appointments yet" : `No ${statusConfig[filter]?.label || filter} appointments`}
          </h3>
          <p className="font-opensans text-gray-400 text-sm mb-6">
            {filter === "ALL"
              ? "Book your first service to get started with DSN commercial pricing."
              : "Try a different filter to see other appointments."}
          </p>
          {filter === "ALL" && (
            <Button variant="primary" size="md" asChild>
              <Link href="/book">Book Your First Service</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => {
            const config = statusConfig[appt.status] || statusConfig.PENDING;
            const StatusIcon = config.icon;
            return (
              <Link
                key={appt.id}
                href={`/dashboard/appointments/${appt.id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:border-teal/40 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-montserrat font-bold text-navy text-base">
                        {appt.serviceType}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-montserrat font-semibold border ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>

                    {appt.serviceDescription && (
                      <p className="font-opensans text-gray-500 text-sm mb-2 line-clamp-2">
                        {appt.serviceDescription}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs font-opensans text-gray-500">
                      {appt.vehicle && (
                        <span className="flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5" />
                          {appt.vehicle.year} {appt.vehicle.make} {appt.vehicle.model}
                          {appt.vehicle.nickname && ` · ${appt.vehicle.nickname}`}
                        </span>
                      )}
                      {appt.shopName && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {appt.shopName}
                        </span>
                      )}
                      {appt.scheduledAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(appt.scheduledAt).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {(appt.finalPriceCents || appt.quotedPriceCents) && (
                      <div>
                        <div className="font-montserrat font-bold text-navy text-base">
                          {formatCents(appt.finalPriceCents ?? appt.quotedPriceCents)}
                        </div>
                        <div className="font-opensans text-gray-400 text-xs">
                          {appt.finalPriceCents ? "Final" : "Quoted"}
                        </div>
                      </div>
                    )}
                    {appt.dsnPlusSavingsCents ? (
                      <div className="font-opensans text-teal text-xs">
                        saved {formatCents(appt.dsnPlusSavingsCents)}
                      </div>
                    ) : null}
                    <div className="font-opensans text-gray-400 text-xs mt-1">
                      {new Date(appt.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
