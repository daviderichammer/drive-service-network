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
  /** Offset-bearing ISO-8601 timestamp for the slot, e.g. 2026-08-24T09:00:00.000-04:00 */
  proposedTime?: string;
  /** Human-readable full title, e.g. "Monday Aug 24 at 9:00am". */
  fullSlotTitle?: string;
}

// ============================================================
// STANDALONE APPOINTMENTS
//
// VERIFIED 2026-08-21: POST /appointments/v2/appointments returns 201 for
// Partner 116, unlike service-request generation (FLAG F-1, still 403). This
// is therefore DSN's real, working booking path.
//
// CRITICAL: every appointments endpoint keys on the location's PUBLIC SLUG
// (`openbay_id`, e.g. "m8-3ww"), never the numeric locations/v2 id. Passing the
// numeric id yields 422 "could not find location".
// ============================================================

export type PlatformAppointmentType = "service" | "collision" | "car_wash" | "glass";

export interface PlatformCreateAppointmentRequest {
  /** Required for API-key callers. */
  userId: number;
  /** The location's public openbay_id slug. */
  locationId: string;
  /** Owned-vehicle id; overrides the loose vehicle fields. */
  vehicleId?: number;
  /** Offset-bearing ISO-8601, e.g. 2026-08-24T09:00:00-04:00 */
  scheduledTime: string;
  appointmentType: PlatformAppointmentType;
  phoneNumber?: string;
  services?: number[];
  notes?: string;
  vehicleYear?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleEngine?: string;
  vehicleTrim?: string;
  vehicleVin?: string;
  vehicleMileage?: number;
}

export interface PlatformCreatedAppointment {
  id: number;
  appointmentStatus: string;
}

export interface PlatformAppointmentService {
  id: number;
  name: string;
}

export interface PlatformAppointment {
  id: number;
  location_id: string;
  source?: string;
  scheduled_at: string;
  created_at: string;
  confirmed_at: string | null;
  services: PlatformAppointmentService[];
  notes: string | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  vehicle_year?: number | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_engine?: string | null;
  vehicle_trim?: string | null;
  vehicle_vin?: string | null;
  vehicle_mileage?: number | null;
  user_id?: number;
  appointment_status: string;
  appointment_type: string;
  location_name?: string;
  company_name?: string;
  location_address_1?: string;
  location_city?: string;
  location_state?: string;
  location_zipcode?: string;
}

export interface PlatformAppointmentListResponse {
  data: PlatformAppointment[];
  pagination?: unknown;
}

/** A facility returned by /locations/v2/search/by-time-slot. */
export interface PlatformTimeSlotLocation {
  name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  openbay_id: string;
  amenities: string[];
  certifications: string[];
  review_rating: number;
  review_count: number;
  franchise: boolean;
  labor_rate?: number | null;
  monday?: PlatformDayHours;
  tuesday?: PlatformDayHours;
  wednesday?: PlatformDayHours;
  thursday?: PlatformDayHours;
  friday?: PlatformDayHours;
  saturday?: PlatformDayHours;
  sunday?: PlatformDayHours;
}

export interface PlatformTimeSlotSearchResponse {
  total: number;
  radius: number;
  zipcode: string;
  timeSlot: string;
  locationType: string;
  locations: PlatformTimeSlotLocation[];
}

/** A service with the shop abilities it requires (services/catalog). */
export interface PlatformServiceAbility {
  id: number;
  name: string;
  category_full_name?: string;
  category_name?: string;
}

export interface PlatformCatalogService {
  id: number;
  name: string;
  category?: string;
  ability_requirements: PlatformServiceAbility[];
}

export interface PlatformServiceCatalogResponse {
  services: PlatformCatalogService[];
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
  /** Present on franchise locations; falls back for independent shops. */
  national_about_us?: string | null;
  national_warranty_overview?: string | null;
  warranty_highlights?: string[];
  business_highlights_list?: string[];
  header_image?: string | null;
  logo_image?: string | null;
  images?: string[];
  /** Spelled this way upstream. */
  poayment_methods?: string[];
  top_vehicles?: string[];
  facebook_url?: string | null;
  twitter_url?: string | null;
  country_code?: string;
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
