"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, ChevronRight, Wrench, AlertCircle, Car, ChevronDown } from "lucide-react";
import { BookingStepIndicator } from "@/components/booking/BookingStepIndicator";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Service {
  id: number;
  name: string;
  category: string;
}
interface ServiceCategory {
  name: string;
  services: Service[];
}

// ─── Service category icons map ───────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  "Maintenance": "🔧",
  "Brakes": "🛑",
  "Tires": "🔄",
  "Engine": "⚙️",
  "Transmission": "🔩",
  "Electrical": "⚡",
  "Cooling System": "🌡️",
  "AC": "❄️",
  "Suspension": "🚗",
  "Exhaust": "💨",
  "Diagnosis": "🔍",
  "Starting and Charging": "🔋",
  "Fuel Delivery and Air Induction": "⛽",
  "Emission Testing": "🌿",
  "State Safety and Emissions Inspection": "📋",
  "Ignition System": "🔑",
};

const POPULAR_SERVICES = [
  { id: 305, name: "Spark Plug Replacement", category: "Maintenance" },
  { id: 310, name: "Tire Rotation", category: "Maintenance" },
  { id: 30, name: "Brake Pad & Rotor Replacement – Front", category: "Brakes" },
  { id: 28, name: "Brake Pad & Rotor Replacement – Rear", category: "Brakes" },
  { id: 277, name: "Radiator Replacement", category: "Cooling System" },
  { id: 259, name: "AC Compressor Replacement", category: "AC" },
  { id: 421, name: "Wheel Alignment", category: "Suspension" },
  { id: 312, name: "Transmission Fluid Change", category: "Transmission" },
];

const RADIUS_OPTIONS = [
  { value: "5", label: "5 miles" },
  { value: "10", label: "10 miles" },
  { value: "25", label: "25 miles" },
  { value: "50", label: "50 miles" },
  { value: "100", label: "100 miles" },
];

// Vehicle year options (current year back to 1990)
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
  { value: "", label: "Select Year" },
  ...Array.from({ length: currentYear - 1989 }, (_, i) => {
    const y = String(currentYear - i);
    return { value: y, label: y };
  }),
];

const MAKE_OPTIONS = [
  { value: "", label: "Select Make" },
  { value: "Acura", label: "Acura" },
  { value: "Audi", label: "Audi" },
  { value: "BMW", label: "BMW" },
  { value: "Buick", label: "Buick" },
  { value: "Cadillac", label: "Cadillac" },
  { value: "Chevrolet", label: "Chevrolet" },
  { value: "Chrysler", label: "Chrysler" },
  { value: "Dodge", label: "Dodge" },
  { value: "Ford", label: "Ford" },
  { value: "GMC", label: "GMC" },
  { value: "Honda", label: "Honda" },
  { value: "Hyundai", label: "Hyundai" },
  { value: "Infiniti", label: "Infiniti" },
  { value: "Jeep", label: "Jeep" },
  { value: "Kia", label: "Kia" },
  { value: "Lexus", label: "Lexus" },
  { value: "Lincoln", label: "Lincoln" },
  { value: "Mazda", label: "Mazda" },
  { value: "Mercedes-Benz", label: "Mercedes-Benz" },
  { value: "Mitsubishi", label: "Mitsubishi" },
  { value: "Nissan", label: "Nissan" },
  { value: "Ram", label: "Ram" },
  { value: "Subaru", label: "Subaru" },
  { value: "Tesla", label: "Tesla" },
  { value: "Toyota", label: "Toyota" },
  { value: "Volkswagen", label: "Volkswagen" },
  { value: "Volvo", label: "Volvo" },
  { value: "Other", label: "Other" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState("25");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Vehicle guided questions
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Validation
  const [zipError, setZipError] = useState("");
  const [serviceError, setServiceError] = useState("");

  // Pre-fill from URL params (from hero search box)
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    const zipParam = searchParams.get("zip");
    if (serviceParam) setSearchQuery(serviceParam);
    if (zipParam) setZipCode(zipParam);
  }, [searchParams]);

  // Load services on mount
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoadingServices(true);
        const res = await fetch("/api/openbay/services");
        if (!res.ok) throw new Error("Failed to load services");
        const data = await res.json();
        const list: Service[] = data.services || [];
        setServices(list);
        // Group by category
        const catMap: Record<string, Service[]> = {};
        list.forEach((s) => {
          const cat = s.category || "Other";
          if (!catMap[cat]) catMap[cat] = [];
          catMap[cat].push(s);
        });
        const sorted = Object.entries(catMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, svcs]) => ({ name, services: svcs }));
        setCategories(sorted);
      } catch (err) {
        setServicesError("Unable to load service catalog. Please try again.");
        console.error(err);
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("dsn_booking_flow");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.zipCode) setZipCode(parsed.zipCode);
        if (parsed.radius) setRadius(String(parsed.radius));
        if (parsed.selectedServiceId) setSelectedServiceId(parsed.selectedServiceId);
        if (parsed.selectedServiceName) setSelectedServiceName(parsed.selectedServiceName);
        if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
        if (parsed.vehicleYear) setVehicleYear(parsed.vehicleYear);
        if (parsed.vehicleMake) setVehicleMake(parsed.vehicleMake);
        if (parsed.vehicleModel) setVehicleModel(parsed.vehicleModel);
      }
    } catch {
      // ignore
    }
  }, []);

  const filteredServices = useCallback((): Service[] => {
    let list = services;
    if (activeCategory !== "All") {
      list = list.filter((s) => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 60);
  }, [services, activeCategory, searchQuery]);

  function selectService(service: Service) {
    setSelectedServiceId(service.id);
    setSelectedServiceName(service.name);
    setSelectedCategory(service.category);
    setServiceError("");
    // Show vehicle form after service selection
    setShowVehicleForm(true);
  }

  function handleContinue() {
    let valid = true;
    if (!zipCode.trim() || !/^\d{5}(-\d{4})?$/.test(zipCode.trim())) {
      setZipError("Please enter a valid 5-digit ZIP code.");
      valid = false;
    } else {
      setZipError("");
    }
    if (!selectedServiceId) {
      setServiceError("Please select a service to continue.");
      valid = false;
    } else {
      setServiceError("");
    }
    if (!valid) return;
    // Save to sessionStorage
    try {
      const existing = JSON.parse(sessionStorage.getItem("dsn_booking_flow") || "{}");
      sessionStorage.setItem(
        "dsn_booking_flow",
        JSON.stringify({
          ...existing,
          zipCode: zipCode.trim(),
          radius: Number(radius),
          selectedServiceId,
          selectedServiceName,
          selectedCategory,
          vehicleYear,
          vehicleMake,
          vehicleModel,
          currentStep: 2,
        })
      );
    } catch {
      // ignore
    }
    router.push("/book/shops");
  }

  const displayed = filteredServices();

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingStepIndicator currentStep={1} />
      <div className="section-container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="heading-lg text-navy mb-2">What do you need?</h1>
            <p className="text-gray-500 font-opensans">
              Tell us your location and the service you need, and we&apos;ll find certified shops near you.
            </p>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-xl shadow-card p-6 mb-6">
            <h2 className="font-montserrat font-semibold text-navy text-base mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal" />
              Your Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="ZIP Code"
                placeholder="e.g. 10001"
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value);
                  if (zipError) setZipError("");
                }}
                error={zipError}
                maxLength={10}
                required
              />
              <Select
                label="Search Radius"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                options={RADIUS_OPTIONS}
              />
            </div>
          </div>

          {/* Vehicle Info Card — Guided Questions */}
          <div className="bg-white rounded-xl shadow-card p-6 mb-6">
            <button
              onClick={() => setShowVehicleForm(!showVehicleForm)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="font-montserrat font-semibold text-navy text-base flex items-center gap-2">
                <Car className="w-4 h-4 text-teal" />
                Your Vehicle
                {vehicleYear && vehicleMake && (
                  <span className="font-opensans text-teal text-sm font-normal ml-2">
                    — {vehicleYear} {vehicleMake} {vehicleModel}
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                {!vehicleYear && (
                  <span className="font-opensans text-gray-400 text-xs">
                    Optional — helps narrow results
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-gray-400 transition-transform duration-200",
                    showVehicleForm && "rotate-180"
                  )}
                />
              </div>
            </button>
            {showVehicleForm && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Year"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                  options={YEAR_OPTIONS}
                />
                <Select
                  label="Make"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  options={MAKE_OPTIONS}
                />
                <Input
                  label="Model"
                  placeholder="e.g. Camry, F-150"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Service Selection Card */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="font-montserrat font-semibold text-navy text-base mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-teal" />
              Select a Service
            </h2>
            {/* Selected service badge */}
            {selectedServiceId && (
              <div className="mb-4 flex items-center gap-2 bg-teal/10 border border-teal/20 rounded-lg px-4 py-2.5">
                <div className="w-2 h-2 rounded-full bg-teal flex-shrink-0" />
                <span className="font-opensans text-sm text-teal font-semibold">
                  {selectedServiceName}
                </span>
                <span className="text-gray-400 text-xs ml-1">({selectedCategory})</span>
                <button
                  onClick={() => {
                    setSelectedServiceId(null);
                    setSelectedServiceName("");
                    setSelectedCategory("");
                  }}
                  className="ml-auto text-gray-400 hover:text-gray-600 text-xs"
                >
                  Change
                </button>
              </div>
            )}
            {serviceError && (
              <div className="mb-4 flex items-center gap-2 text-red-500 text-sm font-opensans">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {serviceError}
              </div>
            )}
            {/* Popular services quick-pick */}
            {!selectedServiceId && (
              <div className="mb-5">
                <p className="font-montserrat font-semibold text-gray-500 text-xs uppercase tracking-wide mb-3">
                  Popular Services
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SERVICES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => selectService(s)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-teal/40 hover:bg-teal/5 transition-all text-sm font-opensans text-gray-700"
                    >
                      <span>{CATEGORY_ICONS[s.category] || "🔧"}</span>
                      <div className="font-semibold text-xs leading-tight">{s.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search services (e.g. oil change, brakes, alignment...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-opensans text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              />
            </div>
            {/* Category tabs */}
            {!searchQuery && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                <button
                  onClick={() => setActiveCategory("All")}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-montserrat font-semibold transition-all",
                    activeCategory === "All"
                      ? "bg-navy text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={cn(
                      "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-montserrat font-semibold transition-all whitespace-nowrap",
                      activeCategory === cat.name
                        ? "bg-navy text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {CATEGORY_ICONS[cat.name] || "🔧"} {cat.name}
                  </button>
                ))}
              </div>
            )}
            {/* Services grid */}
            {loadingServices ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 font-opensans">Loading services…</p>
                </div>
              </div>
            ) : servicesError ? (
              <div className="flex items-center gap-3 py-8 text-red-500">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-opensans">{servicesError}</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="py-8 text-center text-gray-400 font-opensans text-sm">
                No services found for &ldquo;{searchQuery}&rdquo;. Try a different search term.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                {displayed.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => selectService(service)}
                    className={cn(
                      "text-left p-3 rounded-lg border text-sm font-opensans transition-all duration-150",
                      selectedServiceId === service.id
                        ? "border-teal bg-teal/5 text-teal font-semibold"
                        : "border-gray-100 hover:border-teal/40 hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className="font-semibold text-xs leading-snug">{service.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{service.category}</div>
                  </button>
                ))}
              </div>
            )}
            {!loadingServices && !servicesError && services.length > 60 && (
              <p className="text-xs text-gray-400 mt-3 font-opensans">
                Showing {displayed.length} of {services.length} services. Use search to narrow results.
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              Find Shops Near Me
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
