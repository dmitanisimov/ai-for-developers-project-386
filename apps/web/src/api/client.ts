import type { AvailabilityRule, Booking, EventType, Owner, Profile, Slot } from "./types";

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const getErrorMessage = (error: unknown) => (error instanceof ApiError ? error.message : "Что-то пошло не так");

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(path, {
    credentials: "include",
    headers: init.body ? { "Content-Type": "application/json", ...init.headers } : init.headers,
    ...init,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as T & ApiErrorPayload;

  if (!response.ok) {
    throw new ApiError(response.status, payload.error?.code || "UNKNOWN_ERROR", payload.error?.message || "Ошибка запроса");
  }

  return payload;
};

type CurrentUserResponse = { user: { email: string } };
type OwnerResponse = { owner: Owner };
type PublicProfileResponse = { profile: Profile };
type EventTypesResponse = { eventTypes: EventType[] };
type AdminProfileResponse = { profile: Profile };
type AvailabilityResponse = { availability: AvailabilityRule[] };
type AdminBookingsResponse = { bookings: Booking[] };

let currentUserCache: CurrentUserResponse | null = null;
let ownerCache: OwnerResponse | null = null;
let publicProfileCache: PublicProfileResponse | null = null;
let eventTypesCache: EventTypesResponse | null = null;
let adminProfileCache: AdminProfileResponse | null = null;
let availabilityCache: AvailabilityResponse | null = null;
const adminBookingsCache = new Map<string, AdminBookingsResponse>();

const clearAdminCaches = () => {
  adminProfileCache = null;
  availabilityCache = null;
  adminBookingsCache.clear();
};

export const api = {
  hasCachedMe: () => currentUserCache !== null,
  getProfile: async () => {
    if (publicProfileCache) return publicProfileCache;
    publicProfileCache = await request<PublicProfileResponse>("/api/public/profile");
    return publicProfileCache;
  },
  getOwner: async () => {
    if (ownerCache) return ownerCache;
    ownerCache = await request<OwnerResponse>("/api/public/owner");
    return ownerCache;
  },
  getEventTypes: async () => {
    if (eventTypesCache) return eventTypesCache;
    eventTypesCache = await request<EventTypesResponse>("/api/public/event-types");
    return eventTypesCache;
  },
  getEventTypeSlots: (eventTypeId: string, includeStatus = false) => request<{ slots: Slot[] }>(`/api/public/event-types/${eventTypeId}/slots${includeStatus ? "?includeStatus=true" : ""}`),
  getSlots: (from: string, to: string, durationMinutes?: number, includeStatus = false) =>
    request<{ slots: Slot[] }>(`/api/public/slots?from=${from}&to=${to}${durationMinutes ? `&durationMinutes=${durationMinutes}` : ""}${includeStatus ? "&includeStatus=true" : ""}`),
  createBooking: (payload: { eventTypeId: string; guestEmail: string; guestName: string; guestNotes?: string; startAt: string }) =>
    request<{ booking: Booking }>("/api/public/bookings", { method: "POST", body: JSON.stringify(payload) }),
  getBooking: (id: string) => request<{ booking: Booking; owner: Owner }>(`/api/public/bookings/${id}`),

  login: async (payload: { email: string; password: string; rememberMe?: boolean }) => {
    currentUserCache = await request<CurrentUserResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
    clearAdminCaches();
    return currentUserCache;
  },
  logout: async () => {
    await request<void>("/api/auth/logout", { method: "POST" });
    currentUserCache = null;
    clearAdminCaches();
  },
  me: async () => {
    if (currentUserCache) return currentUserCache;
    currentUserCache = await request<CurrentUserResponse>("/api/auth/me");
    return currentUserCache;
  },

  getAdminBookings: async (status: "all" | "cancelled" | "past" | "upcoming") => {
    const cached = adminBookingsCache.get(status);
    if (cached) return cached;
    const response = await request<AdminBookingsResponse>(`/api/admin/bookings?status=${status}`);
    adminBookingsCache.set(status, response);
    return response;
  },
  getAdminEventTypes: async () => {
    if (eventTypesCache) return eventTypesCache;
    eventTypesCache = await request<EventTypesResponse>("/api/admin/event-types");
    return eventTypesCache;
  },
  createAdminEventType: async (payload: EventType) => {
    const response = await request<{ eventType: EventType }>("/api/admin/event-types", { method: "POST", body: JSON.stringify(payload) });
    eventTypesCache = null;
    return response;
  },
  cancelBooking: async (id: string) => {
    const response = await request<{ booking: Pick<Booking, "cancelledAt" | "id" | "status"> }>(`/api/admin/bookings/${id}/cancel`, { method: "PATCH" });
    adminBookingsCache.clear();
    return response;
  },
  getAvailability: async () => {
    if (availabilityCache) return availabilityCache;
    availabilityCache = await request<AvailabilityResponse>("/api/admin/availability");
    return availabilityCache;
  },
  updateAvailability: async (availability: AvailabilityRule[]) => {
    availabilityCache = await request<AvailabilityResponse>("/api/admin/availability", { method: "PUT", body: JSON.stringify({ availability }) });
    return availabilityCache;
  },
  getAdminProfile: async () => {
    if (adminProfileCache) return adminProfileCache;
    adminProfileCache = await request<AdminProfileResponse>("/api/admin/profile");
    return adminProfileCache;
  },
  updateProfile: async (profile: Profile) => {
    adminProfileCache = await request<AdminProfileResponse>("/api/admin/profile", { method: "PUT", body: JSON.stringify(profile) });
    publicProfileCache = adminProfileCache;
    ownerCache = null;
    return adminProfileCache;
  },
};
