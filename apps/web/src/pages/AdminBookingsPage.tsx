import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api/client";
import type { Booking } from "../api/types";
import { AdminShell } from "../features/admin/AdminShell";
import { formatDateTime } from "../lib/date";

export const AdminBookingsPage = () => {
  const [status, setStatus] = useState<"all" | "cancelled" | "past" | "upcoming">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");

  const loadBookings = () => {
    api
      .getAdminBookings(status)
      .then((response) => setBookings(response.bookings))
      .catch((requestError: unknown) => setError(getErrorMessage(requestError)));
  };

  useEffect(loadBookings, [status]);

  const cancel = async (id: string) => {
    await api.cancelBooking(id);
    loadBookings();
  };

  return (
    <AdminShell>
      <section className="admin-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Админка</p>
            <h1>Встречи</h1>
          </div>
          <select className="input small" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="upcoming">Предстоящие</option>
            <option value="past">Прошедшие</option>
            <option value="cancelled">Отмененные</option>
            <option value="all">Все</option>
          </select>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
        <div className="table-list">
          {bookings.length === 0 ? <p className="empty-state">Встреч пока нет.</p> : null}
          {bookings.map((booking) => (
            <article className="table-row" key={booking.id}>
              <div>
                <strong>{booking.guestName}</strong>
                <span>{booking.guestEmail} · {booking.eventType.title}</span>
              </div>
              <div>{formatDateTime(booking.startAt)}</div>
              <span className={booking.status === "cancelled" ? "status-pill muted-pill" : "status-pill"}>{booking.status}</span>
              {booking.status !== "cancelled" ? (
                <button className="ghost-button" type="button" onClick={() => cancel(booking.id)}>
                  Отменить
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
};
