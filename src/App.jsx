import React, { useEffect, useState } from "react";
import "./App.css";
import {
  todayISO,
  uid,
  generateMonthDays,
  splitThreeRows,
  localISODateTime,
} from "./utils";

const STORAGE_KEY = "faz_acleal_boston_v3";

export default function App() {
  const today = todayISO();

  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(today);

  const [tasksMap, setTasksMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  const [showEdit, setShowEdit] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksMap));
  }, [tasksMap]);

  const monthDays = generateMonthDays(viewYear, viewMonth);
  const [row1, row2, row3, row4, row5] = splitThreeRows(monthDays);

  /* =========================
     STATUS / CORES
     ========================= */
  function isLate(t) {
    return t.date < today && !t.done;
  }

  function isTodayPending(t) {
    return t.date === today && !t.done;
  }

  function borderClass(t) {
    if (t.done) return "border-green";
    if (isLate(t)) return "border-red";
    if (isTodayPending(t)) return "border-orange";
    return "border-blue";
  }

  /* =========================
     CRUD
     ========================= */
  function addTask() {
    const title = prompt("Digite a tarefa:");
    if (!title) return;

    const t = {
      id: uid(),
      title,
      date: selectedDate,
      createdAt: localISODateTime(),
      done: false,
    };

    setTasksMap((p) => ({
      ...p,
      [selectedDate]: [t, ...(p[selectedDate] || [])],
    }));
  }

  function toggleTask(t) {
    setTasksMap((p) => ({
      ...p,
      [t.date]: p[t.date].map((x) =>
        x.id === t.id ? { ...x, done: !x.done } : x
      ),
    }));
  }

  function deleteTask(t) {
    if (!confirm("Excluir esta tarefa?")) return;

    setTasksMap((p) => ({
      ...p,
      [t.date]: p[t.date].filter((x) => x.id !== t.id),
    }));
  }

  function editTask(t) {
    const novo = prompt("Editar tarefa:", t.title);
    if (!novo) return;

    setTasksMap((p) => ({
      ...p,
      [t.date]: p[t.date].map((x) =>
        x.id === t.id ? { ...x, title: novo } : x
      ),
    }));
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="boston-root">
      {/* HEADER */}
      <header className="b-header">
        <button className="menu-btn">☰</button>

        <div className="header-center">
          <div className="app-title">fazer@acleal</div>
          <div className="month-nav">
            <button className="menu-btn" onClick={() => setViewMonth(m => m - 1)}>←</button>
            <span className="month-label">
              {new Date(viewYear, viewMonth).toLocaleString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button className="menu-btn" onClick={() => setViewMonth(m => m + 1)}>→</button>
          </div>
        </div>

        <div />
      </header>

      <main className="b-main">
        {[row1, row2, row3, row4, row5].map((row, i) => (
          <div className="cal-row" key={i}>
            {row.map((d) => (
              <div
                key={d.date}
                className={`cal-cell ${d.date === selectedDate ? "cal-active" : ""}`}
                onClick={() => setSelectedDate(d.date)}
              >
                <div className="cal-week">{d.weekday}</div>
                <div className="cal-num">{d.day}</div>
              </div>
            ))}
          </div>
        ))}

        <div className="panel">
          {(tasksMap[selectedDate] || []).length === 0 && (
            <div className="empty-large">Nenhuma tarefa.</div>
          )}

          {(tasksMap[selectedDate] || []).map((t) => (
            <article key={t.id} className={`task-item ${borderClass(t)}`}>
              <div className="task-left">
                <div className="task-title">{t.title}</div>
                <div className="task-meta">Criada: {t.createdAt}</div>
              </div>

              <div className="task-right">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(t)}
                />

                {/* ✏️ EDITAR */}
                <button
                  className="icon"
                  title="Editar"
                  onClick={() => editTask(t)}
                >
                  ✏️
                </button>

                {/* 🗑️ EXCLUIR */}
                <button
                  className="icon"
                  title="Excluir"
                  onClick={() => deleteTask(t)}
                >
                  🗑️
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      <nav className="bottom-nav">
        <div className="nav-active">Agenda</div>
        <div>Notas</div>
        <div>Alertas</div>
        <div>Mais</div>
      </nav>

      <button className="fab-mobile" onClick={addTask}>+</button>
    </div>
  );
}
