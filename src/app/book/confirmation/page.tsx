"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CheckCircle,
  MapPin,
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  Wrench,
  ArrowRight,
  Home,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmationData {
  selectedServiceName: string;
  selectedCategory: string;
  selectedShopName: string;
  selectedShopAddress: string;
  selectedShopCity: string;
  selectedShopState: string;
  selectedShopPhone: string;
  selectedShopRating: number | null;
  vehicle: { year: string; make: string; model: string; mileage?: string };
  firstName: string;
  lastName: string;
  email: string;
  notes?: string;
  selectedTimeslotDate: string;
  selectedTimeslotTime: string;
  openbayUserId: string;
  appointment?: {
    id?: string;
    confirmationNumber?: string;
    status?: string;
    scheduledAt?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDisplayDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  try {
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
  } catch {
    return timeStr;
  }
}

function generateConfirmationCode(id?: string): string {
  if (id) return `DSN-${String(id).toUpperCase().slice(0, 8)}`;
  return `DSN-${Math.random().toString(36).toUpperCase().slice(2, 10)}`;
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
        <span className="text-teal">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-opensans text-gray-400 uppercase tracking-wide mb-0.5">
          {label}
        </div>
        <div
          className={cn(
            "font-opensans text-sm",
            highlight ? "font-bold text-navy text-base" : "text-gray-700"
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConfirmationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<ConfirmationData | null>(null);
  const [confirmationCode, setConfirmationCode] = useState("");

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem("dsn_booking_confirmation") ||
        sessionStorage.getItem("dsn_booking_flow");
      if (!stored) {
        router.replace("/book");
        return;
      }
      const parsed: ConfirmationData & { bookingComplete?: boolean } = JSON.parse(stored);
      if (!parsed.bookingComplete && !parsed.appointment) {
        router.replace("/book");
        return;
      }
      setData(parsed);
      setConfirmationCode(
        generateConfirmationCode(
          parsed.appointment?.confirmationNumber || parsed.appointment?.id
        )
      );
    } catch {
      router.replace("/book");
    }
  }, [router]);

  function handlePrint() {
    window.print();
  }

  function handleBookAnother() {
    try {
      sessionStorage.removeItem("dsn_booking_flow");
      sessionStorage.removeItem("dsn_booking_confirmation");
    } catch {
      // ignore
    }
    router.push("/book");
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const mapQuery = encodeURIComponent(
    `${data.selectedShopName}, ${data.selectedShopAddress}, ${data.selectedShopCity}, ${data.selectedShopState}`
  );
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav bar */}
      <div className="bg-navy py-4 print:hidden">
        <div className="section-container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold rounded-md flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
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
              <span className="font-montserrat font-bold text-white text-sm block leading-tight">Drive Service</span>
              <span className="font-montserrat font-bold text-gold text-sm block leading-tight">Network</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="section-container py-10 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success hero */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-teal/10 border-4 border-teal/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-teal" />
            </div>
            <h1 className="heading-lg text-navy mb-2">Appointment Confirmed!</h1>
            <p className="text-gray-500 font-opensans">
              Your appointment has been booked. A confirmation has been sent to{" "}
              <span className="font-semibold text-navy">{data.email}</span>.
            </p>
          </div>

          {/* Confirmation code */}
          <div className="bg-navy rounded-2xl p-6 mb-6 text-center">
            <p className="text-white/60 font-opensans text-xs uppercase tracking-widest mb-1">
              Confirmation Number
            </p>
            <p className="font-montserrat font-bold text-gold text-3xl tracking-wider">
              {confirmationCode}
            </p>
            {data.appointment?.id && (
              <p className="text-white/40 font-opensans text-xs mt-1">
                Openbay ID: {data.appointment.id}
              </p>
            )}
          </div>

          {/* Appointment details card */}
          <div className="bg-white rounded-xl shadow-card p-6 mb-4">
            <h2 className="font-montserrat font-semibold text-navy text-base mb-1">
              Appointment Details
            </h2>
            <div className="divide-y divide-gray-100">
              <DetailRow
                icon={<Calendar className="w-4 h-4" />}
                label="Date"
                value={formatDisplayDate(data.selectedTimeslotDate)}
                highlight
              />
              <DetailRow
                icon={<Clock className="w-4 h-4" />}
                label="Time"
                value={formatTime(data.selectedTimeslotTime)}
                highlight
              />
              <DetailRow
                icon={<Wrench className="w-4 h-4" />}
                label="Service"
                value={data.selectedServiceName}
              />
              <DetailRow
                icon={<MapPin className="w-4 h-4" />}
                label="Shop"
                value={`${data.selectedShopName} — ${data.selectedShopAddress}, ${data.selectedShopCity}, ${data.selectedShopState}`}
              />
              {data.selectedShopPhone && (
                <DetailRow
                  icon={<Phone className="w-4 h-4" />}
                  label="Shop Phone"
                  value={data.selectedShopPhone}
                />
              )}
              <DetailRow
                icon={<Car className="w-4 h-4" />}
                label="Vehicle"
                value={`${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}${data.vehicle.mileage ? ` · ${Number(data.vehicle.mileage).toLocaleString()} miles` : ""}`}
              />
              <DetailRow
                icon={<User className="w-4 h-4" />}
                label="Customer"
                value={`${data.firstName} ${data.lastName} · ${data.email}`}
              />
              {data.notes && (
                <DetailRow
                  icon={<Wrench className="w-4 h-4" />}
                  label="Notes"
                  value={data.notes}
                />
              )}
            </div>
          </div>

          {/* Map link */}
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white rounded-xl shadow-card p-4 mb-6 hover:shadow-card-hover transition-shadow group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-teal" />
            </div>
            <div className="flex-1">
              <div className="font-montserrat font-semibold text-navy text-sm">
                Get Directions
              </div>
              <div className="text-gray-500 font-opensans text-xs">
                {data.selectedShopAddress}, {data.selectedShopCity}, {data.selectedShopState}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal transition-colors" />
          </a>

          {/* What to expect */}
          <div className="bg-teal/5 border border-teal/15 rounded-xl p-5 mb-6">
            <h3 className="font-montserrat font-semibold text-navy text-sm mb-3">
              What to Expect
            </h3>
            <ul className="space-y-2 text-sm font-opensans text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                The shop will contact you to confirm your appointment.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                Bring your vehicle registration and any relevant service records.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                Arrive 5–10 minutes early to complete check-in paperwork.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                The shop will provide a final price estimate before any work begins.
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrint}
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Confirmation
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleBookAnother}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Book Another Service
            </Button>
          </div>

          {session ? (
            <div className="mt-4 p-4 bg-teal/5 border border-teal/20 rounded-xl text-center">
              <p className="font-opensans text-sm text-navy mb-2">
                This appointment has been saved to your member dashboard.
              </p>
              <Link
                href="/dashboard/appointments"
                className="font-montserrat font-semibold text-teal text-sm hover:text-teal-600 transition-colors"
              >
                View in Dashboard →
              </Link>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-navy/5 border border-navy/10 rounded-xl text-center">
              <p className="font-opensans text-sm text-gray-600 mb-2">
                Create a free account to track this appointment and get commercial pricing.
              </p>
              <Link
                href="/auth/register"
                className="font-montserrat font-semibold text-teal text-sm hover:text-teal-600 transition-colors"
              >
                Create Free Account →
              </Link>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 font-opensans mt-6">
            Powered by{" "}
            <span className="font-semibold">Drive Service Network</span> &amp;{" "}
            <span className="font-semibold">Openbay</span> · Partner #{" "}
            <span className="font-semibold">116</span>
          </p>
        </div>
      </div>
    </div>
  );
}
