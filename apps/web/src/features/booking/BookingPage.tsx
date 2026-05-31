import { useEffect, useState, type FormEvent } from "react";
import { api, getErrorMessage } from "../../api/client";
import type { Profile, Slot } from "../../api/types";
import { SiteHeader } from "../../components/SiteHeader";
import { getMonthRange, toDateKey, today } from "../../lib/date";
import { navigate } from "../../lib/router";
import { BookingTimeStep } from "./BookingTimeStep";
import { EventTypeStep } from "./EventTypeStep";

export const BookingPage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [monthSlotCounts, setMonthSlotCounts] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState(today());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<15 | 30 | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selectedMonth = selectedDate.slice(0, 7);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    api
      .getProfile()
      .then((profileResponse) => {
        if (!active) return;
        setProfile(profileResponse.profile);
      })
      .catch((requestError: unknown) => active && setError(getErrorMessage(requestError)))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDuration) return;

    let active = true;
    const monthRange = getMonthRange(selectedDate);

    api
      .getSlots(monthRange.from, monthRange.to, selectedDuration, true)
      .then((slotsResponse) => {
        if (!active) return;

        const counts = slotsResponse.slots.reduce<Record<string, number>>((accumulator, slot) => {
          if (slot.status !== "available") return accumulator;

          const dateKey = toDateKey(new Date(slot.startAt));
          accumulator[dateKey] = (accumulator[dateKey] || 0) + 1;
          return accumulator;
        }, {});

        setMonthSlotCounts(counts);
      })
      .catch(() => active && setMonthSlotCounts({}));

    return () => {
      active = false;
    };
  }, [selectedMonth, selectedDuration]);

  useEffect(() => {
    if (!selectedDuration) return;

    let active = true;
    setLoading(true);
    setError("");

    api
      .getSlots(selectedDate, selectedDate, selectedDuration, true)
      .then((slotsResponse) => {
        if (!active) return;
        setSlots(slotsResponse.slots);
        setSelectedSlot(null);
      })
      .catch((requestError: unknown) => active && setError(getErrorMessage(requestError)))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [selectedDate, selectedDuration]);

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedDuration || !selectedSlot) {
      setError("Выберите слот");
      return;
    }

    try {
      setError("");
      const response = await api.createBooking({ durationMinutes: selectedDuration, guestName, guestEmail, guestNotes, startAt: selectedSlot.startAt });
      navigate(`/success/${response.booking.id}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <main className="booking-page">
      <SiteHeader
        onBookClick={() => {
          setSelectedDuration(null);
          setSelectedSlot(null);
        }}
      />
      {!selectedDuration ? (
        <EventTypeStep error={error} profile={profile} onSelectDuration={setSelectedDuration} />
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
              setSelectedDuration(null);
            }
          }}
          onSelectDate={setSelectedDate}
          onSelectSlot={setSelectedSlot}
          onSubmit={submitBooking}
          profile={profile}
          selectedDate={selectedDate}
          selectedDuration={selectedDuration}
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
