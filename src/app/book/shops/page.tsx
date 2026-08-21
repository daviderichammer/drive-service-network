"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  Phone,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { BookingStepIndicator } from "@/components/booking/BookingStepIndicator";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Shop {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  distance?: number;
  services?: string[];
}

interface BookingState {
  zipCode: string;
  radius: number;
  selectedServiceId: number | null;
  selectedServiceName: string;
  selectedCategory: string;
  selectedShopId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count?: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-3.5 h-3.5",
              i < full
                ? "text-gold fill-gold"
                : i === full && half
                ? "text-gold fill-gold/50"
                : "text-gray-200 fill-gray-200"
            )}
          />
        ))}
      </div>
      <span className="text-xs font-opensans text-gray-500">
        {rating.toFixed(1)}{count ? ` (${count})` : ""}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShopsPage() {
  const router = useRouter();

  const [bookingState, setBookingState] = useState<BookingState | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Load booking state from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("dsn_booking_flow");
      if (!stored) {
        router.replace("/book");
        return;
      }
      const parsed: BookingState = JSON.parse(stored);
      if (!parsed.zipCode || !parsed.selectedServiceId) {
        router.replace("/book");
        return;
      }
      setBookingState(parsed);
      if (parsed.selectedShopId) setSelectedShopId(parsed.selectedShopId);
    } catch {
      router.replace("/book");
    }
  }, [router]);

  const searchShops = useCallback(async (state: BookingState) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
            const params = new URLSearchParams({
        zipcode: state.zipCode,
        radius: String(state.radius || 25),
      });
      // Platform API facility search (Partner API removed — BUILD section 2).
      const res = await fetch(`/api/platform/locations?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to search shops");
      }
      const locations: Shop[] = (data.data?.locations || []).map(
        (l: {
          id: number;
          name: string;
          address1: string;
          address2?: string;
          city: string;
          state: string;
          zipcode: string;
          ratingAverage?: number;
          ratingCount?: number;
          distanceMeters?: number;
        }) => ({
          id: String(l.id),
          name: l.name,
          address: [l.address1, l.address2].filter(Boolean).join(" ").trim(),
          city: l.city,
          state: l.state,
          zip: l.zipcode,
          rating: l.ratingAverage,
          reviewCount: l.ratingCount,
          distance:
            typeof l.distanceMeters === "number"
              ? Math.round((l.distanceMeters / 1609.344) * 10) / 10
              : undefined,
        })
      );
      setShops(locations);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to search shops. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search when state is loaded
  useEffect(() => {
    if (bookingState && !hasSearched) {
      searchShops(bookingState);
    }
  }, [bookingState, hasSearched, searchShops]);

  function selectShop(shop: Shop) {
    setSelectedShopId(shop.id);
  }

  function handleContinue() {
    if (!selectedShopId) return;
    const shop = shops.find((s) => s.id === selectedShopId);
    if (!shop) return;

    try {
      const existing = JSON.parse(sessionStorage.getItem("dsn_booking_flow") || "{}");
      sessionStorage.setItem(
        "dsn_booking_flow",
        JSON.stringify({
          ...existing,
          selectedShopId: shop.id,
          selectedShopName: shop.name,
          selectedShopAddress: shop.address,
          selectedShopCity: shop.city,
          selectedShopState: shop.state,
          selectedShopPhone: shop.phone || "",
          selectedShopRating: shop.rating || null,
          currentStep: 3,
        })
      );
    } catch {
      // ignore
    }

    // The final quote-and-book step depends on Platform API service-request
    // creation, which partner 116 is not yet entitled to (FLAG F-1). Rather
    // than fabricate pricing or availability, the member is handed to a
    // request page that DSN staff action directly.
    router.push("/book/request");
  }

  function handleBack() {
    router.push("/book");
  }

  if (!bookingState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingStepIndicator currentStep={2} />

      <div className="section-container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="heading-lg text-navy mb-1">Choose your shop</h1>
              <p className="text-gray-500 font-opensans text-sm">
                Showing certified shops near{" "}
                <span className="font-semibold text-navy">{bookingState.zipCode}</span>
                {" "}within{" "}
                <span className="font-semibold text-navy">{bookingState.radius || 25} miles</span>
              </p>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy font-opensans transition-colors mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Service summary pill */}
          <div className="mb-6 inline-flex items-center gap-2 bg-teal/10 border border-teal/20 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 rounded-full bg-teal" />
            <span className="text-sm font-opensans text-teal font-semibold">
              {bookingState.selectedServiceName}
            </span>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-teal border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-opensans">Searching for service facilities near the vehicle…</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="bg-white rounded-xl shadow-card p-8 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="font-montserrat font-semibold text-navy mb-2">Search Failed</h3>
              <p className="text-gray-500 font-opensans text-sm mb-4">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => searchShops(bookingState)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && hasSearched && shops.length === 0 && (
            <div className="bg-white rounded-xl shadow-card p-8 text-center">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-montserrat font-semibold text-navy mb-2">No Shops Found</h3>
              <p className="text-gray-500 font-opensans text-sm mb-4">
                No certified shops were found near {bookingState.zipCode} within{" "}
                {bookingState.radius || 25} miles. Try expanding your search radius.
              </p>
              <Button variant="outline" size="sm" onClick={handleBack}>
                Adjust Search
              </Button>
            </div>
          )}

          {/* Shops list */}
          {!loading && !error && shops.length > 0 && (
            <>
              <p className="text-xs text-gray-400 font-opensans mb-4">
                {shops.length} shop{shops.length !== 1 ? "s" : ""} found
              </p>
              <div className="space-y-3">
                {shops.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => selectShop(shop)}
                    className={cn(
                      "w-full text-left bg-white rounded-xl shadow-card p-5 transition-all duration-200 border-2",
                      selectedShopId === shop.id
                        ? "border-teal ring-2 ring-teal/20"
                        : "border-transparent hover:border-teal/30 hover:shadow-card-hover"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-montserrat font-bold text-navy text-base leading-tight truncate">
                            {shop.name}
                          </h3>
                          {selectedShopId === shop.id && (
                            <CheckCircle className="w-4 h-4 text-teal flex-shrink-0" />
                          )}
                        </div>

                        {shop.rating && shop.rating > 0 && (
                          <div className="mb-2">
                            <StarRating rating={shop.rating} count={shop.reviewCount} />
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 font-opensans">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {shop.address}, {shop.city}, {shop.state} {shop.zip}
                          </span>
                          {shop.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {shop.phone}
                            </span>
                          )}
                        </div>

                        {shop.services && shop.services.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {shop.services.slice(0, 5).map((svc, i) => (
                              <span
                                key={i}
                                className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-opensans"
                              >
                                {svc}
                              </span>
                            ))}
                            {shop.services.length > 5 && (
                              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full font-opensans">
                                +{shop.services.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {shop.distance !== undefined && shop.distance !== null && (
                        <div className="flex-shrink-0 text-right">
                          <div className="font-montserrat font-bold text-navy text-lg leading-none">
                            {shop.distance < 1
                              ? `${(shop.distance * 5280).toFixed(0)} ft`
                              : `${shop.distance.toFixed(1)}`}
                          </div>
                          {shop.distance >= 1 && (
                            <div className="text-xs text-gray-400 font-opensans">miles</div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          {!loading && shops.length > 0 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <Button variant="ghost" size="md" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleContinue}
                disabled={!selectedShopId}
                className="flex-1 sm:flex-none"
              >
                Book at This Shop
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
