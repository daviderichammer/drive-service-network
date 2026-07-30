"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  vin?: string | null;
  licensePlate?: string | null;
  color?: string | null;
  mileage?: number | null;
  nickname?: string | null;
  fuelType?: string | null;
  status: string;
  createdAt: string;
}

const vehicleSchema = z.object({
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 2),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  trim: z.string().optional(),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  color: z.string().optional(),
  mileage: z.coerce.number().int().optional().or(z.literal("")),
  nickname: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 35 }, (_, i) => currentYear + 1 - i);

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { year: currentYear },
  });

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/dashboard/vehicles");
      const data = await res.json();
      setVehicles(data.vehicles || []);
    } catch {
      setError("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const onSubmit = async (data: VehicleFormData) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...data,
        mileage: data.mileage === "" ? undefined : Number(data.mileage),
      };
      const res = await fetch("/api/dashboard/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to add vehicle");
        return;
      }
      setSuccess(true);
      reset({ year: currentYear });
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
        fetchVehicles();
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeVehicle = async (id: string) => {
    if (!confirm("Remove this vehicle from your account?")) return;
    try {
      await fetch(`/api/dashboard/vehicles/${id}`, { method: "DELETE" });
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch {
      setError("Failed to remove vehicle");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-navy text-2xl">My Vehicles</h1>
          <p className="font-opensans text-gray-500 text-sm mt-1">
            Manage your registered vehicles and track service history
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowForm(!showForm)}
          leftIcon={showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        >
          {showForm ? "Cancel" : "Add Vehicle"}
        </Button>
      </div>

      {/* Add Vehicle Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="font-montserrat font-bold text-navy text-lg mb-5">Add New Vehicle</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-opensans text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="font-opensans text-sm text-green-700">Vehicle added successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Year *</label>
                <select
                  {...register("year")}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-opensans text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {errors.year && <p className="mt-1 font-opensans text-xs text-red-600">{errors.year.message}</p>}
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Make *</label>
                <input
                  type="text"
                  {...register("make")}
                  placeholder="e.g. Ford"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
                {errors.make && <p className="mt-1 font-opensans text-xs text-red-600">{errors.make.message}</p>}
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Model *</label>
                <input
                  type="text"
                  {...register("model")}
                  placeholder="e.g. F-150"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
                {errors.model && <p className="mt-1 font-opensans text-xs text-red-600">{errors.model.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Trim</label>
                <input
                  type="text"
                  {...register("trim")}
                  placeholder="e.g. XLT"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Nickname</label>
                <input
                  type="text"
                  {...register("nickname")}
                  placeholder="e.g. Turo Unit 1"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">VIN</label>
                <input
                  type="text"
                  {...register("vin")}
                  placeholder="17-character VIN"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">License Plate</label>
                <input
                  type="text"
                  {...register("licensePlate")}
                  placeholder="ABC-1234"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Current Mileage</label>
                <input
                  type="number"
                  {...register("mileage")}
                  placeholder="e.g. 45000"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Color</label>
                <input
                  type="text"
                  {...register("color")}
                  placeholder="e.g. White"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Fuel Type</label>
                <select
                  {...register("fuelType")}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-opensans text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                >
                  <option value="">Select...</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Transmission</label>
                <select
                  {...register("transmission")}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 font-opensans text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                >
                  <option value="">Select...</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                  <option value="DCT">DCT</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" size="md" loading={submitting}>
                {submitting ? "Adding..." : "Add Vehicle"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => { setShowForm(false); reset(); setError(null); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-teal animate-spin" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
          <Car className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-montserrat font-bold text-navy text-lg mb-2">
            No vehicles registered
          </h3>
          <p className="font-opensans text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Add your vehicles to track service history, get maintenance reminders, and access commercial pricing.
          </p>
          <Button variant="primary" size="md" onClick={() => setShowForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add Your First Vehicle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:border-teal/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-navy/5 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5 text-navy/60" />
                  </div>
                  <div>
                    <h3 className="font-montserrat font-bold text-navy text-base">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    {vehicle.nickname && (
                      <p className="font-opensans text-teal text-xs font-medium">{vehicle.nickname}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeVehicle(vehicle.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-opensans text-gray-500 mb-4">
                {vehicle.trim && <span>Trim: {vehicle.trim}</span>}
                {vehicle.color && <span>Color: {vehicle.color}</span>}
                {vehicle.mileage && <span>Mileage: {vehicle.mileage.toLocaleString()}</span>}
                {vehicle.fuelType && <span>Fuel: {vehicle.fuelType}</span>}
                {vehicle.licensePlate && <span>Plate: {vehicle.licensePlate}</span>}
                {vehicle.vin && <span className="col-span-2 truncate">VIN: {vehicle.vin}</span>}
              </div>

              <div className="flex gap-2">
                <Button variant="primary" size="sm" asChild className="flex-1">
                  <Link href="/book">
                    <Calendar className="w-3.5 h-3.5" />
                    Book Service
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/dashboard/appointments">
                    <Edit2 className="w-3.5 h-3.5" />
                    History
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
