import "@typespec/http";

using TypeSpec.Http;

@service(#{ title: "Cal Booking API" })
@server("https://your-domain.example", "Production server")
@server("http://127.0.0.1:3000", "Local development server")
namespace CalBooking;

alias utcDateTime = string;
alias date = string;

enum BookingStatus {
  confirmed,
  cancelled,
}

enum SlotStatus {
  available,
  booked,
}

model ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

model Owner {
  ownerName: string;
  ownerTitle: string;
  ownerBio: string;
  avatarUrl?: string | null;
  timezone: string;
}

model EventType {
  id: string;
  title: string;
  description: string;
  durationMinutes: int32;
}

model Slot {
  startAt: utcDateTime;
  endAt: utcDateTime;
  status?: SlotStatus;
}

model Booking {
  id: string;
  eventTypeId: string;
  eventType: EventType;
  guestName: string;
  guestEmail: string;
  guestNotes?: string | null;
  startAt: utcDateTime;
  endAt: utcDateTime;
  status: BookingStatus;
  createdAt?: utcDateTime;
  cancelledAt?: utcDateTime | null;
}

model OwnerResponse {
  owner: Owner;
}

model EventTypesResponse {
  eventTypes: EventType[];
}

model SlotsResponse {
  slots: Slot[];
}

model BookingResponse {
  @statusCode statusCode: 201;
  booking: Booking;
}

model CreatedEventTypeResponse {
  @statusCode statusCode: 201;
  eventType: EventType;
}

model BookingConfirmationResponse {
  booking: Booking;
  owner: Owner;
}

model CreateBookingRequest {
  eventTypeId: string;
  startAt: utcDateTime;
  guestName: string;
  guestEmail: string;
  guestNotes?: string;
}

model CreateEventTypeRequest {
  id: string;
  title: string;
  description: string;
  durationMinutes: int32;
}

model HealthResponse {
  status: "ok";
}

@route("/api/health")
@get
op health(): HealthResponse;

@route("/api/public/owner")
@get
op getPublicOwner(): OwnerResponse;

@route("/api/public/event-types")
@get
op listPublicEventTypes(): EventTypesResponse;

@route("/api/public/event-types/{eventTypeId}/slots")
@get
op listPublicSlots(
  @path eventTypeId: string,
  @query includeStatus?: boolean,
): SlotsResponse;

@route("/api/public/bookings")
@post
op createPublicBooking(@body body: CreateBookingRequest): BookingResponse;

@route("/api/public/bookings/{id}")
@get
op getPublicBooking(@path id: string): BookingConfirmationResponse;

@route("/api/admin/bookings")
@get
op listAdminBookings(@query status?: "upcoming" | "past" | "cancelled" | "all"): {
  bookings: Booking[];
};

@route("/api/admin/event-types")
@get
op listAdminEventTypes(): EventTypesResponse;

@route("/api/admin/event-types")
@post
op createAdminEventType(@body body: CreateEventTypeRequest): CreatedEventTypeResponse;
