import type { FormEvent } from "react";
import type { Slot } from "../../api/types";
import { formatDateTime, formatTime } from "../../lib/date";

type SlotStatusPanelProps = {
  error: string;
  guestEmail: string;
  guestName: string;
  guestNotes: string;
  loading: boolean;
  onBack: () => void;
  onSelectSlot: (slot: Slot) => void;
  onSubmit: (event: FormEvent) => void;
  selectedSlot: Slot | null;
  setGuestEmail: (value: string) => void;
  setGuestName: (value: string) => void;
  setGuestNotes: (value: string) => void;
  slots: Slot[];
};

export const SlotStatusPanel = ({ error, guestEmail, guestName, guestNotes, loading, onBack, onSelectSlot, onSubmit, selectedSlot, setGuestEmail, setGuestName, setGuestNotes, slots }: SlotStatusPanelProps) => (
  <section className="slot-status-card" aria-label="Статус слотов">
    <div className="slot-status-heading">
      <h2>{selectedSlot ? "Данные для записи" : "Статус слотов"}</h2>
    </div>
    {error ? <p className="error-box">{error}</p> : null}

    <form className="slot-form" onSubmit={onSubmit}>
      {selectedSlot ? (
        <>
          <div className="selected-summary">Вы выбрали {formatDateTime(selectedSlot.startAt)}</div>
          <label className="field-label">
            Имя
            <input className="input" required value={guestName} onChange={(event) => setGuestName(event.target.value)} />
          </label>
          <label className="field-label">
            Email
            <input className="input" required type="email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} />
          </label>
          <label className="field-label">
            Комментарий
            <textarea className="input textarea" value={guestNotes} onChange={(event) => setGuestNotes(event.target.value)} />
          </label>
        </>
      ) : (
        <div className="slot-status-list">
          {!loading && slots.length === 0 ? <p className="empty-state">На эту дату слотов нет.</p> : null}
          {slots.map((slot) => {
            const isBooked = slot.status === "booked";

            return (
              <button className={`slot-status-row${isBooked ? " booked" : ""}`} disabled={isBooked} key={slot.startAt} type="button" onClick={() => onSelectSlot(slot)}>
                <span>
                  {formatTime(slot.startAt)} - {formatTime(slot.endAt)}
                </span>
                <strong>{isBooked ? "Занято" : "Свободно"}</strong>
              </button>
            );
          })}
        </div>
      )}
      <div className="booking-step-actions">
        <button className="ghost-button" type="button" onClick={onBack}>
          {selectedSlot ? "К выбору времени" : "Назад"}
        </button>
        <button className="orange-button small" disabled={!selectedSlot} type="submit">
          Продолжить
        </button>
      </div>
    </form>
  </section>
);
