import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddVehicleForm } from "@/components/vehicles/AddVehicleForm";

export const metadata: Metadata = {
  title: "Add a Vehicle | Drive Service Network",
};

export const dynamic = "force-dynamic";

export default async function AddVehiclePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; returnTo?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/vehicles/new");
  }

  const params = await searchParams;
  const vehicleCount = await prisma.vehicle.count({
    where: { userId: session.user.id, status: { not: "REMOVED" } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/vehicles"
        className="inline-flex items-center gap-1.5 font-opensans text-sm text-gray-500 transition-colors hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my vehicles
      </Link>

      <h1 className="mt-4 font-montserrat text-2xl font-bold text-navy md:text-3xl">
        {vehicleCount === 0 ? "Add Your First Vehicle" : "Add a Vehicle"}
      </h1>
      <p className="mt-2 font-opensans text-sm leading-relaxed text-gray-500">
        Your vehicle profile keeps pricing, parts and service history accurate for
        every unit you operate.
      </p>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-card md:p-8">
        <AddVehicleForm
          returnTo={params.returnTo}
          isFirstVehicle={vehicleCount === 0 || params.welcome === "1"}
        />
      </div>
    </div>
  );
}
