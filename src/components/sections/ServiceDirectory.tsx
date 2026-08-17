"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, X } from "lucide-react";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { SERVICE_DIRECTORY } from "@/lib/service-catalog";
import { QUOTE_URL } from "@/lib/content";

const SUGGESTIONS = [
  "Brake pads",
  "Oil change",
  "Transmission",
  "Battery",
  "Windshield",
  "Tires",
  "Check engine light",
];

/**
 * CHANGE 007-D — the SERVICES page functions as an easy-to-use service
 * directory with SEARCH SERVICES.
 * CHANGE 008 — a SCHEDULE SERVICE NOW button closes every major category.
 */
export function ServiceDirectory() {
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalized) return SERVICE_DIRECTORY;
    return SERVICE_DIRECTORY.map((category) => {
      const categoryMatch =
        category.name.toLowerCase().includes(normalized) ||
        category.description.toLowerCase().includes(normalized);
      const services = category.services.filter((service) =>
        service.toLowerCase().includes(normalized)
      );
      if (categoryMatch && services.length === 0) return { ...category };
      return { ...category, services };
    }).filter((category) => category.services.length > 0);
  }, [normalized]);

  const totalMatches = filtered.reduce(
    (sum, category) => sum + category.services.length,
    0
  );

  return (
    <div>
      {/* SEARCH SERVICES */}
      <div className="mx-auto max-w-2xl">
        <label
          htmlFor="service-search"
          className="mb-2 block font-montserrat text-xs font-bold uppercase tracking-widest text-navy/60"
        >
          Search Services
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="service-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Brake pads, oil change, transmission, windshield…"
            className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-11 font-opensans text-sm text-navy shadow-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-navy"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-opensans text-xs text-gray-600 transition hover:border-teal hover:text-teal"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {normalized && (
          <p className="mt-4 text-center font-opensans text-sm text-gray-500">
            {totalMatches > 0
              ? `${totalMatches} matching service${totalMatches === 1 ? "" : "s"} found.`
              : "No matching service listed. Tell us what the vehicle needs and we will help."}
          </p>
        )}
      </div>

      {/* Category jump links */}
      {!normalized && (
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {SERVICE_DIRECTORY.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="rounded-full bg-navy/5 px-4 py-2 font-montserrat text-xs font-semibold uppercase tracking-wide text-navy transition hover:bg-navy hover:text-white"
            >
              {category.name}
            </a>
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="mt-12 space-y-10">
        {filtered.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="scroll-mt-28 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card"
          >
            <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-teal/10">
                  <ServiceIcon name={category.icon} className="text-teal" />
                </div>
                <div>
                  <h2 className="font-montserrat text-xl font-bold text-navy md:text-2xl">
                    {category.name}
                  </h2>
                  <p className="mt-1 max-w-xl font-opensans text-sm text-gray-500">
                    {category.description}
                  </p>
                </div>
              </div>
              <span className="flex-shrink-0 font-montserrat text-sm font-bold text-teal">
                {category.services.length} services listed
              </span>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.services.map((service) => (
                  <div
                    key={service}
                    className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
                    <span className="font-opensans text-sm text-navy">{service}</span>
                  </div>
                ))}
              </div>

              {/* CHANGE 008-B — CTA at the end of each service section */}
              <div className="mt-7 flex justify-center border-t border-gray-100 pt-7">
                <Link
                  href={QUOTE_URL}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-7 py-3.5 font-montserrat text-sm font-bold uppercase tracking-wide text-navy transition-colors duration-200 hover:bg-gold-600"
                >
                  Schedule Service Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-card">
          <p className="font-montserrat text-lg font-bold text-navy">
            Can DSN help me with this?
          </p>
          <p className="mx-auto mt-3 max-w-xl font-opensans text-sm text-gray-500">
            Tell us what the vehicle needs and where it is located, and we will
            help you find nearby service options.
          </p>
          <Link
            href={QUOTE_URL}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-7 py-3.5 font-montserrat text-sm font-bold uppercase tracking-wide text-navy transition-colors duration-200 hover:bg-gold-600"
          >
            Schedule Service Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
