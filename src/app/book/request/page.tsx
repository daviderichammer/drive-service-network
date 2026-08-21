import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestQuoteForm } from "@/components/booking/RequestQuoteForm";

export const metadata: Metadata = {
  title: "Request Pricing — Drive Service Network",
};

export const dynamic = "force-dynamic";

export default async function RequestQuotePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/membership/join?returnTo=/book");
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session.user.id, status: { not: "REMOVED" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      year: true,
      make: true,
      model: true,
      nickname: true,
      licensePlate: true,
      vin: true,
    },
  });

  if (vehicles.length === 0) {
    redirect("/dashboard/vehicles/new?returnTo=/book");
  }

  return (
    <div className="section-container py-10 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-montserrat text-2xl font-bold text-navy md:text-3xl">
          Confirm your request
        </h1>
        <p className="mt-2 font-opensans text-sm leading-relaxed text-gray-500">
          Choose the vehicle this work is for. Pricing and service history are tracked
          per vehicle, so it is important that we have the right one.
        </p>

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-card md:p-8">
          <RequestQuoteForm vehicles={vehicles} />
        </div>
      </div>
    </div>
  );
}
