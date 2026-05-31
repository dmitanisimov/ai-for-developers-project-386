import { HostAvatar } from "../../components/HostAvatar";
import type { Profile, Slot } from "../../api/types";
import { formatDateOnly, formatTime } from "../../lib/date";

export const BookingInfoCard = ({ profile, selectedDate, selectedDuration, selectedSlot }: { profile: Profile | null; selectedDate: string; selectedDuration: 15 | 30; selectedSlot: Slot | null }) => (
  <aside className="booking-info-card">
    <div className="host-row">
      <HostAvatar />
      <div>
        <strong>{profile?.ownerName || "Tota"}</strong>
        <span>Host</span>
      </div>
    </div>

    <div className="meeting-title-row">
      <h2>Встреча {selectedDuration} минут</h2>
      <span className="duration-badge">{selectedDuration} мин</span>
    </div>
    <p>{selectedDuration === 15 ? "Короткий тип события для быстрого слота." : "Базовый тип события для бронирования."}</p>

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
