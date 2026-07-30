"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  MapPin,
  Phone,
} from "lucide-react";
import { BookingStepIndicator } from "@/components/booking/BookingStepIndicator";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Timeslot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  datetime?: string;
}

interface TimeslotGroup {
  date: string;
  displayDate: string;
  slots: Timeslot[];
}

interface BookingState {
  zipCode: string;
  selectedServiceId: number;
  selectedServiceName: string;
  selectedCategory: string;
  selectedShopId: string;
  selectedShopName: string;
  selectedShopAddress: string;
  selectedShopCity: string;
  selectedShopState: string;
  selectedShopPhone: string;
  selectedShopRating: number | null;
  vehicle?: { year: string; make: string; model: string; mileage?: string };
  firstName?: string;
  lastName?: string;
  email?: string;
  notes?: string;
  selectedTimeslotId?: string;
  selectedTimeslotDate?: string;
  selectedTimeslotTime?: string;
}

// ─── Vehicle year/make/model data ─────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => String(CURRENT_YEAR - i));

const MAKES = [
  "Acura", "Alfa Romeo", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet",
  "Chrysler", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda",
  "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus",
  "Lincoln", "Maserati", "Mazda", "Mercedes-Benz", "MINI", "Mitsubishi",
  "Nissan", "Porsche", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDisplayDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function groupTimeslotsByDate(slots: Timeslot[]): TimeslotGroup[] {
  const map: Record<string, Timeslot[]> = {};
  slots.forEach((slot) => {
    const date = slot.date || (slot.datetime ? slot.datetime.split("T")[0] : "");
    if (!date) return;
    if (!map[date]) map[date] = [];
    map[date].push(slot);
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, slotList]) => ({
      date,
      displayDate: formatDisplayDate(date),
      slots: slotList.sort((a, b) => a.time.localeCompare(b.time)),
    }));
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppointmentPage() {
  const router = useRouter();

  const [bookingState, setBookingState] = useState<BookingState | null>(null);

  // Vehicle form
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleMileage, setVehicleMileage] = useState("");

  // User info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Timeslots
  const [timeslotGroups, setTimeslotGroups] = useState<TimeslotGroup[]>([]);
  const [selectedTimeslotId, setSelectedTimeslotId] = useState("");
  const [selectedTimeslotDate, setSelectedTimeslotDate] = useState("");
  const [selectedTimeslotTime, setSelectedTimeslotTime] = useState("");
  const [activeDate, setActiveDate] = useState("");
  const [loadingTimeslots, setLoadingTimeslots] = useState(false);
  const [timeslotsError, setTimeslotsError] = useState<string | null>(null);

  // Booking
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load state from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("dsn_booking_flow");
      if (!stored) { router.replace("/book"); return; }
      const parsed: BookingState = JSON.parse(stored);
      if (!parsed.selectedShopId || !parsed.selectedServiceId) {
        router.replace("/book");
        return;
      }
      setBookingState(parsed);

      // Pre-fill from saved state
      if (parsed.vehicle) {
        setVehicleYear(parsed.vehicle.year || "");
        setVehicleMake(parsed.vehicle.make || "");
        setVehicleModel(parsed.vehicle.model || "");
        setVehicleMileage(parsed.vehicle.mileage || "");
      }
      if (parsed.firstName) setFirstName(parsed.firstName);
      if (parsed.lastName) setLastName(parsed.lastName);
      if (parsed.email) setEmail(parsed.email);
      if (parsed.notes) setNotes(parsed.notes);
      if (parsed.selectedTimeslotId) setSelectedTimeslotId(parsed.selectedTimeslotId);
      if (parsed.selectedTimeslotDate) setSelectedTimeslotDate(parsed.selectedTimeslotDate);
      if (parsed.selectedTimeslotTime) setSelectedTimeslotTime(parsed.selectedTimeslotTime);
    } catch {
      router.replace("/book");
    }
  }, [router]);

  const fetchTimeslots = useCallback(async (state: BookingState) => {
    setLoadingTimeslots(true);
    setTimeslotsError(null);
    try {
      const res = await fetch("/api/openbay/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: state.selectedShopId,
          serviceId: state.selectedServiceId,
          numberOfDays: 14,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load timeslots");
      const slots: Timeslot[] = data.timeslots || [];
      const groups = groupTimeslotsByDate(slots);
      setTimeslotGroups(groups);
      if (groups.length > 0) setActiveDate(groups[0].date);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load available times.";
      setTimeslotsError(msg);
    } finally {
      setLoadingTimeslots(false);
    }
  }, []);

  useEffect(() => {
    if (bookingState) {
      fetchTimeslots(bookingState);
    }
  }, [bookingState, fetchTimeslots]);

  function selectTimeslot(slot: Timeslot, date: string) {
    setSelectedTimeslotId(slot.id);
    setSelectedTimeslotDate(date);
    setSelectedTimeslotTime(slot.time);
    if (errors.timeslot) setErrors((e) => ({ ...e, timeslot: "" }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!vehicleYear) newErrors.vehicleYear = "Year is required";
    if (!vehicleMake) newErrors.vehicleMake = "Make is required";
    if (!vehicleModel.trim()) newErrors.vehicleModel = "Model is required";
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Valid email is required";
    if (!selectedTimeslotId) newErrors.timeslot = "Please select an appointment time";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleBookAppointment() {
    if (!validate() || !bookingState) return;
    setBooking(true);
    setBookingError(null);

    try {
      // Step 1: Create Openbay user
      const userRes = await fetch("/api/openbay/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          zipCode: bookingState.zipCode,
        }),
      });
      const userData = await userRes.json();
      if (!userRes.ok) {
        throw new Error(userData.message || "Failed to create user account");
      }
      const userId = userData.user?.id || userData.user?.user_id || userData.userId;
      if (!userId) throw new Error("User creation failed — no user ID returned");

      // Step 2: Book appointment
      const apptRes = await fetch("/api/openbay/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: String(userId),
          shopId: bookingState.selectedShopId,
          serviceId: bookingState.selectedServiceId,
          timeslotId: selectedTimeslotId,
          scheduledTime: selectedTimeslotId, // proposed_time key from Openbay
          vehicleYear: vehicleYear,
          vehicleMake: vehicleMake,
          vehicleModel: vehicleModel,
          vehicleMileage: vehicleMileage || undefined,
          notes: notes.trim() || undefined,
          // Additional context for member dashboard record
          serviceName: bookingState.selectedServiceName,
          shopName: bookingState.selectedShopName,
          shopAddress: bookingState.selectedShopAddress,
          shopPhone: bookingState.selectedShopPhone || undefined,
          shopZipCode: bookingState.zipCode,
          scheduledDate: selectedTimeslotDate || undefined,
        }),
      });
      const apptData = await apptRes.json();
      if (!apptRes.ok) {
        throw new Error(apptData.message || "Failed to book appointment");
      }

      // Save confirmation data
      const confirmationData = {
        ...bookingState,
        vehicle: { year: vehicleYear, make: vehicleMake, model: vehicleModel, mileage: vehicleMileage },
        firstName,
        lastName,
        email,
        notes,
        selectedTimeslotId,
        selectedTimeslotDate,
        selectedTimeslotTime,
        openbayUserId: String(userId),
        appointment: apptData.appointment,
        currentStep: 3,
        bookingComplete: true,
      };
      sessionStorage.setItem("dsn_booking_flow", JSON.stringify(confirmationData));
      sessionStorage.setItem("dsn_booking_confirmation", JSON.stringify(confirmationData));

      router.push("/book/confirmation");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Booking failed. Please try again.";
      setBookingError(msg);
    } finally {
      setBooking(false);
    }
  }

  if (!bookingState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeGroup = timeslotGroups.find((g) => g.date === activeDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingStepIndicator currentStep={3} />

      <div className="section-container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="heading-lg text-navy mb-1">Book your appointment</h1>
              <p className="text-gray-500 font-opensans text-sm">
                Complete your vehicle info and pick a time that works for you.
              </p>
            </div>
            <button
              onClick={() => router.push("/book/shops")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy font-opensans transition-colors mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Shop summary card */}
          <div className="bg-navy rounded-xl p-5 mb-6 text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-montserrat font-bold text-white text-base leading-tight mb-0.5">
                  {bookingState.selectedShopName}
                </div>
                <div className="text-white/70 text-sm font-opensans">
                  {bookingState.selectedShopAddress}, {bookingState.selectedShopCity},{" "}
                  {bookingState.selectedShopState}
                </div>
                {bookingState.selectedShopPhone && (
                  <div className="flex items-center gap-1 text-white/60 text-sm font-opensans mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                    {bookingState.selectedShopPhone}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <div className="inline-flex items-center gap-1.5 bg-teal/20 border border-teal/30 rounded-full px-3 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                  <span className="text-teal text-xs font-opensans font-semibold">
                    {bookingState.selectedServiceName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column: Vehicle + User info */}
            <div className="space-y-6">
              {/* Vehicle Info */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="font-montserrat font-semibold text-navy text-base mb-4 flex items-center gap-2">
                  <Car className="w-4 h-4 text-teal" />
                  Vehicle Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-montserrat font-semibold text-navy mb-1.5">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={vehicleYear}
                        onChange={(e) => {
                          setVehicleYear(e.target.value);
                          if (errors.vehicleYear) setErrors((er) => ({ ...er, vehicleYear: "" }));
                        }}
                        className={cn(
                          "w-full px-3 py-2.5 border rounded-lg text-navy font-opensans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent appearance-none",
                          errors.vehicleYear ? "border-red-400" : "border-gray-200"
                        )}
                      >
                        <option value="">Year</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      {errors.vehicleYear && (
                        <p className="mt-1 text-xs text-red-500">{errors.vehicleYear}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-montserrat font-semibold text-navy mb-1.5">
                        Make <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={vehicleMake}
                        onChange={(e) => {
                          setVehicleMake(e.target.value);
                          if (errors.vehicleMake) setErrors((er) => ({ ...er, vehicleMake: "" }));
                        }}
                        className={cn(
                          "w-full px-3 py-2.5 border rounded-lg text-navy font-opensans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent appearance-none",
                          errors.vehicleMake ? "border-red-400" : "border-gray-200"
                        )}
                      >
                        <option value="">Make</option>
                        {MAKES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      {errors.vehicleMake && (
                        <p className="mt-1 text-xs text-red-500">{errors.vehicleMake}</p>
                      )}
                    </div>
                  </div>
                  <Input
                    label="Model"
                    placeholder="e.g. Camry, F-150, Civic"
                    value={vehicleModel}
                    onChange={(e) => {
                      setVehicleModel(e.target.value);
                      if (errors.vehicleModel) setErrors((er) => ({ ...er, vehicleModel: "" }));
                    }}
                    error={errors.vehicleModel}
                    required
                  />
                  <Input
                    label="Mileage (optional)"
                    placeholder="e.g. 45000"
                    value={vehicleMileage}
                    onChange={(e) => setVehicleMileage(e.target.value)}
                    type="number"
                    min="0"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="font-montserrat font-semibold text-navy text-base mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal" />
                  Your Contact Info
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="First Name"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors((er) => ({ ...er, firstName: "" }));
                      }}
                      error={errors.firstName}
                      required
                    />
                    <Input
                      label="Last Name"
                      placeholder="Smith"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (errors.lastName) setErrors((er) => ({ ...er, lastName: "" }));
                      }}
                      error={errors.lastName}
                      required
                    />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((er) => ({ ...er, email: "" }));
                    }}
                    error={errors.email}
                    required
                  />
                  <Textarea
                    label="Notes for the Shop (optional)"
                    placeholder="Any details about your vehicle or the issue you're experiencing…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Right column: Timeslots */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="font-montserrat font-semibold text-navy text-base mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal" />
                Available Times
              </h2>

              {loadingTimeslots && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 font-opensans">Loading availability…</p>
                </div>
              )}

              {!loadingTimeslots && timeslotsError && (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-opensans mb-3">{timeslotsError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchTimeslots(bookingState)}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Retry
                  </Button>
                </div>
              )}

              {!loadingTimeslots && !timeslotsError && timeslotGroups.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-opensans">
                    No available times found for the next 14 days.
                  </p>
                  <p className="text-xs text-gray-400 font-opensans mt-1">
                    Try selecting a different shop.
                  </p>
                </div>
              )}

              {!loadingTimeslots && !timeslotsError && timeslotGroups.length > 0 && (
                <>
                  {/* Date tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    {timeslotGroups.map((group) => (
                      <button
                        key={group.date}
                        onClick={() => setActiveDate(group.date)}
                        className={cn(
                          "flex-shrink-0 px-3 py-2 rounded-lg text-xs font-montserrat font-semibold transition-all text-center min-w-[70px]",
                          activeDate === group.date
                            ? "bg-navy text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {group.displayDate}
                      </button>
                    ))}
                  </div>

                  {/* Time slots grid */}
                  {activeGroup && (
                    <div className="grid grid-cols-3 gap-2">
                      {activeGroup.slots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => slot.available && selectTimeslot(slot, activeGroup.date)}
                          disabled={!slot.available}
                          className={cn(
                            "py-2.5 px-2 rounded-lg text-xs font-montserrat font-semibold transition-all text-center",
                            !slot.available && "opacity-40 cursor-not-allowed bg-gray-50 text-gray-400 border border-gray-200",
                            slot.available && selectedTimeslotId === slot.id
                              ? "bg-teal text-white border-2 border-teal"
                              : slot.available
                              ? "bg-gray-50 text-navy border border-gray-200 hover:border-teal hover:bg-teal/5"
                              : ""
                          )}
                        >
                          {formatTime(slot.time)}
                          {selectedTimeslotId === slot.id && (
                            <CheckCircle className="w-3 h-3 mx-auto mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {errors.timeslot && (
                    <div className="mt-3 flex items-center gap-2 text-red-500 text-xs font-opensans">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {errors.timeslot}
                    </div>
                  )}

                  {selectedTimeslotId && (
                    <div className="mt-4 flex items-center gap-2 bg-teal/10 border border-teal/20 rounded-lg px-3 py-2">
                      <CheckCircle className="w-4 h-4 text-teal flex-shrink-0" />
                      <span className="text-sm font-opensans text-teal font-semibold">
                        {formatDisplayDate(selectedTimeslotDate)} at {formatTime(selectedTimeslotTime)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Booking error */}
          {bookingError && (
            <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-montserrat font-semibold text-red-700 text-sm">Booking Failed</p>
                <p className="text-red-600 text-sm font-opensans mt-0.5">{bookingError}</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="md"
              onClick={() => router.push("/book/shops")}
              disabled={booking}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleBookAppointment}
              disabled={booking}
              className="flex-1 sm:flex-none"
            >
              {booking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Booking…
                </>
              ) : (
                <>
                  Confirm Appointment
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
