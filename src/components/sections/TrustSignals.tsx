import React from "react";
import { Award, Users, MapPin, Wrench, TrendingDown, Clock } from "lucide-react";

const signals = [
  {
    icon: Award,
    value: "220+",
    label: "Vehicles Operated",
    description: "Real-world fleet experience behind every decision",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: MapPin,
    value: "50 States",
    label: "Nationwide Coverage",
    description: "Certified service providers in every major market",
    color: "text-teal",
    bg: "bg-teal/10",
  },
  {
    icon: Wrench,
    value: "515+",
    label: "Services Available",
    description: "From oil changes to major mechanical repairs",
    color: "text-navy",
    bg: "bg-navy/10",
  },
  {
    icon: TrendingDown,
    value: "Up to 30%",
    label: "Commercial Savings",
    description: "Exclusive pricing unavailable to the general public",
    color: "text-teal",
    bg: "bg-teal/10",
  },
  {
    icon: Clock,
    value: "3 Steps",
    label: "Simplified Booking",
    description: "Schedule service in minutes, not hours",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: Users,
    value: "Operators",
    label: "Built For You",
    description: "Designed by fleet operators who understand your business",
    color: "text-navy",
    bg: "bg-navy/10",
  },
];

export function TrustSignals() {
  return (
    <section className="bg-white section-padding-sm border-b border-gray-100">
      <div className="section-container">
        <div className="text-center mb-10">
          <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
            Why Operators Choose DSN
          </p>
          <h2 className="heading-lg text-navy">
            The Platform Built From{" "}
            <span className="text-teal">Real Experience</span>
          </h2>
          <p className="body-lg text-gray-500 mt-4 max-w-2xl mx-auto">
            Drive Service Network was created after managing one of the nation&apos;s
            largest independent rental fleets. We built the solution we wished
            existed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div
                key={signal.label}
                className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-teal/30 hover:shadow-card transition-all duration-300 bg-white group"
              >
                <div
                  className={`w-12 h-12 ${signal.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${signal.color}`} />
                </div>
                <div>
                  <div className={`font-montserrat font-black text-2xl ${signal.color}`}>
                    {signal.value}
                  </div>
                  <div className="font-montserrat font-semibold text-navy text-sm mt-0.5">
                    {signal.label}
                  </div>
                  <p className="font-opensans text-gray-500 text-xs mt-1 leading-relaxed">
                    {signal.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
