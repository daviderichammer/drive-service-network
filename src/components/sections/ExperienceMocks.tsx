import React from "react";
import {
  Calendar,
  Car,
  Check,
  Clock,
  MapPin,
  MessageSquare,
  Search,
  Star,
} from "lucide-react";

/**
 * CHANGE 007-E / 007-F — accurate visual representations of the DSN
 * service-request, quote-comparison and appointment-scheduling experience.
 * These are illustrative interface representations, not marketing copy.
 */

/** STEP 1 — the service-request interface. */
export function ServiceRequestMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
        <span className="ml-3 font-opensans text-xs text-gray-400">
          driveservicenetwork.com
        </span>
      </div>

      <div className="p-5 md:p-6">
        <p className="font-montserrat text-xs font-bold uppercase tracking-widest text-teal">
          Step 1 of 3
        </p>
        <p className="mt-2 font-montserrat text-lg font-bold text-navy">
          What does the vehicle need?
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="font-opensans text-sm text-navy">
            Brake pads need replacement
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-xl border-2 border-teal bg-teal/5 px-4 py-3">
            <span className="font-opensans text-sm font-semibold text-navy">
              Brake Pad Replacement — Front
            </span>
            <Check className="h-4 w-4 text-teal" />
          </div>
          <div className="rounded-xl border border-gray-200 px-4 py-3">
            <span className="font-opensans text-sm text-gray-500">
              Brake Pad &amp; Rotor Replacement
            </span>
          </div>
          <div className="rounded-xl border border-gray-200 px-4 py-3">
            <span className="font-opensans text-sm text-gray-500">
              Brake System Inspection
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 px-4 py-3">
            <p className="font-opensans text-xs text-gray-400">Vehicle</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-opensans text-sm font-semibold text-navy">
              <Car className="h-3.5 w-3.5 text-teal" />
              2022 Toyota Camry
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 px-4 py-3">
            <p className="font-opensans text-xs text-gray-400">Vehicle location</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-opensans text-sm font-semibold text-navy">
              <MapPin className="h-3.5 w-3.5 text-teal" />
              Atlanta, GA 30303
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-gold px-4 py-3 text-center font-montserrat text-sm font-bold text-navy">
          Get Quotes
        </div>
      </div>
    </div>
  );
}

const QUOTE_RESULTS = [
  {
    name: "National Brand Service Center",
    distance: "1.2 mi",
    rating: "4.8",
    reviews: "412",
    price: "$289",
    availability: "Tomorrow, 8:00 AM",
    best: true,
  },
  {
    name: "Local Auto Service Facility",
    distance: "2.6 mi",
    rating: "4.7",
    reviews: "168",
    price: "$312",
    availability: "Today, 3:30 PM",
    best: false,
  },
  {
    name: "Independent Repair Professional",
    distance: "3.4 mi",
    rating: "4.9",
    reviews: "96",
    price: "$268",
    availability: "Thursday, 9:00 AM",
    best: false,
  },
];

/** STEP 2 — map plus three nearby providers and three prices. */
export function QuoteComparisonMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      {/* Map representation */}
      <div className="relative h-44 bg-[#e8eef4] md:h-52">
        <svg
          viewBox="0 0 400 200"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <rect width="400" height="200" fill="#e8eef4" />
          <path d="M0 60 H400" stroke="#ffffff" strokeWidth="7" />
          <path d="M0 130 H400" stroke="#ffffff" strokeWidth="5" />
          <path d="M90 0 V200" stroke="#ffffff" strokeWidth="6" />
          <path d="M250 0 V200" stroke="#ffffff" strokeWidth="5" />
          <path d="M330 0 V200" stroke="#ffffff" strokeWidth="3" />
          <rect x="100" y="70" width="60" height="45" fill="#dbe4ec" />
          <rect x="265" y="15" width="50" height="35" fill="#dbe4ec" />
          <rect x="20" y="140" width="55" height="40" fill="#dbe4ec" />
          <path d="M0 175 H400" stroke="#cfdbe6" strokeWidth="10" />
        </svg>

        <div className="absolute left-[22%] top-[30%] flex flex-col items-center">
          <span className="rounded-full bg-navy px-2.5 py-1 font-montserrat text-xs font-bold text-white shadow-lg">
            $289
          </span>
          <MapPin className="mt-0.5 h-5 w-5 text-navy" fill="#1B2B4D" />
        </div>
        <div className="absolute left-[52%] top-[55%] flex flex-col items-center">
          <span className="rounded-full bg-navy px-2.5 py-1 font-montserrat text-xs font-bold text-white shadow-lg">
            $312
          </span>
          <MapPin className="mt-0.5 h-5 w-5 text-navy" fill="#1B2B4D" />
        </div>
        <div className="absolute left-[76%] top-[24%] flex flex-col items-center">
          <span className="rounded-full bg-teal px-2.5 py-1 font-montserrat text-xs font-bold text-white shadow-lg">
            $268
          </span>
          <MapPin className="mt-0.5 h-5 w-5 text-teal" fill="#2A9D8F" />
        </div>
        <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 font-opensans text-xs font-semibold text-navy shadow">
          3 nearby service options
        </div>
      </div>

      {/* Quote list */}
      <div className="divide-y divide-gray-100">
        {QUOTE_RESULTS.map((quote) => (
          <div key={quote.name} className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-montserrat text-sm font-bold text-navy">{quote.name}</p>
                {quote.best && (
                  <span className="rounded-full bg-teal/10 px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-teal">
                    Selected
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-opensans text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  {quote.distance}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-gold" fill="#E9B44C" />
                  {quote.rating} ({quote.reviews})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {quote.availability}
                </span>
              </div>
            </div>
            <p className="flex-shrink-0 font-montserrat text-lg font-black text-navy">
              {quote.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMES = ["8:00 AM", "9:30 AM", "11:00 AM", "1:30 PM", "3:00 PM", "4:30 PM"];

/** STEP 3 — the calendar and available appointment times. */
export function AppointmentMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
        <p className="flex items-center gap-2 font-montserrat text-sm font-bold text-navy">
          <Calendar className="h-4 w-4 text-teal" />
          Choose a date &amp; time
        </p>
        <span className="font-opensans text-xs text-gray-400">March 2026</span>
      </div>

      <div className="p-5 md:p-6">
        <div className="grid grid-cols-6 gap-2">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className={`rounded-xl border px-1 py-2.5 text-center ${
                index === 2
                  ? "border-teal bg-teal text-white"
                  : "border-gray-200 bg-white text-navy"
              }`}
            >
              <p className="font-opensans text-[10px] uppercase tracking-wide opacity-70">
                {day}
              </p>
              <p className="mt-0.5 font-montserrat text-sm font-bold">{9 + index}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 font-montserrat text-xs font-bold uppercase tracking-widest text-navy/50">
          Available times
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {TIMES.map((time, index) => (
            <div
              key={time}
              className={`rounded-xl border px-2 py-2.5 text-center font-opensans text-xs font-semibold ${
                index === 1
                  ? "border-teal bg-teal/10 text-teal"
                  : index === 4
                    ? "border-gray-100 bg-gray-50 text-gray-300 line-through"
                    : "border-gray-200 bg-white text-navy"
              }`}
            >
              {time}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-teal/30 bg-teal/5 px-4 py-3">
          <p className="flex items-center gap-2 font-montserrat text-sm font-bold text-teal">
            <Check className="h-4 w-4" />
            Service Appointment Confirmed.
          </p>
          <p className="mt-1 font-opensans text-xs text-gray-600">
            Wednesday, 9:30 AM — Brake Pad Replacement — Front
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
          <MessageSquare className="h-4 w-4 flex-shrink-0 text-navy/50" />
          <span className="font-opensans text-xs text-gray-500">
            Message the service facility about your appointment
          </span>
        </div>
      </div>
    </div>
  );
}
