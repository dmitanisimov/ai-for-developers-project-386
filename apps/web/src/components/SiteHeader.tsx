import { Link } from "./Link";
import { navigate } from "../lib/router";

export const SiteHeader = ({ onBookClick }: { onBookClick?: () => void }) => (
  <header className="site-header">
    <div className="site-header-inner">
      <Link className="logo-link" to="/">
        <span className="logo-icon" aria-hidden="true">
          ◴
        </span>
        <span>Calendar</span>
      </Link>
      <nav className="site-nav" aria-label="Основная навигация">
        <button
          className="nav-button"
          type="button"
          onClick={() => {
            onBookClick?.();
            navigate("/book");
          }}
        >
          Записаться
        </button>
        <Link className="nav-link" to="/login">
          Админка
        </Link>
      </nav>
    </div>
  </header>
);
