import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const categories = [
  {
    name: "Preventive Maintenance",
    description: "Oil changes, tire rotations, fluid services, filter replacements, and scheduled maintenance to keep your fleet running reliably.",
    services: ["Oil Change", "Tire Rotation", "Fluid Services", "Filter Replacement"],
    icon: "🔧",
    count: "85+ services",
  },
  {
    name: "Brakes & Safety",
    description: "Complete brake system inspection, pad and rotor replacement, ABS diagnostics, and brake fluid services.",
    services: ["Brake Pads", "Rotor Replacement", "ABS Service", "Brake Inspection"],
    icon: "🛑",
    count: "40+ services",
  },
  {
    name: "Tires & Wheels",
    description: "Tire installation, balancing, rotation, flat repair, TPMS service, and wheel alignment for optimal performance.",
    services: ["Tire Installation", "Wheel Balance", "Alignment", "Flat Repair"],
    icon: "⚙️",
    count: "30+ services",
  },
  {
    name: "Engine & Drivetrain",
    description: "Comprehensive engine diagnostics, timing belt service, transmission repair, and drivetrain maintenance.",
    services: ["Engine Diagnostics", "Timing Belt", "Transmission", "Check Engine"],
    icon: "🏎️",
    count: "120+ services",
  },
  {
    name: "Electrical & AC",
    description: "Battery service, alternator replacement, AC system diagnostics, recharge, and complete electrical system repair.",
    services: ["Battery Service", "AC Recharge", "Alternator", "Electrical Diagnosis"],
    icon: "⚡",
    count: "60+ services",
  },
  {
    name: "Suspension & Steering",
    description: "Wheel alignment, ball joint replacement, steering rack service, shock absorbers, and complete suspension repair.",
    services: ["Wheel Alignment", "Ball Joints", "Steering Rack", "Shocks & Struts"],
    icon: "🚗",
    count: "45+ services",
  },
  {
    name: "Diagnostics",
    description: "Advanced diagnostic scanning, check engine light analysis, ABS and airbag system diagnostics, and comprehensive vehicle inspection.",
    services: ["OBD Scan", "Check Engine", "ABS Diagnosis", "Full Inspection"],
    icon: "🔍",
    count: "25+ services",
  },
  {
    name: "State Inspections",
    description: "State safety inspections, emissions testing, smog checks, and compliance certifications for commercial fleets.",
    services: ["Safety Inspection", "Emissions Test", "Smog Check", "Fleet Compliance"],
    icon: "📋",
    count: "10+ services",
  },
];

export function ServiceCategories() {
  return (
    <section className="section-padding bg-white">
      <div className="section-container">
        <div className="text-center mb-14">
          <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
            Service Catalog
          </p>
          <h2 className="heading-lg text-navy">
            515+ Services.{" "}
            <span className="text-teal">One Platform.</span>
          </h2>
          <p className="body-lg text-gray-500 mt-4 max-w-2xl mx-auto">
            From routine maintenance to complex repairs, Drive Service Network
            connects you with certified technicians for every service your fleet
            requires — with commercial pricing on every transaction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((category) => (
            <div
              key={category.name}
              className="group bg-white border border-gray-100 rounded-xl p-6 hover:border-teal/40 hover:shadow-card-hover transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div className="text-3xl mb-4">{category.icon}</div>

              {/* Category Name */}
              <h3 className="font-montserrat font-bold text-navy text-base mb-2 group-hover:text-teal transition-colors duration-200">
                {category.name}
              </h3>

              {/* Description */}
              <p className="font-opensans text-gray-500 text-xs leading-relaxed mb-4">
                {category.description}
              </p>

              {/* Service Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {category.services.slice(0, 3).map((service) => (
                  <span
                    key={service}
                    className="inline-block px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-opensans rounded-md border border-gray-100"
                  >
                    {service}
                  </span>
                ))}
              </div>

              {/* Count */}
              <div className="flex items-center justify-between">
                <span className="font-montserrat font-semibold text-teal text-xs">
                  {category.count}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="primary" size="lg" asChild>
            <Link href="/services">
              View All Services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
