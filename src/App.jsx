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

  /* ================= STATE ================= */
  const [activeTab, setActiveTab] = useState("agenda");
  const [filter, setFilter] = useState("all"); // all | today | late

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

  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formColor, setFormColor] = useState("blue");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksMap));
  }, [tasksMap]);

  /* ================= CALENDAR ================= */
  const monthDays = generateMonthDays(viewYear, viewMonth);
  const [row1, row2, row3, row4, row5] = splitThreeRows(monthDays);

  /* ================= HELPERS ================= */
  function isLate(t) {
    return t.date < today && !t.done;
  }

  function isTodayTask(t) {
    return t.date === today;
  }

  function borderClass(t) {
    if (t.done) return "border-green";
    if (isLate(t)) return "border-red";
    if (isTodayTask(t)) return "border-orange";
    return "border-blue";
  }

  /* ================= TASK AGGREGATION ================= */
  function tasksForAgenda() {
    const todayTasks = tasksMap[today] || [];

    if (selectedDate !== today) {
      return tasksMap[selectedDate] || [];
    }

    // incluir atrasadas não concluídas
    const lateTasks = [];
    Object.values(tasksMap).forEach((list) => {
      list.forEach((t) => {
        if (isLate(t)) lateTasks.push(t);
      });
    });

    return [...lateTasks, ...todayTasks];
  }

  function applyFilter(list) {
    if (filter === "today") return list.filter((t) => isTodayTask(t));
    if (filter === "late") return list.filter((t) => isLate(t));
    return list;
  }

  /* ================= CRUD ================= */
  function addTask() {
    setFormTitle("");
    setFormColor("blue");
    setShowModal(true);
  }

  function saveTask() {
    if (!formTitle.trim()) return;

    const t = {
      id: uid(),
      title: formTitle.trim(),
      date: selectedDate,
      createdAt: localISODateTime(),
      done: false,
      color: formColor,
    };

    setTasksMap((p) => ({
      ...p,
      [selectedDate]: [t, ...(p[selectedDate] || [])],
    }));

    setShowModal(false);
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
    if (!confirm("Excluir tarefa?")) return;

    setTasksMap((p) => ({
      ...p,
      [t.date]: p[t.date].filter((x) => x.id !== t.id),
    }));
  }

  /* ================= RENDERS ================= */
  function renderAgenda() {
    const finalList = applyFilter(tasksForAgenda());

    return (
      <>
        {/* CALENDAR */}
        {[row1, row2, row3, row4, row5].map((row, i) => (
          <div className="cal-row" key={i}>
            {row.map((d) => (
              <div
                key={d.date}
                className={`cal-cell ${
                  d.date === selectedDate ? "cal-active" : ""
                }`}
                onClick={() => setSelectedDate(d.date)}
              >
                <div className="cal-week">{d.weekday}</div>
                <div className="cal-num">{d.day}</div>
              </div>
            ))}
          </div>
        ))}

        {/* PANEL */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              {selectedDate === today ? "Hoje" : selectedDate}
            </div>

            {/* FILTROS */}
            {selectedDate === today && (
              <div className="filters">
                <button
                  className={`small-pill ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  Todas
                </button>
                <button
                  className={`small-pill ${filter === "today" ? "active" : ""}`}
                  onClick={() => setFilter("today")}
                >
                  Hoje
                </button>
                <button
                  className={`small-pill ${filter === "late" ? "active" : ""}`}
                  onClick={() => setFilter("late")}
                >
                  Atrasadas
                </button>
              </div>
            )}
          </div>

          {finalList.length === 0 && (
            <div className="empty-large">Nenhuma tarefa.</div>
          )}

          {finalList.map((t) => (
            <article key={t.id} className={`task-item ${borderClass(t)}`}>
              <div className="task-left">
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  Criada: {t.createdAt} — Dia: {t.date}
                </div>
              </div>

              <div className="task-right">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(t)}
                />
                <button className="icon">✏️</button>
                <button className="icon" onClick={() => deleteTask(t)}>
                  🗑️
                </button>
              </div>
            </article>
          ))}
        </div>
      </>
    );
  }

  /* ================= MAIN RENDER ================= */
  return (
    <div className="boston-root">
      <header className="b-header">
        <button className="menu-btn">☰</button>

        <div className="header-center">
          <div className="app-title">fazer@acleal</div>
          <div className="month-nav">
            <button
              className="menu-btn"
              onClick={() => setViewMonth((m) => m - 1)}
            >
              ←
            </button>
            <span className="month-label">
              {new Date(viewYear, viewMonth).toLocaleString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              className="menu-btn"
              onClick={() => setViewMonth((m) => m + 1)}
            >
              →
            </button>
          </div>
        </div>

        <div />
      </header>

      <main className="b-main">
        {activeTab === "agenda" && renderAgenda()}
      </main>

      <nav className="bottom-nav">
        <div
          className={activeTab === "agenda" ? "nav-active" : ""}
          onClick={() => setActiveTab("agenda")}
        >
          Agenda
        </div>
        <div>Notas</div>
        <div>Alertas</div>
        <div>Mais</div>
      </nav>

      {activeTab === "agenda" && (
        <button className="fab-mobile" onClick={addTask}>
          +
        </button>
      )}

      {showModal && (
        <div className="modal-back" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Nova tarefa</h3>

            <div className="modal-form">
              <input
                className="input"
                placeholder="Título"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />

              <select
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
              >
                <option value="blue">Azul</option>
                <option value="orange">Laranja</option>
                <option value="red">Vermelho</option>
                <option value="green">Verde</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={saveTask}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
