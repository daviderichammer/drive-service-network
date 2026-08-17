"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  // CHANGE 004-A — "How Can We Help?" selection routed internally to the
  // appropriate Drive company or team.
  inquiryType: z.enum([
    "maintenance-repairs",
    "tires-glass-collision",
    "parts",
    "tracking-theft-protection",
    "vehicle-protection",
    "vehicle-acquisition",
    "financing",
    "private-rentals",
    "growth-partner",
    "technology",
    "dsn-partnership",
    "general",
  ]),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const inquiryOptions = [
  { value: "maintenance-repairs", label: "Vehicle Maintenance & Repairs" },
  { value: "tires-glass-collision", label: "Tires / Glass / Collision" },
  { value: "parts", label: "Automotive Parts" },
  {
    value: "tracking-theft-protection",
    label: "GPS / Smoke Detection / Theft Protection",
  },
  { value: "vehicle-protection", label: "Vehicle Protection / VSC / GAP" },
  { value: "vehicle-acquisition", label: "Vehicle Acquisition" },
  { value: "financing", label: "Automotive Business Financing" },
  { value: "private-rentals", label: "Private Car Rentals" },
  { value: "growth-partner", label: "Drive Growth Partner Opportunities" },
  { value: "technology", label: "Technology / Software" },
  { value: "dsn-partnership", label: "Drive Service Network Partnership" },
  { value: "general", label: "General Question / Not Sure" },
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      inquiryType: "general",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      setStatus("success");
      reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-5">
          <CheckCircle className="w-8 h-8 text-teal" />
        </div>
        <h3 className="font-montserrat font-bold text-navy text-xl mb-2">
          Message Sent Successfully
        </h3>
        <p className="font-opensans text-gray-500 text-sm max-w-sm leading-relaxed mb-6">
          Thank you for contacting Drive Service Network. A member of our team
          will respond within 1 business day.
        </p>
        <Button
          variant="outline"
          size="md"
          onClick={() => setStatus("idle")}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          required
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          label="Last Name"
          placeholder="Smith"
          required
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="john@company.com"
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="(555) 000-0000"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      {/* Company & Inquiry Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Company / Business Name"
          placeholder="Your company name"
          error={errors.company?.message}
          {...register("company")}
        />
        <Select
          label="How Can We Help?"
          options={inquiryOptions}
          error={errors.inquiryType?.message}
          {...register("inquiryType")}
        />
      </div>

      {/* Subject */}
      <Input
        label="Subject"
        placeholder="How can we help you?"
        required
        error={errors.subject?.message}
        {...register("subject")}
      />

      {/* Message */}
      <Textarea
        label="Message"
        placeholder="Tell us what you need."
        required
        error={errors.message?.message}
        className="min-h-[140px]"
        {...register("message")}
      />

      {/* Error Message */}
      {status === "error" && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="font-opensans text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between pt-2">
        <p className="font-opensans text-gray-400 text-xs">
          We respond within 1 business day
        </p>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={status === "loading"}
          rightIcon={<Send className="w-4 h-4" />}
        >
          Send Message
        </Button>
      </div>
    </form>
  );
}
