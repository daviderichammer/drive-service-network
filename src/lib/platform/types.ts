/**
 * Openbay Platform API — Type Definitions
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * These types mirror the Openbay Platform API OpenAPI schema published at
 * https://api-staging.openbay.com/docs-json (retrieved 2026-08-20).
 *
 * IMPORTANT: The Openbay *Partner* API is obsolete for DSN and has been removed
 * in its entirety. Nothing in this module may be derived from Partner API
 * shapes, field names or workflow assumptions. See REVAMP BUILD section 2.
 */

// ============================================================
// USERS ("drivers" in Platform API terminology)
// ============================================================

export interface PlatformCreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password?: string;
  passwordConfirm?: string;
  /**
   * Coverage program-plan id. DSN does not currently have a discoverable plan
   * catalogue — see FLAGS_FOR_DAVID.md F-2 / F-9. Left unset for FREE members.
   */
  planId?: number;
  start?: string;
  end?: string;
  sendActivationEmail?: boolean;
}

export interface PlatformCreateUserResponse {
  /** users.users.id — the stack user id. Persist this as openbayUserId. */
  userId: number;
  /** false when an existing driver was assigned rather than newly provisioned. */
  created: boolean;
}

export interface PlatformUser {
  userId: number;
  legacyId: number;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  zipCode?: string;
  vehicleCount?: number;
  activeSubscriptions?: number;
}

export interface PlatformUpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  zipCode?: string;
}

// ============================================================
// VEHICLE CATALOG
// ============================================================

export interface CatalogYear {
  id: number;
  name: string;
}

export interface CatalogMake {
  id: number;
  name: string;
  slug: string;
}

export interface CatalogModel {
  id: number;
  name: string;
  slug: string;
}

export interface CatalogSubModel {
  id: number;
  name: string;
  slug: string;
}

export interface CatalogTrim {
  /** This id is the `vehicleId` used when creating an owned vehicle. */
  id: number;
  openbay_id: string;
  name: string;
  trim: string;
}

export interface ZipcodeArea {
  zipcode: string;
  city: string;
  state: string;
}

// ============================================================
// OWNED VEHICLES
// ============================================================

export interface PlatformCreateVehicleRequest {
  /** Required for API-key callers. */
  userId: number;
  /** Provide vin OR vehicleId. */
  vin?: string;
  /** Resolved Edmunds style/trim id from the catalog cascade. */
  vehicleId?: number;
  zipCode: string;
  mileage?: number;
}

export interface PlatformUpdateVehicleRequest {
  vin?: string;
  zipCode?: string;
  mileage?: number;
  licensePlate?: string;
}

export interface PlatformVehicle {
  ownedVehicleId: number;
  userId: number | null;
  legacyUserId: number;
  vin: string | null;
  year: string | number | null;
  make: string | null;
  model: string | null;
  /** Full style/trim name, e.g. "RWD 4dr Extended Cab Pickup (3.5L 6cyl 6AT)". */
  styleName: string | null;
  styleId: number | null;
  zipcode: string | null;
  mileage: number | null;
  licensePlate: string | null;
}

// ============================================================
// SERVICES + GUIDED SELECTION (interview questions)
// ============================================================

export interface PlatformService {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  description: string;
  autoquotable: boolean;
}

export interface PlatformServiceCategory {
  id: number;
  name: string;
  serviceCount: number;
}

/**
 * A node in the guided service-selection tree.
 *
 * Semantics (verified against staging): `question` is the prompt used to choose
 * among this node's `children`. A node whose `question` is null is terminal and
 * `serviceId` is the resolved service. Answers accumulated while walking the
 * tree are posted back as InterviewAnswer[] on the service request.
 */
export interface ServiceSelectionNode {
  id: number;
  answer: string;
  question: string | null;
  serviceId: number;
  serviceName: string;
  icon: string;
  tooltipLabel: string;
  tooltipBody: string;
  weight: number;
  children: ServiceSelectionNode[];
}

export interface ServiceSelectionCategory {
  id: number;
  name: string;
  nodes: ServiceSelectionNode[];
}

export interface InterviewAnswer {
  question: string;
  answer: string;
}

// ============================================================
// SERVICE REQUESTS + OFFERS
// ============================================================

export interface ServiceRequestServiceInput {
  serviceId: number;
  interview?: InterviewAnswer[];
}

export interface PlatformCreateServiceRequest {
  userId: number;
  ownedVehicleId: number;
  zipcode: string;
  serviceIds?: number[];
  services?: ServiceRequestServiceInput[];
  notes?: string;
}

export interface PlatformCreatedServiceRequest {
  id: number;
  autoquotable: boolean;
  zipcode: string;
  ownedVehicleId: number;
}

export type ServiceRequestState =
  | "expired"
  | "withdrawn"
  | "settled"
  | "accepted"
  | "open_for_offers";

export interface PlatformServiceRequest {
  serviceRequestId: number;
  openbayId: string;
  userId: number | null;
  ownedVehicleId: number;
  serviceRequestState?: string;
  hasOffers: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  appointmentAt?: string | null;
  adminConfirmedAt?: string | null;
  acceptedShopName?: string | null;
  acceptedShopAddress?: string | null;
  acceptedShopCity?: string | null;
  acceptedShopState?: string | null;
  acceptedShopZipcode?: string | null;
  acceptedShopPhone?: string | null;
  acceptedPriceCents?: number | null;
  vin?: string | null;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  engine?: string | null;
  styleName?: string | null;
}

export interface OfferLineItem {
  id: number;
  description: string;
  variant: string;
  quantity: number;
  unitPriceCents: number;
  extendedPriceCents: number;
}

export interface PlatformOffer {
  id: number;
  serviceRequestId: number;
  locationId: number;
  businessName: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  distanceMiles: number;
  rating: number;
  reviewCount: number;
  totalPriceCents: number;
  accepted: boolean;
  /**
   * NOTE: this is the discount already applied to totalPriceCents. It is NOT a
   * separate DSN+ member price. See FLAGS_FOR_DAVID.md F-8.
   */
  totalDiscountCents: number;
  currency: string;
  lineItems: OfferLineItem[];
}

export interface PlatformAppointmentSlot {
  /** Opaque key passed back when accepting an offer. */
  key: string;
  day: string;
  slotTitle: string;
}

// ============================================================
// LOCATIONS / FACILITIES
// ============================================================

export interface PlatformLocationSearchItem {
  id: number;
  slug: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  ratingAverage: number;
  ratingCount: number;
  doesHouseCalls: boolean;
  logoUrl?: string | null;
}

export interface PlatformLocationSearchResponse {
  total: number;
  radius: number;
  zipcode: string;
  centroid: { lat: number; lon: number };
  locations: PlatformLocationSearchItem[];
}

export interface PlatformDayHours {
  open: string | null;
  close: string | null;
}

export interface PlatformLocationDetail {
  id: number;
  openbay_id: string;
  name: string;
  about_us: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zipcode: string;
  lat: number;
  lon: number;
  phone_number: string;
  timezone: string;
  mobile_mechanic: boolean;
  internal_rating_average: number;
  internal_rating_count: number;
  amenities: string[];
  certifications: string[];
  business_highlights: string[];
  discounts: string[];
  transportation: string[];
  languages: string[];
  customer_perks: string[];
  top_services: string[];
  service_ids: number[];
  warranty_overview: string;
  monday?: PlatformDayHours;
  tuesday?: PlatformDayHours;
  wednesday?: PlatformDayHours;
  thursday?: PlatformDayHours;
  friday?: PlatformDayHours;
  saturday?: PlatformDayHours;
  sunday?: PlatformDayHours;
}

// ============================================================
// ERRORS
// ============================================================

export interface PlatformApiError {
  code: string;
  message: string;
  statusCode: number;
  /**
   * True when the failure is an Openbay entitlement problem rather than a bad
   * request. Surfaces the F-1 class of issues distinctly in logs.
   */
  entitlement?: boolean;
}
