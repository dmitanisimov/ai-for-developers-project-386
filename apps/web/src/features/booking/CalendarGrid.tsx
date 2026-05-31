import { buildCalendarDays, formatMonth, shiftMonth, today, weekdays } from "../../lib/date";

export const CalendarGrid = ({ monthSlotCounts, selectedDate, onSelectDate }: { monthSlotCounts: Record<string, number>; selectedDate: string; onSelectDate: (date: string) => void }) => (
  <section className="calendar-card" aria-label="Календарь">
    <div className="calendar-header">
      <h2>Календарь</h2>
      <div className="calendar-actions">
        <button type="button" onClick={() => onSelectDate(shiftMonth(selectedDate, -1))}>
          ←
        </button>
        <button type="button" onClick={() => onSelectDate(shiftMonth(selectedDate, 1))}>
          →
        </button>
      </div>
    </div>
    <p className="calendar-month">{formatMonth(selectedDate)}</p>
    <div className="calendar-weekdays">
      {weekdays.map((weekday) => (
        <span key={weekday}>{weekday}</span>
      ))}
    </div>
    <div className="calendar-grid">
      {buildCalendarDays(selectedDate).map((day) => {
        const disabled = day.date < today();

        return (
          <button
            className={`calendar-day${day.date === selectedDate ? " selected" : ""}${day.inMonth ? "" : " outside"}`}
            disabled={disabled}
            key={day.date}
            type="button"
            onClick={() => onSelectDate(day.date)}
          >
            <span>{day.dayNumber}</span>
            {monthSlotCounts[day.date] ? <small>{monthSlotCounts[day.date]} св.</small> : null}
          </button>
        );
      })}
    </div>
  </section>
);
