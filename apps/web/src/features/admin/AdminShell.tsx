import { useEffect, useState, type ReactNode } from "react";
import { api } from "../../api/client";
import { Link } from "../../components/Link";
import { navigate } from "../../lib/router";

export const AdminShell = ({ children }: { children: ReactNode }) => {
  const [checking, setChecking] = useState(!api.hasCachedMe());

  useEffect(() => {
    api
      .me()
      .then(() => setChecking(false))
      .catch(() => navigate("/login"));
  }, []);

  const logout = async () => {
    await api.logout();
    navigate("/login");
  };

  if (checking) {
    return <main className="admin-shell" aria-busy="true" />;
  }

  return (
    <main className="admin-shell">
      <nav className="admin-nav">
        <strong>Cal Booking</strong>
        <Link to="/admin">Встречи</Link>
        <Link to="/admin/event-types">Типы событий</Link>
        <Link to="/admin/availability">Доступность</Link>
        <Link to="/admin/profile">Профиль</Link>
        <button className="ghost-button" type="button" onClick={logout}>
          Выйти
        </button>
      </nav>
      {children}
    </main>
  );
};
