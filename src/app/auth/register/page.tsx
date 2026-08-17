"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    companyName: z.string().optional(),
    operatorType: z.string().optional(),
    vehicleCount: z.string().optional(),
    primaryMarket: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// CHANGE 003 — FREE Drive Membership: one registration, easy access.
const membershipBenefits = [
  "Vehicle maintenance, repairs and other services",
  "Automotive parts",
  "Vehicle protection, tracking and financing",
  "Monthly Drive Newsletter",
];

// CHANGE 003-E — basic member profile options.
const OPERATOR_TYPES = [
  "Turo Host",
  "Car Rental Operator",
  "Fleet",
  "Other",
];

const VEHICLE_COUNTS = ["1-5", "6-25", "26-100", "101-500", "500+"];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
          companyName: data.companyName,
          operatorType: data.operatorType,
          vehicleCount: data.vehicleCount,
          primaryMarket: data.primaryMarket,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Registration failed. Please try again.");
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/auth/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
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
            <div className="font-montserrat font-bold text-navy text-base leading-tight">
              Drive Service
            </div>
            <div className="font-montserrat font-bold text-teal text-base leading-tight">
              Network
            </div>
          </div>
        </Link>

        <h2 className="text-center font-montserrat font-bold text-2xl text-navy">
          Create Your FREE Membership
        </h2>
        <p className="mt-2 text-center font-opensans text-sm text-gray-500">
          One Registration. Easy Access to the Drive Ecosystem. No membership fee.
        </p>
        <p className="mt-2 text-center font-opensans text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-teal font-semibold hover:text-teal-600 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-gray-100">
          {/* Benefits Banner */}
          <div className="mb-6 p-4 bg-navy/5 rounded-xl border border-navy/10">
            <p className="font-montserrat font-semibold text-navy text-sm mb-3">
              Your FREE Drive Membership is your doorway to:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {membershipBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                  <span className="font-opensans text-xs text-gray-600">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-opensans text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  autoComplete="given-name"
                  {...register("firstName")}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1.5 font-opensans text-xs text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  autoComplete="family-name"
                  {...register("lastName")}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                  placeholder="Smith"
                />
                {errors.lastName && (
                  <p className="mt-1.5 font-opensans text-xs text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 font-opensans text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
                  Mobile phone{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  {...register("phone")}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                  placeholder="(555) 000-0000"
                />
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
                  Company/business name{" "}
                  <span className="text-gray-400 font-normal">(if applicable)</span>
                </label>
                <input
                  type="text"
                  autoComplete="organization"
                  {...register("companyName")}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                  placeholder="Your company"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
                  Type of operator
                </label>
                <select
                  {...register("operatorType")}
                  defaultValue=""
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors bg-white"
                >
                  <option value="">Select</option>
                  {OPERATOR_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
                  Approximate vehicles
                </label>
                <select
                  {...register("vehicleCount")}
                  defaultValue=""
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors bg-white"
                >
                  <option value="">Select</option>
                  {VEHICLE_COUNTS.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
                  Primary market
                </label>
                <input
                  type="text"
                  {...register("primaryMarket")}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                  placeholder="City, ST"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("password")}
                    className="w-full px-4 py-3 pr-11 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 font-opensans text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className="w-full px-4 py-3 pr-11 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 font-opensans text-xs text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <p className="font-opensans text-xs text-gray-400">
              Password must be at least 8 characters with one uppercase letter and one number.
            </p>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={isSubmitting}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Your FREE Membership
            </Button>

            {/* NOTE / FLAG — Terms of Service and Privacy Policy pages do not
                exist on the site (both returned 404 before the revamp). Links
                removed rather than left broken; see implementation report. */}
            <p className="font-opensans text-xs text-gray-400 text-center">
              By creating your FREE Drive Membership, you agree to the Drive
              Service Network Terms of Service and Privacy Policy.
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Shield className="w-4 h-4" />
              <span className="font-opensans text-xs">
                Your data is protected with industry-standard encryption
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
