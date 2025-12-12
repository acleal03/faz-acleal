/* ==========================================================
   UTILS - Boston v3 (compatível com App.jsx atualizado)
   ========================================================== */

/* --------------------------
   Retorna data atual (YYYY-MM-DD)
   -------------------------- */
export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* --------------------------
   Gera um ID único simples
   -------------------------- */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/* --------------------------
   Retorna data+hora local (YYYY-MM-DD HH:MM)
   -------------------------- */
export function localISODateTime() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mi}`;
}

/* --------------------------
   Gera todos os dias do mês
   Retorna array:
   [
     { date: "2025-02-01", day: "1", weekday: "Sáb" },
     { ... }
   ]
   -------------------------- */
export function generateMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const days = [];
  const lastDay = new Date(year, month + 1, 0).getDate();

  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  for (let d = 1; d <= lastDay; d++) {
    const dateObj = new Date(year, month, d);
    const yyyy = year;
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");

    days.push({
      date: `${yyyy}-${mm}-${dd}`,
      day: String(d),
      weekday: weekdays[dateObj.getDay()],
    });
  }

  return days;
}

/* --------------------------
   Divide o mês em 3 linhas
   Ex:
   linha 1: dias 1–10
   linha 2: dias 11–20
   linha 3: dias restantes
   -------------------------- */
export function splitThreeRows(days) {
  const row1 = days.slice(0, 7);
  const row2 = days.slice(7, 14);
  const row3 = days.slice(14, 21);
  const row4 = days.slice(21, 28);
  const row5 = days.slice(28, 31);
  return [row1, row2, row3, row4, row5];
}
