"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface Step {
  number: number;
  label: string;
  sublabel: string;
}

// Sequential enrollment flow: search → view shops → create free account → DSN+ upsell → book
const STEPS: Step[] = [
  { number: 1, label: "Find a Service", sublabel: "Service & Location" },
  { number: 2, label: "View Shops", sublabel: "Shop & Availability" },
  { number: 3, label: "Book Appointment", sublabel: "Vehicle & Timeslot" },
];

interface BookingStepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export function BookingStepIndicator({ currentStep }: BookingStepIndicatorProps) {
  return (
    <div className="bg-navy py-6">
      <div className="section-container">
        {/* Logo / Back to site */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gold rounded-md flex items-center justify-center flex-shrink-0">
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
              <span className="font-montserrat font-bold text-white text-sm leading-tight block">
                Drive Service
              </span>
              <span className="font-montserrat font-bold text-gold text-sm leading-tight block">
                Network
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/register?plan=free"
              className="text-gold hover:text-yellow-300 text-xs font-montserrat font-semibold transition-colors hidden sm:block"
            >
              Join DSN Free →
            </Link>
            <Link
              href="/"
              className="text-white/60 hover:text-white text-sm font-opensans transition-colors"
            >
              ← Back to site
            </Link>
          </div>
        </div>
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((step, index) => {
            const isCompleted = step.number < currentStep;
            const isActive = step.number === currentStep;
            const isUpcoming = step.number > currentStep;
            return (
              <div key={step.number} className="flex items-center">
                {/* Step */}
                <div className="flex flex-col items-center min-w-[100px] sm:min-w-[140px]">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center font-montserrat font-bold text-sm transition-all duration-300",
                      isCompleted && "bg-teal text-white",
                      isActive && "bg-gold text-navy ring-4 ring-gold/30",
                      isUpcoming && "bg-white/10 text-white/40"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <div
                      className={cn(
                        "font-montserrat font-semibold text-xs leading-tight",
                        isActive && "text-gold",
                        isCompleted && "text-teal",
                        isUpcoming && "text-white/40"
                      )}
                    >
                      {step.label}
                    </div>
                    <div
                      className={cn(
                        "font-opensans text-xs mt-0.5",
                        isActive && "text-white/70",
                        isCompleted && "text-white/50",
                        isUpcoming && "text-white/25"
                      )}
                    >
                      {step.sublabel}
                    </div>
                  </div>
                </div>
                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-12 sm:w-20 mx-1 transition-all duration-300",
                      step.number < currentStep ? "bg-teal" : "bg-white/15"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Enrollment nudge banner */}
        {currentStep >= 2 && (
          <div className="mt-4 flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
            <span className="font-opensans text-white/60 text-xs">
              Want commercial pricing on this service?
            </span>
            <Link
              href="/auth/register?plan=free"
              className="font-montserrat font-bold text-gold text-xs hover:text-yellow-300 transition-colors"
            >
              Join DSN Free →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
