"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, User, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  membershipTier: string;
  createdAt: string;
  _count: { vehicles: number; appointments: number };
}

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/dashboard/profile");
        const data = await res.json();
        setProfile(data.user);
        reset({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          phone: data.user.phone || "",
          addressLine1: data.user.addressLine1 || "",
          addressLine2: data.user.addressLine2 || "",
          city: data.user.city || "",
          state: data.user.state || "",
          zipCode: data.user.zipCode || "",
        });
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to save profile");
        return;
      }
      const result = await res.json();
      setProfile((prev) => prev ? { ...prev, ...result.user } : result.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-teal animate-spin" />
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    FREE: "bg-gray-100 text-gray-600",
    BASIC: "bg-teal/10 text-teal",
    PROFESSIONAL: "bg-navy/10 text-navy",
    ENTERPRISE: "bg-gold/20 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-montserrat font-bold text-navy text-2xl">My Profile</h1>
        <p className="font-opensans text-gray-500 text-sm mt-1">
          Manage your contact information and account details
        </p>
      </div>

      {/* Account Summary */}
      {profile && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-montserrat font-bold text-white text-xl">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="font-montserrat font-bold text-navy text-lg">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="font-opensans text-gray-500 text-sm">{profile.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-montserrat font-bold ${tierColors[profile.membershipTier] || tierColors.FREE}`}>
                  <Star className="w-3 h-3" />
                  {profile.membershipTier} Member
                </span>
                <span className="font-opensans text-gray-400 text-xs">
                  Member since {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
            <div className="hidden sm:flex gap-6 text-center">
              <div>
                <div className="font-montserrat font-bold text-navy text-xl">{profile._count.vehicles}</div>
                <div className="font-opensans text-gray-400 text-xs">Vehicles</div>
              </div>
              <div>
                <div className="font-montserrat font-bold text-navy text-xl">{profile._count.appointments}</div>
                <div className="font-opensans text-gray-400 text-xs">Services</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-opensans text-sm text-red-700">{error}</p>
          </div>
        )}
        {saved && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="font-opensans text-sm text-green-700">Profile updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-navy/60" />
              <h3 className="font-montserrat font-bold text-navy text-base">Personal Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">First name *</label>
                <input
                  type="text"
                  {...register("firstName")}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
                {errors.firstName && <p className="mt-1 font-opensans text-xs text-red-600">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Last name *</label>
                <input
                  type="text"
                  {...register("lastName")}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
                {errors.lastName && <p className="mt-1 font-opensans text-xs text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-navy/60" />
              <h3 className="font-montserrat font-bold text-navy text-base">Contact Information</h3>
            </div>
            <div>
              <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Phone number</label>
              <input
                type="tel"
                {...register("phone")}
                placeholder="(555) 000-0000"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-navy/60" />
              <h3 className="font-montserrat font-bold text-navy text-base">Address</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Street address</label>
                <input
                  type="text"
                  {...register("addressLine1")}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>
              <div>
                <label className="block font-opensans text-sm font-medium text-navy mb-1.5">Apt, suite, etc.</label>
                <input
                  type="text"
                  {...register("addressLine2")}
                  placeholder="Suite 100"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block font-opensans text-sm font-medium text-navy mb-1.5">City</label>
                  <input
                    type="text"
                    {...register("city")}
                    placeholder="Los Angeles"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </div>
                <div>
                  <label className="block font-opensans text-sm font-medium text-navy mb-1.5">State</label>
                  <select
                    {...register("state")}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  >
                    <option value="">Select</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-opensans text-sm font-medium text-navy mb-1.5">ZIP code</label>
                  <input
                    type="text"
                    {...register("zipCode")}
                    placeholder="90001"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 font-opensans text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
              disabled={!isDirty && !saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => reset()}
              >
                Discard Changes
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
