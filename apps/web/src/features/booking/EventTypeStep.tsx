import { HostAvatar } from "../../components/HostAvatar";
import type { Profile } from "../../api/types";

export const EventTypeStep = ({ error, onSelectDuration, profile }: { error: string; onSelectDuration: (duration: 15 | 30) => void; profile: Profile | null }) => (
  <section className="event-type-page" aria-labelledby="event-type-title">
    <div className="host-card">
      <div className="host-row">
        <HostAvatar />
        <div>
          <strong>{profile?.ownerName || "Tota"}</strong>
          <span>Host</span>
        </div>
      </div>
      <h1 id="event-type-title">Выберите тип события</h1>
      <p>Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.</p>
      {error ? <p className="error-box">{error}</p> : null}
    </div>

    <div className="event-type-grid">
      <button className="event-type-card" type="button" onClick={() => onSelectDuration(15)}>
        <span className="event-type-content">
          <strong>Встреча 15 минут</strong>
          <span>Короткий тип события для быстрого слота.</span>
        </span>
        <span className="duration-badge">15 мин</span>
      </button>

      <button className="event-type-card" type="button" onClick={() => onSelectDuration(30)}>
        <span className="event-type-content">
          <strong>Встреча 30 минут</strong>
          <span>Базовый тип события для бронирования.</span>
        </span>
        <span className="duration-badge">30 мин</span>
      </button>
    </div>
  </section>
);
