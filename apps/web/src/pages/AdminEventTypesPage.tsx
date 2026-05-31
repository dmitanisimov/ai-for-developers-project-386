import { useEffect, useState, type FormEvent } from "react";
import { api, getErrorMessage } from "../api/client";
import type { EventType } from "../api/types";
import { AdminShell } from "../features/admin/AdminShell";

const emptyEventType: EventType = {
  id: "",
  title: "",
  description: "",
  durationMinutes: 30,
};

export const AdminEventTypesPage = () => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [draft, setDraft] = useState<EventType>(emptyEventType);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadEventTypes = () => {
    api.getAdminEventTypes().then((response) => setEventTypes(response.eventTypes)).catch((requestError: unknown) => setError(getErrorMessage(requestError)));
  };

  useEffect(loadEventTypes, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.createAdminEventType(draft);
      setDraft(emptyEventType);
      setMessage("Тип события создан");
      loadEventTypes();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <AdminShell>
      <section className="admin-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Каталог встреч</p>
            <h1>Типы событий</h1>
          </div>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
        {message ? <p className="success-box">{message}</p> : null}
        <div className="table-list">
          {eventTypes.map((eventType) => (
            <article className="table-row" key={eventType.id}>
              <div>
                <strong>{eventType.title}</strong>
                <span>{eventType.description}</span>
              </div>
              <span className="duration-badge">{eventType.durationMinutes} мин</span>
            </article>
          ))}
        </div>
      </section>

      <form className="admin-card form-stack" onSubmit={save}>
        <div className="section-header">
          <div>
            <p className="eyebrow">Новый тип</p>
            <h2>Создать тип события</h2>
          </div>
          <button className="primary-button" type="submit">
            Создать
          </button>
        </div>
        <label className="field-label">
          ID
          <input className="input" placeholder="consultation-45" required value={draft.id} onChange={(event) => setDraft((current) => ({ ...current, id: event.target.value }))} />
        </label>
        <label className="field-label">
          Название
          <input className="input" required value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
        </label>
        <label className="field-label">
          Описание
          <textarea className="input textarea" required value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
        </label>
        <label className="field-label">
          Длительность
          <input className="input" min="5" required type="number" value={draft.durationMinutes} onChange={(event) => setDraft((current) => ({ ...current, durationMinutes: Number(event.target.value) }))} />
        </label>
      </form>
    </AdminShell>
  );
};
