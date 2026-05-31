import type { FormEvent } from "react";
import type { Profile, Slot } from "../../api/types";
import { BookingInfoCard } from "./BookingInfoCard";
import { CalendarGrid } from "./CalendarGrid";
import { SlotStatusPanel } from "./SlotStatusPanel";

type BookingTimeStepProps = {
  error: string;
  guestEmail: string;
  guestName: string;
  guestNotes: string;
  loading: boolean;
  monthSlotCounts: Record<string, number>;
  onBack: () => void;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: Slot) => void;
  onSubmit: (event: FormEvent) => void;
  profile: Profile | null;
  selectedDate: string;
  selectedDuration: 15 | 30;
  selectedSlot: Slot | null;
  setGuestEmail: (value: string) => void;
  setGuestName: (value: string) => void;
  setGuestNotes: (value: string) => void;
  slots: Slot[];
};

export const BookingTimeStep = (props: BookingTimeStepProps) => (
  <section className="booking-step-page" aria-labelledby="booking-title">
    <h1 id="booking-title" className="booking-step-title">
      Встреча {props.selectedDuration} минут
    </h1>

    <div className="booking-step-grid">
      <BookingInfoCard profile={props.profile} selectedDate={props.selectedDate} selectedDuration={props.selectedDuration} selectedSlot={props.selectedSlot} />
      <CalendarGrid monthSlotCounts={props.monthSlotCounts} selectedDate={props.selectedDate} onSelectDate={props.onSelectDate} />
      <SlotStatusPanel {...props} />
    </div>
  </section>
);
