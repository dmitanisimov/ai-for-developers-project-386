import { SiteHeader } from "../components/SiteHeader";
import { navigate } from "../lib/router";

const LandingHero = () => (
  <section className="landing-hero" aria-labelledby="landing-title">
    <div className="landing-copy">
      <span className="hero-badge">Быстрая запись на звонок</span>
      <h1 id="landing-title">Calendar</h1>
      <p>Забронируйте встречу за минуту: выберите тип события и удобное время.</p>
      <button className="orange-button" type="button" onClick={() => navigate("/book")}>
        Записаться <span aria-hidden="true">→</span>
      </button>
    </div>

    <aside className="features-card" aria-labelledby="features-title">
      <h2 id="features-title">Возможности</h2>
      <ul>
        <li>Выбор типа события и удобного времени для встречи.</li>
        <li>Быстрое бронирование с подтверждением и дополнительными заметками.</li>
        <li>Управление типами встреч и просмотр предстоящих записей в админке.</li>
      </ul>
    </aside>
  </section>
);

export const HomePage = () => (
  <main className="landing-page">
    <SiteHeader />
    <LandingHero />
  </main>
);
