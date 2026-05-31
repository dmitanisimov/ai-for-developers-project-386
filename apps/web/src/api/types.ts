export type Profile = {
  avatarUrl: string | null;
  meetingDescription: string;
  meetingDurationMinutes: number;
  meetingTitle: string;
  ownerBio: string;
  ownerName: string;
  ownerTitle: string;
  timezone: string;
};

export type Owner = {
  avatarUrl: string | null;
  ownerBio: string;
  ownerName: string;
  ownerTitle: string;
  timezone: string;
};

export type EventType = {
  description: string;
  durationMinutes: number;
  id: string;
  title: string;
};

export type Slot = {
  endAt: string;
  startAt: string;
  status?: "available" | "booked";
};

export type Booking = {
  cancelledAt?: string | null;
  createdAt?: string;
  endAt: string;
  eventType: EventType;
  eventTypeId: string;
  guestEmail: string;
  guestName: string;
  guestNotes: string | null;
  id: string;
  startAt: string;
  status: "confirmed" | "cancelled";
};

export type AvailabilityRule = {
  enabled: boolean;
  endTime: string;
  startTime: string;
  weekday: number;
};
