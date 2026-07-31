import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Services — 515+ Auto Repair & Maintenance Services",
  description:
    "Access 515+ auto repair and maintenance services through Drive Service Network. Commercial pricing, nationwide coverage, and certified technicians for every service your fleet requires.",
};

const serviceCategories = [
  {
    id: "preventive",
    name: "Preventive Maintenance",
    icon: "🔧",
    description:
      "Scheduled maintenance services that keep your fleet running reliably and prevent costly breakdowns before they happen.",
    services: [
      { name: "Oil & Filter Change", description: "Conventional, synthetic blend, and full synthetic options" },
      { name: "Tire Rotation", description: "Extend tire life and maintain even wear patterns" },
      { name: "Multi-Point Inspection", description: "Comprehensive vehicle health assessment" },
      { name: "Air Filter Replacement", description: "Engine and cabin air filter service" },
      { name: "Fluid Services", description: "Coolant, power steering, brake, and transmission fluids" },
      { name: "Spark Plug Replacement", description: "Restore engine performance and fuel efficiency" },
      { name: "Serpentine Belt Service", description: "Prevent belt failure and protect engine components" },
      { name: "Battery Service", description: "Testing, cleaning, and replacement" },
    ],
    highlight: "Most popular for fleet operators",
    highlightColor: "bg-teal text-white",
  },
  {
    id: "brakes",
    name: "Brakes & Safety Systems",
    icon: "🛑",
    description:
      "Complete brake system services ensuring the safety of your drivers and vehicles across all operating conditions.",
    services: [
      { name: "Brake Pad Replacement", description: "Front, rear, or complete four-wheel service" },
      { name: "Rotor Resurfacing & Replacement", description: "Restore braking performance and eliminate vibration" },
      { name: "Brake Caliper Service", description: "Caliper replacement and rebuild services" },
      { name: "ABS Diagnostics & Repair", description: "Anti-lock brake system diagnosis and repair" },
      { name: "Brake Fluid Flush", description: "Remove moisture and restore hydraulic performance" },
      { name: "Emergency Brake Service", description: "Parking brake adjustment and cable replacement" },
      { name: "Brake Inspection", description: "Comprehensive brake system safety assessment" },
      { name: "Drum Brake Service", description: "Shoe replacement and drum resurfacing" },
    ],
    highlight: null,
    highlightColor: "",
  },
  {
    id: "tires",
    name: "Tires & Wheels",
    icon: "⚙️",
    description:
      "Complete tire and wheel services to maximize tire life, ensure safety, and maintain optimal vehicle performance.",
    services: [
      { name: "Tire Installation", description: "Mount and balance new tires on your vehicles" },
      { name: "Wheel Balancing", description: "Eliminate vibration and extend tire life" },
      { name: "Wheel Alignment", description: "Restore proper alignment for even tire wear" },
      { name: "Flat Tire Repair", description: "Patch, plug, or replace damaged tires" },
      { name: "TPMS Service", description: "Tire pressure monitoring system reset and replacement" },
      { name: "Tire Rotation & Balance", description: "Combined service for maximum tire longevity" },
      { name: "Wheel Replacement", description: "Alloy and steel wheel replacement services" },
      { name: "Seasonal Tire Change", description: "Summer and winter tire changeover service" },
    ],
    highlight: null,
    highlightColor: "",
  },
  {
    id: "engine",
    name: "Engine & Drivetrain",
    icon: "🏎️",
    description:
      "Comprehensive engine and drivetrain services from routine maintenance to complex repairs performed by certified technicians.",
    services: [
      { name: "Engine Diagnostics", description: "Advanced scanning and diagnosis for all engine issues" },
      { name: "Timing Belt & Chain", description: "Replacement to prevent catastrophic engine failure" },
      { name: "Water Pump Replacement", description: "Prevent overheating and engine damage" },
      { name: "Transmission Service", description: "Fluid change, filter replacement, and repair" },
      { name: "CV Axle Replacement", description: "Restore drivetrain integrity and eliminate vibration" },
      { name: "Fuel System Service", description: "Injector cleaning, fuel pump, and filter service" },
      { name: "Exhaust System Repair", description: "Muffler, catalytic converter, and pipe replacement" },
      { name: "Head Gasket Service", description: "Diagnosis and repair of coolant and oil leaks" },
    ],
    highlight: "Most complex services available",
    highlightColor: "bg-navy text-white",
  },
  {
    id: "electrical",
    name: "Electrical & Air Conditioning",
    icon: "⚡",
    description:
      "Complete electrical system and climate control services to keep your fleet comfortable and reliable in all conditions.",
    services: [
      { name: "AC Recharge & Service", description: "Refrigerant recharge and system inspection" },
      { name: "AC Compressor Replacement", description: "Restore full air conditioning performance" },
      { name: "Alternator Replacement", description: "Maintain charging system reliability" },
      { name: "Starter Motor Service", description: "Diagnosis and replacement for reliable starting" },
      { name: "Battery Replacement", description: "OEM and aftermarket battery options" },
      { name: "Electrical Diagnosis", description: "Advanced electrical system troubleshooting" },
      { name: "AC Evaporator Service", description: "Core replacement and leak repair" },
      { name: "Heating System Repair", description: "Heater core, blower motor, and thermostat service" },
    ],
    highlight: null,
    highlightColor: "",
  },
  {
    id: "suspension",
    name: "Suspension & Steering",
    icon: "🚗",
    description:
      "Maintain ride quality, handling precision, and tire wear with comprehensive suspension and steering services.",
    services: [
      { name: "Wheel Alignment", description: "Four-wheel alignment for optimal handling" },
      { name: "Shock & Strut Replacement", description: "Restore ride comfort and vehicle control" },
      { name: "Ball Joint Replacement", description: "Critical safety component inspection and replacement" },
      { name: "Steering Rack Service", description: "Power steering rack replacement and repair" },
      { name: "Tie Rod Replacement", description: "Restore steering precision and safety" },
      { name: "Sway Bar Service", description: "Link and bushing replacement for stability" },
      { name: "Control Arm Replacement", description: "Restore suspension geometry and handling" },
      { name: "Power Steering Service", description: "Fluid flush and pump replacement" },
    ],
    highlight: null,
    highlightColor: "",
  },
  {
    id: "diagnostics",
    name: "Diagnostics & Inspection",
    icon: "🔍",
    description:
      "Advanced diagnostic services to identify issues before they become expensive repairs and keep your fleet compliant.",
    services: [
      { name: "Check Engine Light Diagnosis", description: "OBD-II scanning and fault code analysis" },
      { name: "Pre-Purchase Inspection", description: "Comprehensive vehicle assessment before acquisition" },
      { name: "Fleet Safety Inspection", description: "DOT-compliant safety inspection for commercial fleets" },
      { name: "ABS Warning Light Diagnosis", description: "Anti-lock brake system fault diagnosis" },
      { name: "Airbag System Diagnosis", description: "SRS warning light and airbag system inspection" },
      { name: "Transmission Diagnosis", description: "Identify shifting issues and internal failures" },
      { name: "AC System Diagnosis", description: "Identify leaks, compressor issues, and system failures" },
      { name: "Electrical System Diagnosis", description: "Comprehensive electrical fault tracing" },
    ],
    highlight: null,
    highlightColor: "",
  },
  {
    id: "inspections",
    name: "State Inspections & Compliance",
    icon: "📋",
    description:
      "State-required safety and emissions inspections to keep your fleet legally compliant across all operating markets.",
    services: [
      { name: "State Safety Inspection", description: "Required annual safety certification" },
      { name: "Emissions Testing", description: "OBD and tailpipe emissions compliance testing" },
      { name: "Smog Check", description: "California and other state smog certification" },
      { name: "Commercial Vehicle Inspection", description: "DOT compliance inspection for commercial fleets" },
      { name: "Fleet Compliance Audit", description: "Comprehensive compliance review for large fleets" },
      { name: "Pre-Registration Inspection", description: "Inspection required for vehicle registration" },
    ],
    highlight: "Required for commercial operation",
    highlightColor: "bg-gold text-navy",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="section-container">
          <div className="max-w-3xl">
            <Badge variant="teal" size="lg" className="mb-6">
              Service Catalog
            </Badge>
            <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
              515+ Services.{" "}
              <span className="text-gold">One Network.</span>
            </h1>
            <p className="font-opensans text-white/80 text-lg md:text-xl leading-relaxed mb-8">
              From routine oil changes to complex engine repairs, Drive Service
              Network connects your fleet with certified technicians for every
              service you need — with commercial pricing on every transaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="gold" size="lg" asChild>
                <Link href="/how-it-works">
                  <span className="text-navy">Schedule Service</span>
                  <ArrowRight className="w-5 h-5 text-navy" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/membership" className="text-gold">View Subscription Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
              Complete Service Coverage
            </p>
            <h2 className="heading-lg text-navy">
              Every Service Your Fleet{" "}
              <span className="text-teal">Will Ever Need</span>
            </h2>
            <p className="body-lg text-gray-500 mt-4 max-w-2xl mx-auto">
              Our nationwide network of certified repair facilities covers every
              category of vehicle maintenance and repair. All services are
              available with commercial pricing for DSN subscribers.
            </p>
          </div>

          <div className="space-y-12">
            {serviceCategories.map((category, index) => (
              <div
                key={category.id}
                id={category.id}
                className={`rounded-2xl border border-gray-100 overflow-hidden shadow-card ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {/* Category Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{category.icon}</div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="font-montserrat font-bold text-navy text-2xl">
                            {category.name}
                          </h2>
                          {category.highlight && (
                            <span
                              className={`${category.highlightColor} text-xs font-montserrat font-semibold px-3 py-1 rounded-full`}
                            >
                              {category.highlight}
                            </span>
                          )}
                        </div>
                        <p className="font-opensans text-gray-500 text-sm mt-1 max-w-xl">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="font-montserrat font-bold text-teal text-sm">
                        {category.services.length}+ services
                      </span>
                    </div>
                  </div>
                </div>

                {/* Services Grid */}
                <div className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {category.services.map((service) => (
                      <div
                        key={service.name}
                        className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal/30 hover:shadow-sm transition-all duration-200"
                      >
                        <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-montserrat font-semibold text-navy text-sm">
                            {service.name}
                          </div>
                          <div className="font-opensans text-gray-400 text-xs mt-0.5 leading-relaxed">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Pricing CTA */}
      <section className="section-padding bg-navy">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <Wrench className="w-12 h-12 text-teal mx-auto mb-6" />
            <h2 className="font-montserrat font-black text-white text-3xl md:text-4xl leading-tight mb-6">
              Commercial Pricing on{" "}
              <span className="text-gold">Every Service</span>
            </h2>
            <p className="font-opensans text-white/70 text-lg leading-relaxed mb-8">
              DSN subscribers receive exclusive commercial pricing unavailable to the
              general public. The savings on a single major repair often exceed
              the annual subscription cost.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" asChild>
                <Link href="/membership">
                  <span className="text-navy">View Subscription Plans</span>
                  <ArrowRight className="w-5 h-5 text-navy" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/how-it-works" className="text-gold">Schedule Service</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
