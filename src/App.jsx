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

  const [activeTab, setActiveTab] = useState("agenda");
  const [filter, setFilter] = useState("all");

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

  function tasksForAgenda() {
    if (selectedDate !== today) return tasksMap[selectedDate] || [];

    const late = [];
    Object.values(tasksMap).forEach((list) =>
      list.forEach((t) => {
        if (isLate(t)) late.push(t);
      })
    );

    return [...late, ...(tasksMap[today] || [])];
  }

  function applyFilter(list) {
    if (filter === "today") return list.filter(isTodayTask);
    if (filter === "late") return list.filter(isLate);
    return list;
  }

  /* ================= CRUD ================= */
  function openAddTask() {
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

  /* ================= RENDER AGENDA ================= */
  function renderAgenda() {
    const finalList = applyFilter(tasksForAgenda());

    return (
      <>
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

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              {selectedDate === today ? "Hoje" : selectedDate}
            </div>

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
            <div key={t.id} className={`task-item ${borderClass(t)}`}>
              <div className="task-left">
                <div className="task-title">{t.title}</div>
                <div className="task-meta">Dia: {t.date}</div>
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
            </div>
          ))}
        </div>
      </>
    );
  }

  /* ================= MAIN ================= */
  return (
    <div className="boston-root">
      <main className="b-main">
        {activeTab === "agenda" && renderAgenda()}
      </main>

      {/* MENU INFERIOR */}
      <nav className="bottom-nav">
        <div
          className={activeTab === "agenda" ? "nav-active" : ""}
          onClick={() => setActiveTab("agenda")}
        >
          Agenda
        </div>
        <div onClick={() => setActiveTab("notas")}>Notas</div>
        <div onClick={() => setActiveTab("alertas")}>Alertas</div>
        <div onClick={() => setActiveTab("mais")}>Mais</div>
      </nav>

      {/* 🔥 BOTÃO NOVA TAREFA (RESTAURADO) */}
      {activeTab === "agenda" && (
        <button className="fab-mobile" onClick={openAddTask}>
          +
        </button>
      )}

      {/* MODAL */}
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
