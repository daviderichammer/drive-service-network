"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, ChevronRight, ChevronLeft, Car, Wrench, CheckCircle, AlertCircle, Loader2, Star, Phone, Navigation } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Service {
  id: number;
  name: string;
  category: string;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  distance?: number;
  services?: string[];
}

type Step = "service" | "vehicle" | "followup" | "results";

interface VehicleInfo {
  year: string;
  make: string;
  model: string;
  mileage: string;
}

interface FollowUpAnswers {
  symptoms: string;
  lastServiced: string;
  urgency: string;
  additionalNotes: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => String(CURRENT_YEAR - i));

const COMMON_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler",
  "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia",
  "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Mitsubishi", "Nissan",
  "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

const URGENCY_OPTIONS = [
  { value: "asap", label: "As soon as possible" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "flexible", label: "I'm flexible" },
];

const LAST_SERVICED_OPTIONS = [
  { value: "less_3months", label: "Less than 3 months ago" },
  { value: "3_6months", label: "3–6 months ago" },
  { value: "6_12months", label: "6–12 months ago" },
  { value: "over_year", label: "Over a year ago" },
  { value: "unknown", label: "I'm not sure" },
];

const STEP_LABELS: Record<Step, string> = {
  service: "Service",
  vehicle: "Vehicle",
  followup: "Details",
  results: "Quotes",
};

const STEPS: Step[] = ["service", "vehicle", "followup", "results"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDistance(d?: number) {
  if (d === undefined || d === null) return null;
  if (d < 1) return `${(d * 5280).toFixed(0)} ft`;
  return `${d.toFixed(1)} mi`;
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((step, idx) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-montserrat font-bold transition-all",
                idx < currentIdx
                  ? "bg-teal text-white"
                  : idx === currentIdx
                  ? "bg-navy text-white ring-2 ring-navy ring-offset-2"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              {idx < currentIdx ? <CheckCircle className="w-4 h-4" /> : idx + 1}
            </div>
            <span
              className={cn(
                "text-xs mt-1 font-opensans hidden sm:block",
                idx === currentIdx ? "text-navy font-semibold" : "text-gray-400"
              )}
            >
              {STEP_LABELS[step]}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-8 sm:w-12 mx-1 mb-4 transition-all",
                idx < currentIdx ? "bg-teal" : "bg-gray-200"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Step 1: Service Selection ────────────────────────────────────────────────

function ServiceStep({
  zipCode,
  setZipCode,
  serviceQuery,
  setServiceQuery,
  services,
  loadingServices,
  servicesError,
  selectedService,
  onSelectService,
  onNext,
}: {
  zipCode: string;
  setZipCode: (v: string) => void;
  serviceQuery: string;
  setServiceQuery: (v: string) => void;
  services: Service[];
  loadingServices: boolean;
  servicesError: string | null;
  selectedService: Service | null;
  onSelectService: (s: Service) => void;
  onNext: () => void;
}) {
  const [zipError, setZipError] = useState("");

  const categories = Array.from(new Set(services.map((s) => s.category))).sort();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = services.filter((s) => {
    const matchesQuery = serviceQuery
      ? s.name.toLowerCase().includes(serviceQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(serviceQuery.toLowerCase())
      : true;
    const matchesCategory = activeCategory ? s.category === activeCategory : true;
    return matchesQuery && matchesCategory;
  });

  const displayed = filtered.slice(0, 60);

  function handleNext() {
    if (!zipCode || zipCode.length < 5) {
      setZipError("Please enter a valid ZIP code");
      return;
    }
    if (!selectedService) return;
    setZipError("");
    onNext();
  }

  return (
    <div>
      <h3 className="font-montserrat font-bold text-navy text-lg mb-1">
        What service do you need?
      </h3>
      <p className="text-sm text-gray-500 font-opensans mb-4">
        Search or browse services, then enter your ZIP code to get quotes from nearby shops.
      </p>

      {/* ZIP Code */}
      <div className="mb-4">
        <label className="block text-xs font-montserrat font-semibold text-navy mb-1.5 uppercase tracking-wide">
          Your ZIP Code <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={zipCode}
            onChange={(e) => { setZipCode(e.target.value); setZipError(""); }}
            placeholder="e.g. 33101"
            maxLength={10}
            className={cn(
              "w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm font-opensans text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent",
              zipError ? "border-red-400" : "border-gray-200"
            )}
          />
        </div>
        {zipError && <p className="text-xs text-red-500 mt-1 font-opensans">{zipError}</p>}
      </div>

      {/* Service Search */}
      <div className="mb-3">
        <label className="block text-xs font-montserrat font-semibold text-navy mb-1.5 uppercase tracking-wide">
          Service Needed <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={serviceQuery}
            onChange={(e) => { setServiceQuery(e.target.value); setActiveCategory(null); }}
            placeholder="Oil change, brakes, tires, AC repair…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-opensans text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Pills */}
      {!serviceQuery && categories.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-montserrat font-semibold transition-all",
              !activeCategory ? "bg-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All
          </button>
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-montserrat font-semibold transition-all",
                activeCategory === cat ? "bg-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Services Grid */}
      {loadingServices ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-teal" />
          <span className="ml-2 text-sm text-gray-500 font-opensans">Loading services…</span>
        </div>
      ) : servicesError ? (
        <div className="flex items-center gap-2 py-4 text-red-500">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-opensans">{servicesError}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1 mb-4">
          {displayed.map((service) => (
            <button
              key={service.id}
              onClick={() => onSelectService(service)}
              className={cn(
                "text-left p-2.5 rounded-lg border text-xs font-opensans transition-all duration-150",
                selectedService?.id === service.id
                  ? "border-teal bg-teal/5 text-teal font-semibold"
                  : "border-gray-100 hover:border-teal/40 hover:bg-gray-50 text-gray-700"
              )}
            >
              <div className="font-semibold leading-snug">{service.name}</div>
              <div className="text-gray-400 mt-0.5 text-xs">{service.category}</div>
            </button>
          ))}
          {displayed.length === 0 && (
            <div className="col-span-2 py-6 text-center text-gray-400 font-opensans text-sm">
              No services found for &ldquo;{serviceQuery}&rdquo;. Try a different term.
            </div>
          )}
        </div>
      )}

      {/* Selected Service Badge */}
      {selectedService && (
        <div className="flex items-center gap-2 bg-teal/10 border border-teal/20 rounded-lg px-3 py-2 mb-4">
          <CheckCircle className="w-4 h-4 text-teal flex-shrink-0" />
          <span className="text-sm font-opensans text-teal font-semibold">
            {selectedService.name}
          </span>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!selectedService || !zipCode}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-montserrat font-bold text-sm transition-all",
          selectedService && zipCode
            ? "bg-navy text-white hover:bg-navy/90"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
      >
        Next: Enter Vehicle Info
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Step 2: Vehicle Info ─────────────────────────────────────────────────────

function VehicleStep({
  vehicle,
  setVehicle,
  onNext,
  onBack,
}: {
  vehicle: VehicleInfo;
  setVehicle: (v: VehicleInfo) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Partial<VehicleInfo>>({});

  const COMMON_MODELS: Record<string, string[]> = {
    Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Tundra", "Prius", "4Runner", "Sienna", "Avalon"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "HR-V", "Ridgeline", "Passport", "Fit"],
    Ford: ["F-150", "Mustang", "Explorer", "Escape", "Edge", "Bronco", "Ranger", "Expedition", "Fusion"],
    Chevrolet: ["Silverado", "Equinox", "Malibu", "Traverse", "Tahoe", "Suburban", "Colorado", "Camaro", "Blazer"],
    Nissan: ["Altima", "Sentra", "Rogue", "Pathfinder", "Murano", "Frontier", "Titan", "Maxima", "Kicks"],
    BMW: ["3 Series", "5 Series", "7 Series", "X3", "X5", "X7", "M3", "M5", "4 Series"],
    "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS", "A-Class", "CLA"],
    Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Kona", "Palisade", "Ioniq 5"],
    Kia: ["Optima", "Sorento", "Sportage", "Telluride", "Soul", "Stinger", "EV6"],
    Jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Gladiator", "Renegade"],
    Dodge: ["Charger", "Challenger", "Durango", "Ram 1500", "Journey"],
    Ram: ["1500", "2500", "3500", "ProMaster"],
    GMC: ["Sierra", "Terrain", "Acadia", "Yukon", "Canyon", "Envoy"],
    Subaru: ["Outback", "Forester", "Impreza", "Legacy", "Crosstrek", "Ascent", "WRX"],
    Volkswagen: ["Jetta", "Passat", "Tiguan", "Atlas", "Golf", "ID.4"],
    Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7", "Q8", "e-tron"],
    Lexus: ["ES", "IS", "RX", "NX", "GX", "LX", "UX"],
    Acura: ["TLX", "MDX", "RDX", "ILX"],
    Mazda: ["Mazda3", "Mazda6", "CX-5", "CX-9", "MX-5 Miata"],
    Buick: ["Enclave", "Encore", "Envision", "LaCrosse"],
    Cadillac: ["Escalade", "XT5", "XT6", "CT5", "CT4"],
    Chrysler: ["300", "Pacifica", "Voyager"],
    Lincoln: ["Navigator", "Aviator", "Corsair", "Nautilus"],
    Infiniti: ["Q50", "Q60", "QX50", "QX60", "QX80"],
    Mitsubishi: ["Outlander", "Eclipse Cross", "Galant", "Lancer"],
    Volvo: ["XC40", "XC60", "XC90", "S60", "S90", "V60"],
    Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
  };

  const models = vehicle.make ? (COMMON_MODELS[vehicle.make] || []) : [];

  function validate() {
    const e: Partial<VehicleInfo> = {};
    if (!vehicle.year) e.year = "Required";
    if (!vehicle.make) e.make = "Required";
    if (!vehicle.model) e.model = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  return (
    <div>
      <h3 className="font-montserrat font-bold text-navy text-lg mb-1">
        Tell us about your vehicle
      </h3>
      <p className="text-sm text-gray-500 font-opensans mb-4">
        Vehicle details help shops provide accurate pricing for your service.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Year */}
        <div>
          <label className="block text-xs font-montserrat font-semibold text-navy mb-1.5 uppercase tracking-wide">
            Year <span className="text-red-500">*</span>
          </label>
          <select
            value={vehicle.year}
            onChange={(e) => setVehicle({ ...vehicle, year: e.target.value, model: "" })}
            className={cn(
              "w-full px-3 py-2.5 border rounded-lg text-sm font-opensans text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent appearance-none bg-white",
              errors.year ? "border-red-400" : "border-gray-200"
            )}
          >
            <option value="">Select year</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
        </div>

        {/* Make */}
        <div>
          <label className="block text-xs font-montserrat font-semibold text-navy mb-1.5 uppercase tracking-wide">
            Make <span className="text-red-500">*</span>
          </label>
          <select
            value={vehicle.make}
            onChange={(e) => setVehicle({ ...vehicle, make: e.target.value, model: "" })}
            className={cn(
              "w-full px-3 py-2.5 border rounded-lg text-sm font-opensans text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent appearance-none bg-white",
              errors.make ? "border-red-400" : "border-gray-200"
            )}
          >
            <option value="">Select make</option>
            {COMMON_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {errors.make && <p className="text-xs text-red-500 mt-1">{errors.make}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Model */}
        <div>
          <label className="block text-xs font-montserrat font-semibold text-navy mb-1.5 uppercase tracking-wide">
            Model <span className="text-red-500">*</span>
          </label>
          {models.length > 0 ? (
            <select
              value={vehicle.model}
              onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
              className={cn(
                "w-full px-3 py-2.5 border rounded-lg text-sm font-opensans text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent appearance-none bg-white",
                errors.model ? "border-red-400" : "border-gray-200"
              )}
            >
              <option value="">Select model</option>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          ) : (
            <input
              type="text"
              value={vehicle.model}
              onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
              placeholder="Enter model"
              className={cn(
                "w-full px-3 py-2.5 border rounded-lg text-sm font-opensans text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent",
                errors.model ? "border-red-400" : "border-gray-200"
              )}
            />
          )}
          {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-xs font-montserrat font-semibold text-navy mb-1.5 uppercase tracking-wide">
            Mileage <span className="text-gray-400 font-normal normal-case">(optional)</span>
          </label>
          <input
            type="number"
            value={vehicle.mileage}
            onChange={(e) => setVehicle({ ...vehicle, mileage: e.target.value })}
            placeholder="e.g. 45000"
            min={0}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-opensans text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-3 rounded-lg border border-gray-200 text-gray-600 font-montserrat font-semibold text-sm hover:bg-gray-50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-navy text-white font-montserrat font-bold text-sm hover:bg-navy/90 transition-all"
        >
          Next: Service Details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Follow-Up Questions ──────────────────────────────────────────────

function FollowUpStep({
  selectedService,
  answers,
  setAnswers,
  onNext,
  onBack,
  loading,
}: {
  selectedService: Service | null;
  answers: FollowUpAnswers;
  setAnswers: (a: FollowUpAnswers) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <div>
      <h3 className="font-montserrat font-bold text-navy text-lg mb-1">
        A few more details
      </h3>
      <p className="text-sm text-gray-500 font-opensans mb-4">
        Help shops understand your situation so they can give you the most accurate quote for{" "}
        <span className="font-semibold text-navy">{selectedService?.name}</span>.
      </p>

      {/* Symptoms */}
      <div className="mb-3">
        <label className="block text-xs font-montserrat font-semibold text-navy mb-1.5 uppercase tracking-wide">
          Describe the issue or symptoms
        </label>
        <textarea
          value={answers.symptoms}
          onChange={(e) => setAnswers({ ...answers, symptoms: e.target.value })}
          placeholder={`e.g. "Hearing a grinding noise when braking" or "Just need routine maintenance"`}
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-opensans text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
        />
      </div>

      {/* Last Serviced */}
      <div className="mb-3">
        <label className="block text-xs font-montserrat font-semibold text-navy mb-1.5 uppercase tracking-wide">
          When was this last serviced?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LAST_SERVICED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAnswers({ ...answers, lastServiced: opt.value })}
              className={cn(
                "px-3 py-2 rounded-lg border text-xs font-opensans text-left transition-all",
                answers.lastServiced === opt.value
                  ? "border-teal bg-teal/5 text-teal font-semibold"
                  : "border-gray-200 text-gray-600 hover:border-teal/40 hover:bg-gray-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency */}
      <div className="mb-4">
        <label className="block text-xs font-montserrat font-semibold text-navy mb-1.5 uppercase tracking-wide">
          How soon do you need this done?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {URGENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAnswers({ ...answers, urgency: opt.value })}
              className={cn(
                "px-3 py-2.5 rounded-lg border text-xs font-opensans text-left transition-all",
                answers.urgency === opt.value
                  ? "border-navy bg-navy/5 text-navy font-semibold"
                  : "border-gray-200 text-gray-600 hover:border-navy/30 hover:bg-gray-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="mb-4">
        <label className="block text-xs font-montserrat font-semibold text-navy mb-1.5 uppercase tracking-wide">
          Anything else we should know?{" "}
          <span className="text-gray-400 font-normal normal-case">(optional)</span>
        </label>
        <input
          type="text"
          value={answers.additionalNotes}
          onChange={(e) => setAnswers({ ...answers, additionalNotes: e.target.value })}
          placeholder="e.g. prefer morning appointments, have a coupon, etc."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-opensans text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-3 rounded-lg border border-gray-200 text-gray-600 font-montserrat font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-gold text-navy font-montserrat font-bold text-sm hover:bg-yellow-400 transition-all disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Finding Shops…
            </>
          ) : (
            <>
              Get My Quotes
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Results ──────────────────────────────────────────────────────────

function ResultsStep({
  shops,
  loadingShops,
  shopsError,
  selectedService,
  vehicle,
  zipCode,
  onBack,
  onReset,
}: {
  shops: Shop[];
  loadingShops: boolean;
  shopsError: string | null;
  selectedService: Service | null;
  vehicle: VehicleInfo;
  zipCode: string;
  onBack: () => void;
  onReset: () => void;
}) {
  function buildBookingUrl(shop: Shop) {
    const params = new URLSearchParams({
      zip: zipCode,
      serviceId: String(selectedService?.id || ""),
      serviceName: selectedService?.name || "",
      shopId: shop.id,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      ...(vehicle.mileage ? { mileage: vehicle.mileage } : {}),
    });
    return `/book/appointment?${params.toString()}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-montserrat font-bold text-navy text-lg">
          Shops Near You
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-teal font-opensans font-semibold hover:underline"
        >
          Start Over
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 bg-teal/10 text-teal text-xs font-opensans font-semibold px-2.5 py-1 rounded-full">
          <Wrench className="w-3 h-3" />
          {selectedService?.name}
        </span>
        <span className="inline-flex items-center gap-1 bg-navy/10 text-navy text-xs font-opensans font-semibold px-2.5 py-1 rounded-full">
          <Car className="w-3 h-3" />
          {vehicle.year} {vehicle.make} {vehicle.model}
        </span>
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-opensans font-semibold px-2.5 py-1 rounded-full">
          <MapPin className="w-3 h-3" />
          {zipCode}
        </span>
      </div>

      {loadingShops ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal" />
          <p className="text-sm text-gray-500 font-opensans">Finding shops near you…</p>
        </div>
      ) : shopsError ? (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-montserrat font-semibold text-red-700 text-sm">Could not load shops</p>
            <p className="text-red-600 text-sm font-opensans mt-0.5">{shopsError}</p>
          </div>
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 font-opensans text-sm mb-3">
            No shops found near {zipCode}. Try expanding your search area.
          </p>
          <button
            onClick={onBack}
            className="text-teal font-semibold text-sm font-opensans hover:underline"
          >
            ← Adjust your search
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="border border-gray-200 rounded-xl p-3 hover:border-teal/40 hover:shadow-card transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-montserrat font-bold text-navy text-sm leading-tight truncate">
                    {shop.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-opensans mt-0.5">
                    {shop.address}{shop.city ? `, ${shop.city}` : ""}{shop.state ? `, ${shop.state}` : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {shop.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-500 font-opensans font-semibold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {shop.rating.toFixed(1)}
                        {shop.reviewCount && (
                          <span className="text-gray-400 font-normal ml-0.5">({shop.reviewCount})</span>
                        )}
                      </span>
                    )}
                    {shop.distance !== undefined && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-500 font-opensans">
                        <Navigation className="w-3 h-3" />
                        {formatDistance(shop.distance)}
                      </span>
                    )}
                    {shop.phone && (
                      <a
                        href={`tel:${shop.phone}`}
                        className="flex items-center gap-0.5 text-xs text-teal font-opensans hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {shop.phone}
                      </a>
                    )}
                  </div>
                </div>
                <Link
                  href={buildBookingUrl(shop)}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-navy text-white rounded-lg text-xs font-montserrat font-bold hover:bg-navy/90 transition-all whitespace-nowrap"
                >
                  Book Now
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loadingShops && shops.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link
            href={`/book?zip=${zipCode}&serviceId=${selectedService?.id}&serviceName=${encodeURIComponent(selectedService?.name || "")}&year=${vehicle.year}&make=${vehicle.make}&model=${vehicle.model}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-navy text-navy font-montserrat font-bold text-sm hover:bg-navy hover:text-white transition-all"
          >
            View All Shops &amp; Book
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <div className="mt-3 flex justify-start">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 font-opensans text-sm hover:text-navy transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to details
        </button>
      </div>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export default function InstantQuoteWidget() {
  const [step, setStep] = useState<Step>("service");
  const [zipCode, setZipCode] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [vehicle, setVehicle] = useState<VehicleInfo>({ year: "", make: "", model: "", mileage: "" });
  const [answers, setAnswers] = useState<FollowUpAnswers>({ symptoms: "", lastServiced: "", urgency: "", additionalNotes: "" });
  const [shops, setShops] = useState<Shop[]>([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [shopsError, setShopsError] = useState<string | null>(null);

  // Load services on mount
  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch("/api/openbay/services");
        if (!res.ok) throw new Error("Failed to load services");
        const data = await res.json();
        setServices(data.services || []);
      } catch {
        setServicesError("Could not load services. Please try again.");
      } finally {
        setLoadingServices(false);
      }
    }
    loadServices();
  }, []);

  async function fetchShops() {
    setLoadingShops(true);
    setShopsError(null);
    try {
      const params = new URLSearchParams({
        zip: zipCode,
        radius: "25",
        serviceType: "appointment",
        ...(vehicle.make ? { make: vehicle.make } : {}),
        ...(selectedService ? { serviceId: String(selectedService.id) } : {}),
      });
      const res = await fetch(`/api/openbay/locations?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load shops");
      const data = await res.json();
      setShops(data.locations || []);
    } catch {
      setShopsError("Could not load shops near you. Please try again.");
    } finally {
      setLoadingShops(false);
    }
  }

  function handleSelectService(s: Service) {
    setSelectedService(s);
    setServiceQuery(s.name);
  }

  function handleStep3Next() {
    setStep("results");
    fetchShops();
  }

  function handleReset() {
    setStep("service");
    setZipCode("");
    setServiceQuery("");
    setSelectedService(null);
    setVehicle({ year: "", make: "", model: "", mileage: "" });
    setAnswers({ symptoms: "", lastServiced: "", urgency: "", additionalNotes: "" });
    setShops([]);
    setShopsError(null);
  }

  return (
    <div className="bg-white rounded-2xl shadow-hero border border-gray-100 p-6 w-full max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center flex-shrink-0">
          <Wrench className="w-4 h-4 text-navy" />
        </div>
        <div>
          <h2 className="font-montserrat font-black text-navy text-base leading-tight">
            Get an Instant Quote
          </h2>
          <p className="text-xs text-gray-500 font-opensans">Compare prices from local shops</p>
        </div>
      </div>

      <StepIndicator current={step} />

      {step === "service" && (
        <ServiceStep
          zipCode={zipCode}
          setZipCode={setZipCode}
          serviceQuery={serviceQuery}
          setServiceQuery={setServiceQuery}
          services={services}
          loadingServices={loadingServices}
          servicesError={servicesError}
          selectedService={selectedService}
          onSelectService={handleSelectService}
          onNext={() => setStep("vehicle")}
        />
      )}

      {step === "vehicle" && (
        <VehicleStep
          vehicle={vehicle}
          setVehicle={setVehicle}
          onNext={() => setStep("followup")}
          onBack={() => setStep("service")}
        />
      )}

      {step === "followup" && (
        <FollowUpStep
          selectedService={selectedService}
          answers={answers}
          setAnswers={setAnswers}
          onNext={handleStep3Next}
          onBack={() => setStep("vehicle")}
          loading={loadingShops}
        />
      )}

      {step === "results" && (
        <ResultsStep
          shops={shops}
          loadingShops={loadingShops}
          shopsError={shopsError}
          selectedService={selectedService}
          vehicle={vehicle}
          zipCode={zipCode}
          onBack={() => setStep("followup")}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
