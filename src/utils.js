// utils.js - helpers for the app

// Generate days of current month (array of { day, weekday, date })
export function generateDays() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-index
  const last = new Date(year, month + 1, 0).getDate();
  const names = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const arr = [];
  for (let d = 1; d <= last; d++) {
    const dt = new Date(year, month, d);
    arr.push({
      day: d,
      weekday: names[dt.getDay()],
      date: dt.toISOString().slice(0, 10),
    });
  }
  return arr;
}

export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}
