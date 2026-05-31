import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";
import type { Profile } from "../api/types";
import { AdminShell } from "../features/admin/AdminShell";

export const AdminProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getAdminProfile().then((response) => setProfile(response.profile));
  }, []);

  const setField = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile((current) => (current ? { ...current, [key]: value } : current));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    const response = await api.updateProfile(profile);
    setProfile(response.profile);
    setMessage("Профиль сохранен");
  };

  if (!profile) {
    return (
      <AdminShell>
        <section className="admin-card" aria-busy="true" />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <form className="admin-card form-stack" onSubmit={save}>
        <div className="section-header">
          <div>
            <p className="eyebrow">Публичная карточка</p>
            <h1>Профиль</h1>
          </div>
          <button className="primary-button" type="submit">
            Сохранить
          </button>
        </div>
        {message ? <p className="success-box">{message}</p> : null}
        <label className="field-label">
          Имя<input className="input" value={profile.ownerName} onChange={(event) => setField("ownerName", event.target.value)} />
        </label>
        <label className="field-label">
          Должность<input className="input" value={profile.ownerTitle} onChange={(event) => setField("ownerTitle", event.target.value)} />
        </label>
        <label className="field-label">
          Описание владельца<textarea className="input textarea" value={profile.ownerBio} onChange={(event) => setField("ownerBio", event.target.value)} />
        </label>
        <label className="field-label">
          Название встречи<input className="input" value={profile.meetingTitle} onChange={(event) => setField("meetingTitle", event.target.value)} />
        </label>
        <label className="field-label">
          Описание встречи<textarea className="input textarea" value={profile.meetingDescription} onChange={(event) => setField("meetingDescription", event.target.value)} />
        </label>
        <label className="field-label">
          Длительность<input className="input" min="15" type="number" value={profile.meetingDurationMinutes} onChange={(event) => setField("meetingDurationMinutes", Number(event.target.value))} />
        </label>
        <label className="field-label">
          Timezone<input className="input" value={profile.timezone} onChange={(event) => setField("timezone", event.target.value)} />
        </label>
      </form>
    </AdminShell>
  );
};
