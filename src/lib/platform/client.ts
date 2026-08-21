/**
 * Openbay Platform API Client — Server-Side Only
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * SECURITY (REVAMP BUILD section 36): this module runs EXCLUSIVELY on the
 * server. The Platform API key is never sent to, or referenced by, the browser.
 * Every browser-originated call goes through a Next.js route handler under
 * /api/platform/* which re-authorises against the DSN session first.
 *
 * Base URL:  https://api-staging.openbay.com   (staging)
 * Auth:      Authorization: Bearer pk_…
 * Partner:   116
 *
 * The obsolete Openbay Partner API (/partners/v2/partner-api/*) has been
 * removed from this codebase in its entirety per REVAMP BUILD section 2.
 */
import "server-only";

import type {
  CatalogMake,
  CatalogModel,
  CatalogSubModel,
  CatalogTrim,
  CatalogYear,
  PlatformAppointment,
  PlatformAppointmentListResponse,
  PlatformAppointmentSlot,
  PlatformApiError,
  PlatformCreateAppointmentRequest,
  PlatformCreatedAppointment,
  PlatformServiceCatalogResponse,
  PlatformTimeSlotSearchResponse,
  PlatformCreateServiceRequest,
  PlatformCreateUserRequest,
  PlatformCreateUserResponse,
  PlatformCreateVehicleRequest,
  PlatformCreatedServiceRequest,
  PlatformLocationDetail,
  PlatformLocationSearchResponse,
  PlatformOffer,
  PlatformService,
  PlatformServiceCategory,
  PlatformServiceRequest,
  PlatformUpdateUserRequest,
  PlatformUpdateVehicleRequest,
  PlatformUser,
  PlatformVehicle,
  ServiceSelectionCategory,
  ZipcodeArea,
} from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;

export class PlatformApiRequestError extends Error implements PlatformApiError {
  code: string;
  statusCode: number;
  entitlement: boolean;
  endpoint: string;

  constructor(init: {
    code: string;
    message: string;
    statusCode: number;
    entitlement?: boolean;
    endpoint: string;
  }) {
    super(init.message);
    this.name = "PlatformApiRequestError";
    this.code = init.code;
    this.statusCode = init.statusCode;
    this.entitlement = init.entitlement ?? false;
    this.endpoint = init.endpoint;
  }
}

type QueryValue = string | number | boolean | undefined | null;

function buildQuery(params?: Record<string, QueryValue>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

class PlatformApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  readonly partnerId: string;
  readonly environment: string;

  constructor() {
    const baseUrl = process.env.OPENBAY_PLATFORM_API_BASE_URL;
    const apiKey = process.env.OPENBAY_PLATFORM_API_KEY;

    if (!baseUrl) {
      throw new Error("OPENBAY_PLATFORM_API_BASE_URL is not set");
    }
    if (!apiKey) {
      throw new Error("OPENBAY_PLATFORM_API_KEY is not set");
    }

    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey.trim();
    this.partnerId = process.env.OPENBAY_PLATFORM_PARTNER_ID || "116";
    this.environment = process.env.OPENBAY_PLATFORM_ENVIRONMENT || "staging";
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    options: { query?: Record<string, QueryValue>; body?: unknown; timeoutMs?: number } = {}
  ): Promise<T> {
    const endpoint = `${path}${buildQuery(options.query)}`;
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    );

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (err) {
      clearTimeout(timeout);
      const aborted = err instanceof Error && err.name === "AbortError";
      console.error("[Platform API] network failure", { endpoint, method, aborted });
      throw new PlatformApiRequestError({
        code: aborted ? "PLATFORM_TIMEOUT" : "PLATFORM_NETWORK_ERROR",
        message: aborted
          ? "The service network did not respond in time."
          : "Unable to reach the service network.",
        statusCode: 503,
        endpoint,
      });
    } finally {
      clearTimeout(timeout);
    }

    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      const data = (payload ?? {}) as Record<string, unknown>;
      const rawMessage =
        typeof data.message === "string"
          ? data.message
          : Array.isArray(data.message)
            ? "Validation error"
            : typeof data.error === "string"
              ? data.error
              : "Openbay Platform API error";
      const entitlement =
        response.status === 403 && /not entitled/i.test(rawMessage);

      // Always logged server-side; never returned verbatim to the browser.
      console.error("[Platform API] error", {
        endpoint,
        method,
        status: response.status,
        message: rawMessage,
        entitlement,
      });

      throw new PlatformApiRequestError({
        code: typeof data.error === "string" ? data.error : "PLATFORM_ERROR",
        message: rawMessage,
        statusCode: response.status,
        entitlement,
        endpoint,
      });
    }

    return payload as T;
  }

  // ============================================================
  // USERS / MEMBERS
  // ============================================================

  /**
   * Create or assign a driver. An email that already belongs to a driver
   * assigns that existing driver and returns created:false — it does not fail.
   */
  createUser(body: PlatformCreateUserRequest): Promise<PlatformCreateUserResponse> {
    return this.request("POST", "/users/v2/users", { body });
  }

  getUser(userId: number): Promise<PlatformUser> {
    return this.request("GET", `/users/v2/users/${userId}`);
  }

  updateUser(userId: number, body: PlatformUpdateUserRequest): Promise<unknown> {
    return this.request("PUT", `/users/v2/users/${userId}`, { body });
  }

  lookupUsers(filter: string, take = 20): Promise<PlatformUser[]> {
    return this.request("GET", "/users/v2/users/lookup", { query: { filter, take } });
  }

  // ============================================================
  // VEHICLE CATALOG (year → make → model → sub-model → trim)
  // ============================================================

  getCatalogYears(): Promise<CatalogYear[]> {
    return this.request("GET", "/vehicles/v1/catalog/years");
  }

  getCatalogMakes(year: number): Promise<CatalogMake[]> {
    return this.request("GET", "/vehicles/v1/catalog/makes", { query: { year } });
  }

  getCatalogModels(year: number, makeId: number): Promise<CatalogModel[]> {
    return this.request("GET", "/vehicles/v1/catalog/models", { query: { year, makeId } });
  }

  getCatalogSubModels(
    year: number,
    makeId: number,
    modelId: number
  ): Promise<CatalogSubModel[]> {
    return this.request("GET", "/vehicles/v1/catalog/sub-models", {
      query: { year, makeId, modelId },
    });
  }

  getCatalogTrims(
    year: number,
    makeId: number,
    modelId: number,
    subModelId: number
  ): Promise<CatalogTrim[]> {
    return this.request("GET", "/vehicles/v1/catalog/trims", {
      query: { year, makeId, modelId, subModelId },
    });
  }

  lookupZipcode(term: string): Promise<ZipcodeArea[]> {
    return this.request("GET", "/vehicles/v1/catalog/zipcode", { query: { term } });
  }

  // ============================================================
  // OWNED VEHICLES
  // ============================================================

  createVehicle(body: PlatformCreateVehicleRequest): Promise<PlatformVehicle> {
    return this.request("POST", "/vehicles/v1/vehicles", { body });
  }

  getVehicle(ownedVehicleId: number): Promise<PlatformVehicle> {
    return this.request("GET", `/vehicles/v1/vehicles/${ownedVehicleId}`);
  }

  updateVehicle(
    ownedVehicleId: number,
    body: PlatformUpdateVehicleRequest
  ): Promise<{ id: number; vin?: string; zipCode?: string; mileage?: number }> {
    return this.request("PUT", `/vehicles/v1/vehicles/${ownedVehicleId}`, { body });
  }

  deleteVehicle(ownedVehicleId: number): Promise<unknown> {
    return this.request("DELETE", `/vehicles/v1/vehicles/${ownedVehicleId}`);
  }

  // ============================================================
  // SERVICES + GUIDED SELECTION
  // ============================================================

  getServices(): Promise<PlatformService[]> {
    return this.request("GET", "/service-requests/v2/services");
  }

  getServiceCategories(): Promise<PlatformServiceCategory[]> {
    return this.request("GET", "/service-requests/v2/service-categories");
  }

  /** The authoritative source of DSN's service interview questions. */
  getServiceSelection(): Promise<ServiceSelectionCategory[]> {
    return this.request("GET", "/service-requests/v2/service-selection");
  }

  // ============================================================
  // SERVICE REQUESTS + OFFERS (Priority 2 — see FLAGS F-1)
  // ============================================================

  /**
   * NOT YET AVAILABLE. Partner 116 currently receives
   * 403 "Partner is not entitled to the service-request-generation feature."
   * Kept typed and ready; not wired to any customer-facing route.
   */
  createServiceRequest(
    body: PlatformCreateServiceRequest
  ): Promise<PlatformCreatedServiceRequest> {
    return this.request("POST", "/service-requests/v2/service-requests", { body });
  }

  getServiceRequest(id: number | string): Promise<PlatformServiceRequest> {
    return this.request("GET", `/service-requests/v2/service-requests/${id}`);
  }

  listServiceRequests(query: {
    userId?: number;
    ownedVehicleId?: number;
    take?: number;
    skip?: number;
    order?: string;
  }): Promise<{ data: PlatformServiceRequest[]; pagination: unknown }> {
    return this.request("GET", "/service-requests/v2/service-requests", { query });
  }

  getOffers(serviceRequestId: number): Promise<PlatformOffer[]> {
    return this.request(
      "GET",
      `/service-requests/v2/service-requests/${serviceRequestId}/offers`
    );
  }

  getServiceRequestSlots(
    serviceRequestId: number,
    locationId: number
  ): Promise<PlatformAppointmentSlot[]> {
    return this.request(
      "GET",
      `/service-requests/v2/service-requests/${serviceRequestId}/appointment-slots/${locationId}`
    );
  }

  acceptOffer(
    serviceRequestId: number,
    offerId: number,
    appointmentSlotKey: string
  ): Promise<{ success: boolean }> {
    return this.request(
      "PUT",
      `/service-requests/v2/service-requests/${serviceRequestId}/offers/${offerId}`,
      { body: { appointmentSlotKey } }
    );
  }

  // ============================================================
  // LOCATIONS / FACILITIES
  // ============================================================

  searchLocations(zipcode: string, radius = 20): Promise<PlatformLocationSearchResponse> {
    return this.request("GET", "/locations/v2/search", { query: { zipcode, radius } });
  }

  getLocation(locationId: number): Promise<PlatformLocationDetail> {
    return this.request("GET", `/locations/v2/${locationId}`);
  }

  /**
   * Facilities that are open at a specific time. Returns operating hours,
   * amenities, certifications and review data, plus the openbay_id slug that
   * the appointments endpoints require.
   */
  searchLocationsByTimeSlot(params: {
    zipcode: string;
    radius?: number;
    /** Offset-bearing ISO-8601, e.g. 2026-08-24T09:00:00-04:00 */
    timeSlot: string;
    locationType?: string;
  }): Promise<PlatformTimeSlotSearchResponse> {
    return this.request("GET", "/locations/v2/search/by-time-slot", {
      query: {
        zipcode: params.zipcode,
        radius: params.radius ?? 20,
        timeSlot: params.timeSlot,
        locationType: params.locationType ?? "oil",
      },
    });
  }

  // ============================================================
  // STANDALONE APPOINTMENTS — DSN'S WORKING BOOKING PATH
  //
  // Verified live 2026-08-21: creation returns 201 "confirmed" for Partner 116
  // even though service-request generation is refused (FLAG F-1). All of these
  // take the location's public openbay_id SLUG, not the numeric id.
  // ============================================================

  /** Real bookable availability for a facility, up to 14 days ahead. */
  getLocationSlots(
    locationSlug: string,
    numberOfDays = 14
  ): Promise<PlatformAppointmentSlot[]> {
    return this.request("GET", "/appointments/v2/appointments/slots", {
      query: { locationId: locationSlug, numberOfDays },
    });
  }

  /** Public (unauthenticated-equivalent) slot lookup — same shape. */
  getPublicLocationSlots(locationSlug: string): Promise<PlatformAppointmentSlot[]> {
    return this.request(
      "GET",
      `/appointments/v2/public/locations/${encodeURIComponent(locationSlug)}/slots`
    );
  }

  createAppointment(
    body: PlatformCreateAppointmentRequest
  ): Promise<PlatformCreatedAppointment> {
    return this.request("POST", "/appointments/v2/appointments", { body });
  }

  getAppointment(appointmentId: number): Promise<PlatformAppointment> {
    return this.request("GET", `/appointments/v2/appointments/${appointmentId}`);
  }

  listAppointments(query: {
    skip?: number;
    take?: number;
    filter?: string;
  } = {}): Promise<PlatformAppointmentListResponse> {
    return this.request("GET", "/appointments/v2/appointments", {
      query: {
        skip: query.skip ?? 0,
        take: query.take ?? 20,
        ...(query.filter ? { filter: query.filter } : {}),
      },
    });
  }

  rescheduleAppointment(
    appointmentId: number,
    scheduledTime: string
  ): Promise<unknown> {
    return this.request("PUT", `/appointments/v2/appointments/${appointmentId}`, {
      body: { scheduledTime },
    });
  }

  cancelAppointment(appointmentId: number): Promise<unknown> {
    return this.request("DELETE", `/appointments/v2/appointments/${appointmentId}`);
  }

  /** Services with the shop abilities each one requires. */
  getServiceCatalogWithAbilities(): Promise<PlatformServiceCatalogResponse> {
    return this.request("GET", "/service-requests/v2/services/catalog");
  }

  // ============================================================
  // INTERNAL SUPPORT ONLY — NOT FOR THE MEMBER JOURNEY
  // ============================================================

  /**
   * Returns Openbay-hosted portal2 links. These leave the DSN-branded
   * environment and therefore MUST NOT be used in the member journey
   * (REVAMP BUILD section 5, FLAGS_FOR_DAVID.md F-11). Retained solely as a
   * DSN staff troubleshooting aid.
   */
  createSupportLinks(
    userId: number,
    dayDuration = 7
  ): Promise<{ serviceRequestLink: string; dashboardLink: string; expiresAt: string }> {
    return this.request("POST", `/users/v2/users/${userId}/service-request-link`, {
      body: { dayDuration },
    });
  }
}

let client: PlatformApiClient | null = null;

export function getPlatformClient(): PlatformApiClient {
  if (!client) {
    client = new PlatformApiClient();
  }
  return client;
}

export type { PlatformApiClient };
