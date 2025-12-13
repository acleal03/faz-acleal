export function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function localISODateTime() {
  const d = new Date();
  return d.toISOString().replace("T", " ").slice(0, 16);
}

export function generateMonthDays(year, month) {
  const days = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  for (let d = 1; d <= lastDay; d++) {
    const dateObj = new Date(year, month, d);
    days.push({
      date: dateObj.toISOString().slice(0, 10),
      day: d,
      weekday: weekdays[dateObj.getDay()],
    });
  }
  return days;
}

export function splitThreeRows(days) {
  return [
    days.slice(0, 7),
    days.slice(7, 14),
    days.slice(14, 21),
    days.slice(21, 28),
    days.slice(28, 35),
  ];
}
