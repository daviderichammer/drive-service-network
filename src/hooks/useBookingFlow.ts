"use client";

/**
 * useBookingFlow — Client-side state management for the multi-step booking flow.
 * Persists state in sessionStorage so users can navigate between steps without losing data.
 */
import { useState, useEffect, useCallback } from "react";

export interface VehicleInfo {
  year: string;
  make: string;
  model: string;
  vin?: string;
  mileage?: string;
}

export interface BookingFlowState {
  // Step 1: What do you need?
  zipCode: string;
  radius: number;
  selectedServiceId: number | null;
  selectedServiceName: string;
  selectedCategory: string;

  // Step 2: Choose your shop
  selectedShopId: string;
  selectedShopName: string;
  selectedShopAddress: string;
  selectedShopCity: string;
  selectedShopState: string;
  selectedShopPhone: string;
  selectedShopRating: number | null;

  // Step 3: Book your appointment
  vehicle: VehicleInfo;
  selectedTimeslotId: string;
  selectedTimeslotDate: string;
  selectedTimeslotTime: string;
  notes: string;

  // User info (guest booking)
  firstName: string;
  lastName: string;
  email: string;

  // Openbay user ID (created during booking)
  openbayUserId: string;

  // Current step
  currentStep: 1 | 2 | 3;
}

const STORAGE_KEY = "dsn_booking_flow";

const defaultState: BookingFlowState = {
  zipCode: "",
  radius: 25,
  selectedServiceId: null,
  selectedServiceName: "",
  selectedCategory: "",
  selectedShopId: "",
  selectedShopName: "",
  selectedShopAddress: "",
  selectedShopCity: "",
  selectedShopState: "",
  selectedShopPhone: "",
  selectedShopRating: null,
  vehicle: { year: "", make: "", model: "" },
  selectedTimeslotId: "",
  selectedTimeslotDate: "",
  selectedTimeslotTime: "",
  notes: "",
  firstName: "",
  lastName: "",
  email: "",
  openbayUserId: "",
  currentStep: 1,
};

export function useBookingFlow() {
  const [state, setState] = useState<BookingFlowState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<BookingFlowState>;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist to sessionStorage on every state change
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  const update = useCallback((updates: Partial<BookingFlowState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setState(defaultState);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const goToStep = useCallback((step: 1 | 2 | 3) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  return { state, update, reset, goToStep, hydrated };
}
