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

  /* MODAL NOVA TAREFA (SIMPLES) */
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskText, setTaskText] = useState("");

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

  /* ================= TASK LIST ================= */
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
    setTaskText("");
    setShowAddModal(true);
  }

  function saveTask() {
    if (!taskText.trim()) return;

    const t = {
      id: uid(),
      title: taskText.trim(),
      date: selectedDate,
      createdAt: localISODateTime(),
      done: false,
    };

    setTasksMap((prev) => ({
      ...prev,
      [selectedDate]: [t, ...(prev[selectedDate] || [])],
    }));

    setShowAddModal(false);
  }

  function toggleTask(t) {
    setTasksMap((prev) => ({
      ...prev,
      [t.date]: prev[t.date].map((x) =>
        x.id === t.id ? { ...x, done: !x.done } : x
      ),
    }));
  }

  function deleteTask(t) {
    if (!confirm("Excluir tarefa?")) return;
    setTasksMap((prev) => ({
      ...prev,
      [t.date]: prev[t.date].filter((x) => x.id !== t.id),
    }));
  }

  /* ================= HEADER ================= */
  function prevMonth() {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function nextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  /* ================= RENDER ================= */
  const finalList = applyFilter(tasksForAgenda());

  return (
    <div className="boston-root">
      {/* 🔥 HEADER RESTAURADO */}
      <header className="b-header">
        <div></div>

        <div className="header-center">
          <div className="app-title">faz@acleal</div>

          <div className="month-nav">
            <button className="menu-btn" onClick={prevMonth}>
              ←
            </button>

            <span className="month-label">
              {new Date(viewYear, viewMonth).toLocaleString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </span>

            <button className="menu-btn" onClick={nextMonth}>
              →
            </button>
          </div>
        </div>

        <div></div>
      </header>

      <main className="b-main">
        {activeTab === "agenda" && (
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
                      className={`small-pill ${
                        filter === "all" ? "active" : ""
                      }`}
                      onClick={() => setFilter("all")}
                    >
                      Todas
                    </button>
                    <button
                      className={`small-pill ${
                        filter === "today" ? "active" : ""
                      }`}
                      onClick={() => setFilter("today")}
                    >
                      Hoje
                    </button>
                    <button
                      className={`small-pill ${
                        filter === "late" ? "active" : ""
                      }`}
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
        )}
      </main>

      {/* MENU INFERIOR */}
      <nav className="bottom-nav">
        <div className="nav-active">Agenda</div>
        <div>Notas</div>
        <div>Alertas</div>
        <div>Mais</div>
      </nav>

      {/* BOTÃO + */}
      <button className="fab-mobile" onClick={openAddTask}>
        +
      </button>

      {/* MODAL SIMPLES NOVA TAREFA */}
      {showAddModal && (
        <div className="modal-back" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Nova tarefa</div>

            <input
              className="input"
              placeholder="Digite a tarefa"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTask();
                if (e.key === "Escape") setShowAddModal(false);
              }}
            />

            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}>
                Cancelar
              </button>
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
