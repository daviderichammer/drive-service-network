import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, Plus } from "lucide-react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { VehicleCard } from "@/components/vehicles/VehicleCard";

export const metadata: Metadata = {
  title: "My Vehicles | Drive Service Network",
};

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/vehicles");
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session.user.id, status: { not: "REMOVED" } },
    orderBy: { createdAt: "desc" },
  });

  const enrolled = vehicles.filter((v) => v.programStatus === "DSN_PLUS").length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-navy md:text-3xl">
            My Vehicles
          </h1>
          <p className="mt-1.5 font-opensans text-sm text-gray-500">
            {vehicles.length === 0
              ? "Add a vehicle to unlock pricing and booking."
              : `${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"} registered · ${enrolled} enrolled in the discount program`}
          </p>
        </div>
        <Button variant="gold" asChild>
          <Link href="/dashboard/vehicles/new">
            <Plus className="h-4 w-4" />
            <span className="ml-1.5">Add Vehicle</span>
          </Link>
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy/5">
            <Car className="h-7 w-7 text-navy/40" />
          </div>
          <h2 className="mt-5 font-montserrat text-lg font-bold text-navy">
            No vehicles yet
          </h2>
          <p className="mx-auto mt-2 max-w-md font-opensans text-sm leading-relaxed text-gray-500">
            Every quote and booking on Drive Service Network is tied to a specific
            vehicle, so that pricing, parts and service history stay accurate for each
            unit you operate.
          </p>
          <div className="mt-6">
            <Button variant="gold" asChild>
              <Link href="/dashboard/vehicles/new">
                <Plus className="h-4 w-4" />
                <span className="ml-1.5">Add Your First Vehicle</span>
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={{
                id: vehicle.id,
                year: vehicle.year,
                make: vehicle.make,
                model: vehicle.model,
                trim: vehicle.trim,
                color: vehicle.color,
                engine: vehicle.engine,
                vin: vehicle.vin,
                licensePlate: vehicle.licensePlate,
                mileage: vehicle.mileage,
                nickname: vehicle.nickname,
                programStatus: vehicle.programStatus,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
