import { HostAvatar } from "../../components/HostAvatar";
import type { EventType, Owner } from "../../api/types";

export const EventTypeStep = ({ error, eventTypes, onSelectEventType, owner }: { error: string; eventTypes: EventType[]; onSelectEventType: (eventType: EventType) => void; owner: Owner | null }) => (
  <section className="event-type-page" aria-labelledby="event-type-title">
    <div className="host-card">
      <div className="host-row">
        <HostAvatar />
        <div>
          <strong>{owner?.ownerName || "Tota"}</strong>
          <span>Host</span>
        </div>
      </div>
      <h1 id="event-type-title">Выберите тип события</h1>
      <p>Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.</p>
      {error ? <p className="error-box">{error}</p> : null}
    </div>

    <div className="event-type-grid">
      {eventTypes.map((eventType) => (
        <button className="event-type-card" key={eventType.id} type="button" onClick={() => onSelectEventType(eventType)}>
          <span className="event-type-content">
            <strong>{eventType.title}</strong>
            <span>{eventType.description}</span>
          </span>
          <span className="duration-badge">{eventType.durationMinutes} мин</span>
        </button>
      ))}
    </div>
  </section>
);
