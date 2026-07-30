"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

const preQualSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  fleetSize: z.string().min(1, "Please select your fleet size"),
  financingNeed: z.string().min(1, "Please select your financing need"),
  notes: z.string().optional(),
});

type PreQualFormData = z.infer<typeof preQualSchema>;

const fleetSizeOptions = [
  { value: "1", label: "1 vehicle" },
  { value: "2-5", label: "2–5 vehicles" },
  { value: "6-20", label: "6–20 vehicles" },
  { value: "21-50", label: "21–50 vehicles" },
  { value: "51-100", label: "51–100 vehicles" },
  { value: "100+", label: "100+ vehicles" },
];

const financingNeedOptions = [
  { value: "repair", label: "Repair financing (unexpected repairs)" },
  { value: "maintenance", label: "Maintenance financing (scheduled service)" },
  { value: "commercial", label: "Commercial fleet line of credit" },
  { value: "payment_plan", label: "Structured payment plan" },
  { value: "other", label: "Other / Not sure yet" },
];

export function FinancingPreQualForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PreQualFormData>({
    resolver: zodResolver(preQualSchema),
  });

  const onSubmit = async (data: PreQualFormData) => {
    setError(null);
    try {
      const res = await fetch("/api/financing/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to submit. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-teal" />
        </div>
        <h3 className="font-montserrat font-bold text-navy text-xl mb-3">
          Pre-Qualification Submitted!
        </h3>
        <p className="font-opensans text-gray-500 text-sm leading-relaxed mb-6">
          Thank you for your interest in DSN financing. Our team will review your
          information and reach out within 1 business day with available options.
        </p>
        <p className="font-opensans text-gray-400 text-xs">
          No hard credit inquiry was performed. You will only receive a full application
          if you choose to proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-montserrat font-bold text-navy text-lg mb-5">
        Pre-Qualification Form
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-opensans text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
              First name *
            </label>
            <input
              type="text"
              {...register("firstName")}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 font-opensans text-xs text-red-600">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
              Last name *
            </label>
            <input
              type="text"
              {...register("lastName")}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="Smith"
            />
            {errors.lastName && (
              <p className="mt-1 font-opensans text-xs text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
            Email address *
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 font-opensans text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
              Phone number
            </label>
            <input
              type="tel"
              {...register("phone")}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="(555) 000-0000"
            />
          </div>
          <div>
            <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
              Company / Fleet name
            </label>
            <input
              type="text"
              {...register("company")}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="ABC Fleet LLC"
            />
          </div>
        </div>

        <div>
          <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
            Fleet size *
          </label>
          <select
            {...register("fleetSize")}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          >
            <option value="">Select fleet size...</option>
            {fleetSizeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.fleetSize && (
            <p className="mt-1 font-opensans text-xs text-red-600">{errors.fleetSize.message}</p>
          )}
        </div>

        <div>
          <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
            Financing need *
          </label>
          <select
            {...register("financingNeed")}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          >
            <option value="">Select financing type...</option>
            {financingNeedOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.financingNeed && (
            <p className="mt-1 font-opensans text-xs text-red-600">{errors.financingNeed.message}</p>
          )}
        </div>

        <div>
          <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
            Additional notes{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal resize-none"
            placeholder="Tell us more about your financing needs, specific repairs, or any questions..."
          />
        </div>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          loading={isSubmitting}
          className="w-full"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Submit Pre-Qualification
        </Button>

        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Shield className="w-4 h-4" />
          <span className="font-opensans text-xs">
            No hard credit pull. No obligation. Your information is secure.
          </span>
        </div>
      </form>
    </div>
  );
}
