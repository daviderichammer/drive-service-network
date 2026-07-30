/**
 * Openbay API Client — Server-Side Proxy
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * SECURITY: This module runs EXCLUSIVELY on the server.
 * The API key is NEVER exposed to the client.
 * All Openbay calls are proxied through Next.js API routes.
 *
 * API Base: https://openbay.driveservicenetwork.com
 * Partner ID: 116
 *
 * Actual endpoint structure (from staging demo):
 *   GET  /api/services
 *   POST /api/locations/search  { zipcode, locationType, max_results, radius }
 *   GET  /api/locations/:id
 *   POST /api/locations/:id/timeslots  { number_of_days }
 *   POST /api/users  { email, first_name, last_name, zipcode }
 *   POST /api/appointments  { user_id, location_id, scheduled_time, vehicle_year, vehicle_make, vehicle_model, vehicle_mileage, appointment_type, notes, services }
 *   GET  /api/appointments  { user_id }
 *   POST /api/users/:id/sso-link  { dayDuration }
 */
import axios, { AxiosInstance, AxiosError } from "axios";

// ============================================================
// TYPES
// ============================================================

export interface OpenbayService {
  id: number;
  name: string;
  category: string;
  requiresCategory?: string;
}

export interface OpenbayLocation {
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
  latitude?: number;
  longitude?: number;
  hours?: Record<string, string>;
}

export interface OpenbayTimeslot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  datetime?: string;
  proposedTime?: string;
  fullTitle?: string;
}

export interface OpenbayUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  zipCode: string;
}

export interface OpenbaySubscription {
  id: string;
  userId: string;
  status: string;
  startDate: string;
  endDate?: string;
  partnerRefId?: string;
}

export interface OpenbayAppointment {
  id: string;
  userId: string;
  shopId: string;
  serviceId: number;
  timeslotId: string;
  status: string;
  scheduledAt: string;
  confirmationNumber?: string;
  shopName?: string;
  serviceName?: string;
}

export interface OpenbaySearchParams {
  zipCode: string;
  radius?: number;
  serviceType?: "appointment" | "oil_change";
  vehicleMake?: string;
  serviceId?: number;
}

export interface CreateUserParams {
  firstName: string;
  lastName: string;
  email: string;
  zipCode: string;
}

export interface CreateSubscriptionParams {
  userId: string;
  startDate?: string;
  endDate?: string;
  partnerRefId?: string;
}

export interface BookAppointmentParams {
  userId: string;
  shopId: string;
  serviceId: number;
  timeslotId: string;
  vehicleId?: string;
  notes?: string;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleMileage?: string;
  scheduledTime?: string;
}

export interface OpenbayApiError {
  code: string;
  message: string;
  statusCode: number;
}

// ============================================================
// RAW API TYPES (staging server response shapes)
// ============================================================

interface RawService {
  id: number;
  name: string;
  category?: string;
  ability_requirements?: Array<{ category_name?: string; category_full_name?: string }>;
}

interface RawLocation {
  openbay_id: string;
  name: string;
  address_1?: string;
  address_2?: string;
  city: string;
  state: string;
  zipcode?: string;
  phone_number?: string;
  review_rating?: number;
  review_count?: number;
  distance?: number;
  latitude?: number;
  longitude?: number;
  monday?: { open: string | null; close: string | null };
  tuesday?: { open: string | null; close: string | null };
  wednesday?: { open: string | null; close: string | null };
  thursday?: { open: string | null; close: string | null };
  friday?: { open: string | null; close: string | null };
  saturday?: { open: string | null; close: string | null };
  sunday?: { open: string | null; close: string | null };
}

interface RawTimeslot {
  day: string;
  key: string;
  slot_title: string;
  proposed_time: string;
  full_slot_title: string;
}

// ============================================================
// TRANSFORMERS
// ============================================================

function transformService(raw: RawService): OpenbayService {
  const category =
    raw.category ||
    raw.ability_requirements?.[0]?.category_name ||
    raw.ability_requirements?.[0]?.category_full_name ||
    "Other";
  return {
    id: raw.id,
    name: raw.name.trim(),
    category,
  };
}

function transformLocation(raw: RawLocation): OpenbayLocation {
  return {
    id: raw.openbay_id,
    name: raw.name,
    address: [raw.address_1, raw.address_2].filter(Boolean).join(", "),
    city: raw.city,
    state: raw.state,
    zip: raw.zipcode || "",
    phone: raw.phone_number,
    rating: raw.review_rating || undefined,
    reviewCount: raw.review_count || undefined,
    distance: raw.distance,
    latitude: raw.latitude,
    longitude: raw.longitude,
  };
}

function transformTimeslot(raw: RawTimeslot): OpenbayTimeslot {
  // Extract time from proposed_time ISO string
  const timeMatch = raw.proposed_time.match(/T(\d{2}:\d{2})/);
  const time = timeMatch ? timeMatch[1] : raw.slot_title.trim();

  return {
    id: raw.key,
    date: raw.day,
    time,
    available: true,
    datetime: raw.proposed_time,
    proposedTime: raw.proposed_time,
    fullTitle: raw.full_slot_title,
  };
}

// ============================================================
// CLIENT
// ============================================================

class OpenbayClient {
  private client: AxiosInstance;
  private partnerId: string;
  private environment: string;

  constructor() {
    const baseURL = process.env.OPENBAY_API_BASE_URL;
    const apiKey = process.env.OPENBAY_API_KEY;
    this.partnerId = process.env.OPENBAY_PARTNER_ID || "116";
    this.environment = process.env.OPENBAY_ENVIRONMENT || "staging";

    if (!baseURL) {
      throw new Error("OPENBAY_API_BASE_URL environment variable is not set");
    }

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Openbay uses 'Api-Key ob_xxx' format for the staging API
        // If the key already starts with 'Api-Key' or 'Bearer', use as-is
        ...(apiKey && {
          Authorization: apiKey.startsWith("Api-Key ") || apiKey.startsWith("Bearer ")
            ? apiKey
            : `Api-Key ${apiKey}`,
        }),
        "X-Partner-ID": this.partnerId,
      },
    });

    // Request interceptor for logging in development
    if (process.env.NODE_ENV === "development") {
      this.client.interceptors.request.use((config) => {
        console.log(`[Openbay] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      });
    }

    // Response interceptor for error normalization
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: OpenbayApiError = {
          code: "OPENBAY_ERROR",
          message: "An error occurred with the Openbay API",
          statusCode: error.response?.status || 500,
        };

        if (error.response?.data) {
          const data = error.response.data as Record<string, unknown>;
          apiError.message = (data.message as string) || apiError.message;
          apiError.code = (data.code as string) || apiError.code;
        }

        if (process.env.NODE_ENV === "development") {
          console.error("[Openbay Error]", apiError);
        }

        return Promise.reject(apiError);
      }
    );
  }

  // ============================================================
  // SERVICES
  // ============================================================

  async getServices(): Promise<OpenbayService[]> {
    const response = await this.client.get("/partners/v2/partner-api/services");
    const raw: RawService[] = response.data?.services || response.data || [];
    return Array.isArray(raw) ? raw.map(transformService) : [];
  }

  // ============================================================
  // LOCATIONS / SHOPS
  // ============================================================

  async searchLocations(params: OpenbaySearchParams): Promise<OpenbayLocation[]> {
    const response = await this.client.post("/partners/v2/partner-locations", {
      zipcode: params.zipCode,
      radius: params.radius || 25,
      locationType: params.serviceType === "oil_change" ? "oil" : "appointment",
      max_results: 20,
      ...(params.vehicleMake && { vehicle_make: params.vehicleMake }),
    });
    const raw: RawLocation[] = Array.isArray(response.data) ? response.data : (response.data?.locations || []);
    return raw.map(transformLocation);
  }

  async getLocationDetails(shopId: string): Promise<OpenbayLocation> {
    const response = await this.client.get(`/partners/v2/partner-locations/${shopId}`);
    return transformLocation(response.data as RawLocation);
  }

  async getTimeslots(
    shopId: string,
    _serviceId: number,
    _date?: string,
    numberOfDays?: number
  ): Promise<OpenbayTimeslot[]> {
    const response = await this.client.post(
      `/partners/v2/partner-locations/${shopId}/time-slots`,
      {
        location_id: shopId,
        number_of_days: numberOfDays || 14,
      }
    );
    const raw: RawTimeslot[] =
      response.data?.slots ||
      response.data?.time_slots ||
      response.data?.timeslots ||
      (Array.isArray(response.data) ? response.data : []);
    return Array.isArray(raw) ? raw.map(transformTimeslot) : [];
  }

  // ============================================================
  // USERS
  // ============================================================

  async createUser(params: CreateUserParams): Promise<OpenbayUser> {
    const response = await this.client.post("/partners/v2/partner-api/users", {
      first_name: params.firstName,
      last_name: params.lastName,
      email: params.email,
      zipcode: params.zipCode,
    });
    const data = response.data;
    return {
      id: String(data.user_id || data.id || ""),
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      zipCode: params.zipCode,
    };
  }

  async getUser(userId: string): Promise<OpenbayUser> {
    const response = await this.client.get(`/partners/v1/partner-users/${userId}`);
    const data = response.data;
    return {
      id: String(data.user_id || data.id || userId),
      email: data.email || "",
      firstName: data.first_name || "",
      lastName: data.last_name || "",
      zipCode: data.zipcode || "",
    };
  }

  async generateSSOLink(userId: string): Promise<{ url: string }> {
    const response = await this.client.post(
      `/partners/v1/partner-users/${userId}/service-request-link`,
      { dayDuration: 7 }
    );
    return response.data;
  }

  // ============================================================
  // SUBSCRIPTIONS
  // ============================================================

  async createSubscription(
    params: CreateSubscriptionParams
  ): Promise<OpenbaySubscription> {
    const response = await this.client.post("/partners/v2/partner-api/subscriptions", {
      user_id: params.userId,
      start_date: params.startDate,
      end_date: params.endDate,
      partner_ref_id: params.partnerRefId,
    });
    return response.data;
  }

  async getSubscriptions(userId?: string): Promise<OpenbaySubscription[]> {
    const response = await this.client.get(
      userId
        ? `/partners/v2/partner-api/subscriptions/user/${userId}`
        : "/partners/v2/partner-api/subscriptions"
    );
    return response.data?.subscriptions || response.data || [];
  }

  // ============================================================
  // APPOINTMENTS
  // ============================================================

  async bookAppointment(
    params: BookAppointmentParams
  ): Promise<OpenbayAppointment> {
    const response = await this.client.post("/partners/v2/partner-api/appointments", {
      user_id: Number(params.userId),
      location_id: params.shopId,
      scheduled_time: params.scheduledTime || params.timeslotId,
      vehicle_year: params.vehicleYear ? parseInt(params.vehicleYear) : undefined,
      vehicle_make: params.vehicleMake,
      vehicle_model: params.vehicleModel,
      vehicle_mileage: params.vehicleMileage ? parseInt(params.vehicleMileage) : undefined,
      appointment_type: "service",
      notes: params.notes || "",
      services: params.serviceId ? [params.serviceId] : [],
    });
    const data = response.data?.appointment || response.data;
    return {
      id: String(data.id || data.appointment_id || ""),
      userId: params.userId,
      shopId: params.shopId,
      serviceId: params.serviceId,
      timeslotId: params.timeslotId,
      status: data.appointment_status || data.status || "confirmed",
      scheduledAt: data.scheduled_at || params.timeslotId,
      confirmationNumber: String(data.id || data.appointment_id || ""),
    };
  }

  async getAppointments(userId?: string): Promise<OpenbayAppointment[]> {
    const response = await this.client.get("/partners/v2/partner-api/appointments", {
      params: userId ? { user_id: userId } : undefined,
    });
    return response.data?.appointments || response.data || [];
  }
}

// Singleton instance — server-side only
let openbayClient: OpenbayClient | null = null;

export function getOpenbayClient(): OpenbayClient {
  if (!openbayClient) {
    openbayClient = new OpenbayClient();
  }
  return openbayClient;
}

export default OpenbayClient;
