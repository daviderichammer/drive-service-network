import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/sections/ContactForm";
import { ECOSYSTEM_ENTITIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact — Drive Service Network",
  description:
    "Tell us what you need. Drive Service Network is part of a family of affiliated companies created to help Turo hosts, car rental operators and fleets solve the everyday challenges of operating vehicles.",
};

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (786) 766-3577",
    href: "tel:+17867663577",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@driveservicenetwork.com",
    href: "mailto:info@driveservicenetwork.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Miami Beach, FL, United States",
    href: null,
  },
  {
    icon: Clock,
    label: "Response Time",
    value: "Within 1 business day",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <>
      {/* CHANGE 004 — revised introductory language */}
      <section className="bg-gradient-hero pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="section-container">
          <div className="max-w-3xl">
            <h1 className="font-montserrat text-4xl font-black leading-tight text-white md:text-5xl">
              How Can We Help?
            </h1>
            <p className="mt-6 font-opensans text-lg leading-relaxed text-white/80">
              Whether you need vehicle maintenance or repairs, parts, vehicle
              acquisition, financing, protection products, GPS tracking and theft
              protection, private rental capabilities — or simply have a question —
              tell us what you need.
            </p>
            <p className="mt-4 font-opensans text-base leading-relaxed text-white/70">
              Drive Service Network is part of a family of affiliated companies
              created to help Turo hosts, car rental operators and fleets solve the
              everyday challenges of operating vehicles.
            </p>
            <p className="mt-4 font-opensans text-base leading-relaxed text-white/70">
              If another company within the Drive ecosystem can better help solve
              your problem, we&apos;ll connect you with the right team.
            </p>
            <p className="mt-4 font-montserrat text-sm font-bold uppercase tracking-widest text-teal">
              We respond to every inquiry within 1 business day.
            </p>
          </div>
        </div>
      </section>

      {/* Form and contact details */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="section-container">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-card">
                <h2 className="font-montserrat text-lg font-bold text-navy">
                  Contact Information
                </h2>
                <div className="mt-5 space-y-5">
                  {CONTACT_INFO.map((info) => {
                    const Icon = info.icon;
                    return (
                      <div key={info.label} className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal/10">
                          <Icon className="h-4 w-4 text-teal" />
                        </div>
                        <div>
                          <div className="font-montserrat text-xs font-semibold uppercase tracking-wide text-navy">
                            {info.label}
                          </div>
                          {info.href ? (
                            <a
                              href={info.href}
                              className="mt-0.5 block font-opensans text-sm font-medium text-navy transition-colors hover:text-teal"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <div className="mt-0.5 font-opensans text-sm font-medium text-navy">
                              {info.value}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-card">
                <h2 className="font-montserrat text-xl font-bold text-navy">
                  Tell Us What You Need
                </h2>
                <p className="mt-2 font-opensans text-sm text-gray-500">
                  We respond to every inquiry within 1 business day.
                </p>
                <div className="mt-7">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE 004-B — ecosystem message */}
      <section className="bg-navy py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-montserrat text-2xl font-bold text-white md:text-3xl">
              One Contact. An Entire Network of Solutions.
            </h2>
            <p className="mt-4 font-opensans text-base leading-relaxed text-white/70">
              You don&apos;t need to know which Drive company to contact. Tell us
              what you need. We&apos;ll help connect you to the right solution.
            </p>

            <div className="mt-8 grid gap-2.5 text-left sm:grid-cols-2">
              {ECOSYSTEM_ENTITIES.map((entity) => (
                <a
                  key={entity.name}
                  href={entity.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-teal/40"
                >
                  <p className="font-montserrat text-sm font-semibold text-white">
                    {entity.name}
                  </p>
                  <p className="mt-0.5 font-opensans text-xs text-white/50">
                    {entity.description}
                  </p>
                </a>
              ))}
            </div>

            <p className="mt-8 font-montserrat text-sm font-semibold uppercase tracking-widest text-gold">
              More Products &amp; Services
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
