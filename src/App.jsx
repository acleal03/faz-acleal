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
const PALETTES = { azul: "azul", vermelho: "vermelho", verde: "verde" };

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

  const [activeTab, setActiveTab] = useState("agenda");
  const [filter, setFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingTask, setEditingTask] = useState(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(today);
  const [formPalette, setFormPalette] = useState(PALETTES.azul);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksMap));
  }, [tasksMap]);

  const monthDays = generateMonthDays(viewYear, viewMonth);
  const [row1, row2, row3, row4, row5] = splitThreeRows(monthDays);

  function prevMonth() {
    setViewMonth((m) => (m === 0 ? 11 : m - 1));
    if (viewMonth === 0) setViewYear((y) => y - 1);
  }

  function nextMonth() {
    setViewMonth((m) => (m === 11 ? 0 : m + 1));
    if (viewMonth === 11) setViewYear((y) => y + 1);
  }

  function openAddModal() {
    setModalMode("add");
    setFormTitle("");
    setFormDate(selectedDate);
    setFormPalette(PALETTES.azul);
    setShowModal(true);
  }

  function saveAdd() {
    if (!formTitle.trim()) return;
    const t = {
      id: uid(),
      title: formTitle.trim(),
      date: formDate,
      createdAt: localISODateTime(),
      palette: formPalette,
      done: false,
    };
    setTasksMap((p) => ({
      ...p,
      [formDate]: [t, ...(p[formDate] || [])],
    }));
    setShowModal(false);
  }

  function toggleTask(task) {
    setTasksMap((p) => ({
      ...p,
      [task.date]: p[task.date].map((t) =>
        t.id === task.id ? { ...t, done: !t.done } : t
      ),
    }));
  }

  function tasksForDisplay() {
    return tasksMap[selectedDate] || [];
  }

  function CalendarCell({ d }) {
    return (
      <div
        className={`cal-cell ${d.date === selectedDate ? "cal-active" : ""}`}
        onClick={() => setSelectedDate(d.date)}
      >
        <div className="cal-week">{d.weekday}</div>
        <div className="cal-num">{d.day}</div>
      </div>
    );
  }

  return (
    <div className="boston-root">
      {/* HEADER */}
      <header className="b-header">
        <button className="menu-btn">☰</button>

        <div className="header-center">
          <div className="app-title">fazer@acleal</div>
          <div className="month-nav">
            <button className="menu-btn" onClick={prevMonth}>←</button>
            <span className="month-label">
              {new Date(viewYear, viewMonth).toLocaleString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button className="menu-btn" onClick={nextMonth}>→</button>
          </div>
        </div>

        <div />
      </header>

      {/* MAIN */}
      <main className="b-main">
        <div className="calendar-wrap">
          <div className="cal-row">{row1.map((d) => <CalendarCell key={d.date} d={d} />)}</div>
          <div className="cal-row">{row2.map((d) => <CalendarCell key={d.date} d={d} />)}</div>
          <div className="cal-row">{row3.map((d) => <CalendarCell key={d.date} d={d} />)}</div>
          <div className="cal-row">{row4.map((d) => <CalendarCell key={d.date} d={d} />)}</div>
          <div className="cal-row">{row5.map((d) => <CalendarCell key={d.date} d={d} />)}</div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              {selectedDate === today ? "Hoje" : selectedDate}
            </div>

            <div className="panel-actions">
              <div className="filters">
                <button className={`small-pill ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Todas</button>
                <button className={`small-pill ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>Pendentes</button>
                <button className={`small-pill ${filter === "done" ? "active" : ""}`} onClick={() => setFilter("done")}>Concluídas</button>
              </div>

              <button className="btn-new" onClick={openAddModal}>Nova</button>
            </div>
          </div>

          {tasksForDisplay().length === 0 ? (
            <div className="empty-large">Nenhuma tarefa.</div>
          ) : (
            tasksForDisplay().map((t) => (
              <div key={t.id} className="task-item">
                <div className="task-left">
                  <div className="task-title">{t.title}</div>
                  <div className="task-meta">{t.createdAt}</div>
                </div>

                <div className="task-right">
                  <input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} />
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="modal-back" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-actions">
              <button className="btn-primary" onClick={saveAdd}>Adicionar</button>
            </div>

            <h3 className="modal-title">Nova tarefa</h3>

            <div className="modal-form">
              <input
                className="input"
                placeholder="Digite a tarefa..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
              <input
                type="date"
                className="input"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <div className="nav-btn nav-active">Agenda</div>
        <div className="nav-btn">Notas</div>
        <div className="nav-btn">Alertas</div>
        <div className="nav-btn">Mais</div>
      </nav>

      {/* FAB */}
      <button className="fab-mobile" onClick={openAddModal}>+</button>
    </div>
  );
}
