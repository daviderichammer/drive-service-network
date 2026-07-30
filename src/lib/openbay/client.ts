/**
 * Openbay API Client — Server-Side Proxy
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * SECURITY: This module runs EXCLUSIVELY on the server.
 * The API key is NEVER exposed to the client.
 * All Openbay calls are proxied through Next.js API routes.
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
}

export interface OpenbayTimeslot {
  id: string;
  date: string;
  time: string;
  available: boolean;
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
}

export interface OpenbayApiError {
  code: string;
  message: string;
  statusCode: number;
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
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
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
    const response = await this.client.get(
      "/partners/v2/partner-api/services"
    );
    return response.data?.services || response.data || [];
  }

  // ============================================================
  // LOCATIONS / SHOPS
  // ============================================================

  async searchLocations(params: OpenbaySearchParams): Promise<OpenbayLocation[]> {
    const response = await this.client.get("/partners/v2/partner-locations", {
      params: {
        zip: params.zipCode,
        radius: params.radius || 25,
        service_type: params.serviceType || "appointment",
        ...(params.vehicleMake && { make: params.vehicleMake }),
        ...(params.serviceId && { service_id: params.serviceId }),
      },
    });
    return response.data?.locations || response.data || [];
  }

  async getLocationDetails(shopId: string): Promise<OpenbayLocation> {
    const response = await this.client.get(
      `/partners/v2/partner-locations/${shopId}`
    );
    return response.data;
  }

  async getTimeslots(
    shopId: string,
    serviceId: number,
    date?: string
  ): Promise<OpenbayTimeslot[]> {
    const response = await this.client.post(
      `/partners/v2/partner-locations/${shopId}/timeslots`,
      {
        service_id: serviceId,
        date: date || new Date().toISOString().split("T")[0],
      }
    );
    return response.data?.timeslots || response.data || [];
  }

  // ============================================================
  // USERS
  // ============================================================

  async createUser(params: CreateUserParams): Promise<OpenbayUser> {
    const response = await this.client.post(
      "/partners/v2/partner-api/users",
      {
        first_name: params.firstName,
        last_name: params.lastName,
        email: params.email,
        zip_code: params.zipCode,
      }
    );
    return response.data;
  }

  async getUser(userId: string): Promise<OpenbayUser> {
    const response = await this.client.get(
      `/partners/v2/partner-api/users/${userId}`
    );
    return response.data;
  }

  async generateSSOLink(userId: string): Promise<{ url: string }> {
    const response = await this.client.post(
      `/partners/v1/partner-users/${userId}/service-request-link`
    );
    return response.data;
  }

  // ============================================================
  // SUBSCRIPTIONS
  // ============================================================

  async createSubscription(
    params: CreateSubscriptionParams
  ): Promise<OpenbaySubscription> {
    const response = await this.client.post(
      "/partners/v2/partner-api/subscriptions",
      {
        user_id: params.userId,
        start_date: params.startDate,
        end_date: params.endDate,
        partner_ref_id: params.partnerRefId,
      }
    );
    return response.data;
  }

  async getSubscriptions(userId?: string): Promise<OpenbaySubscription[]> {
    const response = await this.client.get(
      "/partners/v2/partner-api/subscriptions",
      {
        params: userId ? { user_id: userId } : undefined,
      }
    );
    return response.data?.subscriptions || response.data || [];
  }

  // ============================================================
  // APPOINTMENTS
  // ============================================================

  async bookAppointment(
    params: BookAppointmentParams
  ): Promise<OpenbayAppointment> {
    const response = await this.client.post(
      "/partners/v2/partner-api/appointments",
      {
        user_id: params.userId,
        shop_id: params.shopId,
        service_id: params.serviceId,
        timeslot_id: params.timeslotId,
        vehicle_id: params.vehicleId,
        notes: params.notes,
      }
    );
    return response.data;
  }

  async getAppointments(userId?: string): Promise<OpenbayAppointment[]> {
    const response = await this.client.get(
      "/partners/v2/partner-api/appointments",
      {
        params: userId ? { user_id: userId } : undefined,
      }
    );
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
