/* =========================
   UTILS
========================= */

/* Data atual YYYY-MM-DD */
export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ID simples */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* Data + hora local */
export function localISODateTime() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

/* Dias do mês */
export function generateMonthDays(year, month) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const days = [];
  for (let d = 1; d <= lastDay; d++) {
    const dateObj = new Date(year, month, d);
    const yyyy = year;
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");

    days.push({
      date: `${yyyy}-${mm}-${dd}`,
      day: dd,
      weekday: weekdays[dateObj.getDay()],
    });
  }
  return days;
}
