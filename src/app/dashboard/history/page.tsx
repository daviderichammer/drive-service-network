/**
 * Service and repair history — Priority 4
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * BUILD sections 25, K and R. A vehicle's history is the reason a member keeps
 * a Drive Service Network account after the first repair, so it is presented
 * per vehicle and it survives everything: cancelled appointments still appear,
 * removed vehicles keep their record, and the DSN+ saving realised on each job
 * is stated where it was recorded.
 *
 * The history is assembled from two places. Completed appointments booked
 * through DSN are the primary source. Repair records imported or entered
 * separately are merged in, so a vehicle brought into DSN with existing history
 * is not shown as a blank slate.
 */

import Link from "next/link";
import { Calendar, Car, Plus, Wrench } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { formatCents } from "@/lib/dsn-plus/discount";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service History | Drive Service Network",
};

interface HistoryEntry {
  key: string;
  date: Date | null;
  title: string;
  facility: string | null;
  facilityLocation: string | null;
  status: string | null;
  priceCents: number | null;
  savingsCents: number | null;
  appointmentId: string | null;
}

export default async function ServiceHistoryPage() {
  const session = await auth();
  if (!session) return null;

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      year: true,
      make: true,
      model: true,
      nickname: true,
      licensePlate: true,
      status: true,
      programStatus: true,
      appointments: {
        orderBy: { scheduledAt: "desc" },
        select: {
          id: true,
          serviceType: true,
          status: true,
          scheduledAt: true,
          completedAt: true,
          createdAt: true,
          shopName: true,
          shopCity: true,
          shopState: true,
          quotedPriceCents: true,
          finalPriceCents: true,
          dsnPlusSavingsCents: true,
        },
      },
      repairHistory: {
        orderBy: { serviceDate: "desc" },
        select: {
          id: true,
          serviceDate: true,
          workPerformed: true,
          facilityName: true,
          facilityCity: true,
          facilityState: true,
          finalPriceCents: true,
          quotedPriceCents: true,
          dsnPlusSavingsCents: true,
        },
      },
    },
  });

  const totalSaved = vehicles.reduce(
    (sum, vehicle) =>
      sum +
      vehicle.appointments.reduce((s, a) => s + (a.dsnPlusSavingsCents ?? 0), 0) +
      vehicle.repairHistory.reduce((s, r) => s + (r.dsnPlusSavingsCents ?? 0), 0),
    0
  );

  const totalVisits = vehicles.reduce(
    (sum, vehicle) => sum + vehicle.appointments.length + vehicle.repairHistory.length,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-montserrat text-2xl font-bold text-navy">Service History</h1>
        <p className="mt-1 font-opensans text-sm text-gray-500">
          Every service booked through Drive Service Network, kept per vehicle.
        </p>
      </div>

      {totalVisits > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-card">
            <p className="font-montserrat text-xl font-black text-navy">{totalVisits}</p>
            <p className="font-opensans text-xs text-gray-500">Service records</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-card">
            <p className="font-montserrat text-xl font-black text-navy">
              {vehicles.filter((v) => v.status !== "REMOVED").length}
            </p>
            <p className="font-opensans text-xs text-gray-500">Vehicles</p>
          </div>
          {totalSaved > 0 && (
            <div className="rounded-xl border border-teal/30 bg-teal/5 p-4">
              <p className="font-montserrat text-xl font-black text-teal">
                {formatCents(totalSaved)}
              </p>
              <p className="font-opensans text-xs text-gray-600">Saved with DSN+</p>
            </div>
          )}
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-card">
          <Car className="mx-auto mb-3 h-12 w-12 text-gray-200" />
          <p className="font-montserrat text-sm font-semibold text-navy">
            No vehicles registered
          </p>
          <p className="mt-1 font-opensans text-xs text-gray-400">
            Add a vehicle and your service history will build here.
          </p>
          <Button variant="primary" size="sm" className="mt-4" asChild>
            <Link href="/dashboard/vehicles/new">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Link>
          </Button>
        </div>
      ) : (
        vehicles.map((vehicle) => {
          const entries: HistoryEntry[] = [
            ...vehicle.appointments.map((a) => ({
              key: `a-${a.id}`,
              date: a.completedAt ?? a.scheduledAt ?? a.createdAt,
              title: a.serviceType,
              facility: a.shopName,
              facilityLocation:
                a.shopCity && a.shopState ? `${a.shopCity}, ${a.shopState}` : null,
              status: a.status,
              priceCents: a.finalPriceCents ?? a.quotedPriceCents,
              savingsCents: a.dsnPlusSavingsCents,
              appointmentId: a.id,
            })),
            ...vehicle.repairHistory.map((r) => ({
              key: `r-${r.id}`,
              date: r.serviceDate,
              title: r.workPerformed ?? "Service performed",
              facility: r.facilityName,
              facilityLocation:
                r.facilityCity && r.facilityState
                  ? `${r.facilityCity}, ${r.facilityState}`
                  : null,
              status: null,
              priceCents: r.finalPriceCents ?? r.quotedPriceCents,
              savingsCents: r.dsnPlusSavingsCents,
              appointmentId: null,
            })),
          ].sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

          return (
            <section
              key={vehicle.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/5">
                    <Car className="h-4 w-4 text-navy/60" />
                  </div>
                  <div>
                    <p className="font-montserrat text-sm font-bold text-navy">
                      {vehicle.nickname ? `${vehicle.nickname} — ` : ""}
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="font-opensans text-xs text-gray-400">
                      {vehicle.licensePlate ?? "No plate recorded"}
                      {vehicle.status === "REMOVED" && " · removed from your fleet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {vehicle.programStatus === "DSN_PLUS" && (
                    <span className="rounded-full bg-teal/10 px-2.5 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wide text-teal">
                      DSN+
                    </span>
                  )}
                  <span className="font-opensans text-xs text-gray-400">
                    {entries.length} record{entries.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              {entries.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Wrench className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                  <p className="font-opensans text-sm text-gray-500">
                    No service recorded for this vehicle yet.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href={`/book?vehicleId=${vehicle.id}`}>Book a service</Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {entries.map((entry) => {
                    const body = (
                      <div className="flex items-start justify-between gap-4 px-6 py-4 transition-colors hover:bg-gray-50">
                        <div className="min-w-0">
                          <p className="font-montserrat text-sm font-semibold text-navy">
                            {entry.title}
                          </p>
                          <p className="mt-0.5 font-opensans text-xs text-gray-500">
                            {entry.facility ?? "Facility not recorded"}
                            {entry.facilityLocation && ` · ${entry.facilityLocation}`}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1 font-opensans text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {entry.date
                              ? entry.date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Date not recorded"}
                            {entry.status && ` · ${entry.status.replace(/_/g, " ").toLowerCase()}`}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {entry.priceCents !== null && (
                            <p className="font-montserrat text-sm font-bold text-navy">
                              {formatCents(entry.priceCents)}
                            </p>
                          )}
                          {entry.savingsCents ? (
                            <p className="font-opensans text-xs text-teal">
                              saved {formatCents(entry.savingsCents)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );

                    return (
                      <li key={entry.key}>
                        {entry.appointmentId ? (
                          <Link href={`/dashboard/appointments/${entry.appointmentId}`}>
                            {body}
                          </Link>
                        ) : (
                          body
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
