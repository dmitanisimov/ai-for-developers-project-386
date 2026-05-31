import { useEffect, useState, type FormEvent } from "react";
import { api, getErrorMessage } from "../../api/client";
import type { EventType, Owner, Slot } from "../../api/types";
import { SiteHeader } from "../../components/SiteHeader";
import { toDateKey, today } from "../../lib/date";
import { navigate } from "../../lib/router";
import { BookingTimeStep } from "./BookingTimeStep";
import { EventTypeStep } from "./EventTypeStep";

export const BookingPage = () => {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [monthSlotCounts, setMonthSlotCounts] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState(today());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setAllSlots([]);
    setSlots([]);
    setMonthSlotCounts({});

    Promise.all([api.getOwner(), api.getEventTypes()])
      .then(([ownerResponse, eventTypesResponse]) => {
        if (!active) return;
        setOwner(ownerResponse.owner);
        setEventTypes(eventTypesResponse.eventTypes);
      })
      .catch((requestError: unknown) => active && setError(getErrorMessage(requestError)))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedEventType) return;

    let active = true;
    setLoading(true);
    setError("");

    api
      .getEventTypeSlots(selectedEventType.id, true)
      .then((slotsResponse) => active && setAllSlots(slotsResponse.slots))
      .catch((requestError: unknown) => active && setError(getErrorMessage(requestError)))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [selectedEventType]);

  useEffect(() => {
    const counts = allSlots.reduce<Record<string, number>>((accumulator, slot) => {
      if (slot.status !== "available") return accumulator;

      const dateKey = toDateKey(new Date(slot.startAt));
      accumulator[dateKey] = (accumulator[dateKey] || 0) + 1;
      return accumulator;
    }, {});

    setMonthSlotCounts(counts);
    setSlots(allSlots.filter((slot) => toDateKey(new Date(slot.startAt)) === selectedDate));
    setSelectedSlot(null);
  }, [allSlots, selectedDate]);

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedEventType || !selectedSlot) {
      setError("Выберите слот");
      return;
    }

    try {
      setError("");
      const response = await api.createBooking({ eventTypeId: selectedEventType.id, guestName, guestEmail, guestNotes, startAt: selectedSlot.startAt });
      navigate(`/success/${response.booking.id}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <main className="booking-page">
      <SiteHeader
        onBookClick={() => {
          setSelectedEventType(null);
          setSelectedSlot(null);
          setAllSlots([]);
        }}
      />
      {!selectedEventType ? (
        <EventTypeStep error={error} eventTypes={eventTypes} owner={owner} onSelectEventType={setSelectedEventType} />
      ) : (
        <BookingTimeStep
          error={error}
          guestEmail={guestEmail}
          guestName={guestName}
          guestNotes={guestNotes}
          loading={loading}
          monthSlotCounts={monthSlotCounts}
          onBack={() => {
            if (selectedSlot) {
              setSelectedSlot(null);
            } else {
              setSelectedEventType(null);
            }
          }}
          onSelectDate={setSelectedDate}
          onSelectSlot={setSelectedSlot}
          onSubmit={submitBooking}
          owner={owner}
          selectedDate={selectedDate}
          selectedEventType={selectedEventType}
          selectedSlot={selectedSlot}
          setGuestEmail={setGuestEmail}
          setGuestName={setGuestName}
          setGuestNotes={setGuestNotes}
          slots={slots}
        />
      )}
    </main>
  );
};
