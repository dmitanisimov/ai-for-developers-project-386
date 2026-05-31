import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api/client";
import type { Booking, Owner } from "../api/types";
import { Link } from "../components/Link";
import { formatDateTime } from "../lib/date";

export const SuccessPage = ({ bookingId }: { bookingId: string }) => {
  const [data, setData] = useState<{ booking: Booking; owner: Owner } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getBooking(bookingId)
      .then(setData)
      .catch((requestError: unknown) => setError(getErrorMessage(requestError)));
  }, [bookingId]);

  return (
    <main className="page-shell compact">
      <section className="simple-card">
        <p className="eyebrow">Готово</p>
        <h1>Встреча забронирована</h1>
        {error ? <p className="error-box">{error}</p> : null}
        {data ? (
          <div className="detail-list">
            <span>{data.booking.eventType.title}</span>
            <span>{formatDateTime(data.booking.startAt)}</span>
            <span>{data.booking.guestEmail}</span>
            <span>{data.owner.ownerName}</span>
          </div>
        ) : null}
        <Link className="primary-link" to="/book">
          Вернуться к записи
        </Link>
      </section>
    </main>
  );
};
