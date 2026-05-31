export const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const today = () => toDateKey(new Date());

export const bookingWindowEnd = () => {
  const end = new Date();
  end.setDate(end.getDate() + 13);
  return toDateKey(end);
};

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const formatTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const formatDateOnly = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(parseDateKey(value));

export const formatMonth = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(parseDateKey(`${value.slice(0, 7)}-01`));

export const shiftMonth = (date: string, direction: -1 | 1) => {
  const nextDate = parseDateKey(date);
  nextDate.setDate(1);
  nextDate.setMonth(nextDate.getMonth() + direction);
  return toDateKey(nextDate);
};

export const getMonthRange = (date: string) => {
  const monthStart = parseDateKey(`${date.slice(0, 7)}-01`);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

  return {
    from: toDateKey(monthStart),
    to: toDateKey(monthEnd),
  };
};

export const buildCalendarDays = (date: string) => {
  const monthStart = parseDateKey(`${date.slice(0, 7)}-01`);
  const gridStart = new Date(monthStart);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  gridStart.setDate(monthStart.getDate() - mondayOffset);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
  const gridEnd = new Date(monthEnd);
  const sundayOffset = (7 - monthEnd.getDay()) % 7;
  gridEnd.setDate(monthEnd.getDate() + sundayOffset);
  const dayCount = Math.round((gridEnd.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return Array.from({ length: dayCount }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);

    return {
      date: toDateKey(day),
      dayNumber: day.getDate(),
      inMonth: day.getMonth() === monthStart.getMonth(),
    };
  });
};
