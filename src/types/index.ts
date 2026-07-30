/**
 * Drive Service Network — Shared TypeScript Types
 * Global Drive Holdings Inc.
 */

// ============================================================
// ENVIRONMENT
// ============================================================

export type AppEnvironment = "development" | "staging" | "production";

export interface AppConfig {
  env: AppEnvironment;
  appUrl: string;
  appName: string;
  openbayPartnerId: string;
  features: {
    membership: boolean;
    booking: boolean;
    fleetPortal: boolean;
    financing: boolean;
  };
}

// ============================================================
// NAVIGATION
// ============================================================

export interface NavLink {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
}

// ============================================================
// MEMBERSHIP
// ============================================================

export type MembershipTier = "FREE" | "BASIC" | "PROFESSIONAL" | "ENTERPRISE";

export interface MembershipPlan {
  tier: MembershipTier;
  name: string;
  price: number | null;
  annualPrice: number | null;
  description: string;
  features: string[];
  maxVehicles: number | null;
}

// ============================================================
// FLEET
// ============================================================

export type FleetType =
  | "TURO_HOST"
  | "RENTAL_OPERATOR"
  | "COMMERCIAL_FLEET"
  | "DEALER"
  | "CORPORATE"
  | "MUNICIPAL"
  | "OTHER";

export interface FleetProfile {
  id: string;
  name: string;
  type: FleetType;
  vehicleCount: number;
  membershipTier: MembershipTier;
}

// ============================================================
// SERVICE BOOKING
// ============================================================

export interface ServiceSearchParams {
  zipCode: string;
  radius?: number;
  serviceId?: number;
  vehicleMake?: string;
  vehicleYear?: number;
}

export interface BookingFormData {
  vehicleId?: string;
  serviceId: number;
  shopId: string;
  timeslotId: string;
  notes?: string;
}

// ============================================================
// CONTACT
// ============================================================

export type InquiryType =
  | "general"
  | "membership"
  | "fleet"
  | "partnership"
  | "support";

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  inquiryType: InquiryType;
}

// ============================================================
// API RESPONSES
// ============================================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
