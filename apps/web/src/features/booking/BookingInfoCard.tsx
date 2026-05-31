import { HostAvatar } from "../../components/HostAvatar";
import type { EventType, Owner, Slot } from "../../api/types";
import { formatDateOnly, formatTime } from "../../lib/date";

export const BookingInfoCard = ({ owner, selectedDate, selectedEventType, selectedSlot }: { owner: Owner | null; selectedDate: string; selectedEventType: EventType; selectedSlot: Slot | null }) => (
  <aside className="booking-info-card">
    <div className="host-row">
      <HostAvatar />
      <div>
        <strong>{owner?.ownerName || "Tota"}</strong>
        <span>Host</span>
      </div>
    </div>

    <div className="meeting-title-row">
      <h2>{selectedEventType.title}</h2>
      <span className="duration-badge">{selectedEventType.durationMinutes} мин</span>
    </div>
    <p>{selectedEventType.description}</p>

    <div className="selected-date-card">
      <span>Выбранная дата</span>
      <strong>{formatDateOnly(selectedDate)}</strong>
    </div>
    <div className="selected-date-card">
      <span>Выбранное время</span>
      <strong>{selectedSlot ? `${formatTime(selectedSlot.startAt)} - ${formatTime(selectedSlot.endAt)}` : "Время не выбрано"}</strong>
    </div>
  </aside>
);
