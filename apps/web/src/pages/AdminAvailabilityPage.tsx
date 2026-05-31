import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { AvailabilityRule } from "../api/types";
import { AdminShell } from "../features/admin/AdminShell";
import { weekdays } from "../lib/date";

export const AdminAvailabilityPage = () => {
  const [availability, setAvailability] = useState<AvailabilityRule[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getAvailability().then((response) => setAvailability(response.availability));
  }, []);

  const updateRule = (weekday: number, patch: Partial<AvailabilityRule>) => {
    setAvailability((rules) => rules.map((rule) => (rule.weekday === weekday ? { ...rule, ...patch } : rule)));
  };

  const save = async () => {
    const response = await api.updateAvailability(availability);
    setAvailability(response.availability);
    setMessage("Доступность сохранена");
  };

  return (
    <AdminShell>
      <section className="admin-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Расписание</p>
            <h1>Доступность</h1>
          </div>
          <button className="primary-button" type="button" onClick={save}>
            Сохранить
          </button>
        </div>
        {message ? <p className="success-box">{message}</p> : null}
        <div className="availability-list">
          {availability.map((rule) => (
            <div className="availability-row" key={rule.weekday}>
              <label>
                <input checked={rule.enabled} type="checkbox" onChange={(event) => updateRule(rule.weekday, { enabled: event.target.checked })} /> {weekdays[rule.weekday - 1]}
              </label>
              <input className="input small" type="time" value={rule.startTime} onChange={(event) => updateRule(rule.weekday, { startTime: event.target.value })} />
              <input className="input small" type="time" value={rule.endTime} onChange={(event) => updateRule(rule.weekday, { endTime: event.target.value })} />
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
};
