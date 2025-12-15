import React, { useEffect, useState } from "react";
import "./App.css";
import {
  todayISO,
  uid,
  generateMonthDays,
  localISODateTime,
} from "./utils";

const STORAGE_KEY = "faz_acleal_boston_v3";

export default function App() {
  const today = todayISO();

  const [activeTab, setActiveTab] = useState("Tarefas");
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(today);

  const [tasksMap, setTasksMap] = useState(() =>
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [taskText, setTaskText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksMap));
  }, [tasksMap]);

  const days = generateMonthDays(viewYear, viewMonth);

  function hasTasks(date) {
    return Array.isArray(tasksMap[date]) && tasksMap[date].length > 0;
  }

  function prevMonth() {
    setViewMonth(m => (m === 0 ? 11 : m - 1));
    if (viewMonth === 0) setViewYear(y => y - 1);
  }

  function nextMonth() {
    setViewMonth(m => (m === 11 ? 0 : m + 1));
    if (viewMonth === 11) setViewYear(y => y + 1);
  }

  function saveTask() {
    if (!taskText.trim()) return;

    const t = {
      id: uid(),
      title: taskText.trim(),
      date: selectedDate,
      createdAt: localISODateTime(),
    };

    setTasksMap(p => ({
      ...p,
      [selectedDate]: [t, ...(p[selectedDate] || [])],
    }));

    setTaskText("");
    setShowAddModal(false);
  }

  return (
    <div className="boston-root">
      {/* HEADER */}
      <header className="b-header">
        <div className="app-title">faz@acleal</div>
        <div className="month-nav">
          <button className="menu-btn" onClick={prevMonth}>←</button>
          <div className="month-label">
            {new Date(viewYear, viewMonth).toLocaleString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <button className="menu-btn" onClick={nextMonth}>→</button>
        </div>
      </header>

      {/* CALENDÁRIO */}
      <div className="calendar-grid">
        {days.map(d => (
          <div
            key={d.date}
            className={`cal-cell ${d.date === selectedDate ? "cal-active" : ""}`}
            onClick={() => setSelectedDate(d.date)}
          >
            {hasTasks(d.date) && (
              <div className="day-indicators">
                <div className="day-badge badge-task">T</div>
              </div>
            )}
            <div>{d.weekday}{d.day}</div>
          </div>
        ))}
      </div>

      {/* LISTA DE TAREFAS */}
      <div className="panel">
        <div className="panel-title">
          {selectedDate === today ? "Hoje" : selectedDate}
        </div>

        {(tasksMap[selectedDate] || []).length === 0 ? (
          <div>Nenhuma tarefa.</div>
        ) : (
          (tasksMap[selectedDate] || []).map(t => (
            <div key={t.id} className="task-item">
              {t.title}
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button className="fab-mobile" onClick={() => setShowAddModal(true)}>
        +
      </button>

      {/* ================= MODAL NOVA TAREFA ================= */}
      {showAddModal && (
        <div
          className="modal-back"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-title">Nova tarefa</div>

            <div className="modal-form">
              <input
                className="input"
                placeholder="Digite a tarefa"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                autoFocus
              />

              <input
                type="date"
                className="input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-ghost"
                onClick={() => setShowAddModal(false)}
              >
                Cancelar
              </button>

              <button
                className="btn-primary"
                onClick={saveTask}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MENU INFERIOR */}
      <nav className="bottom-nav">
        <div
          className={`nav-btn ${activeTab==="Tarefas"?"nav-active":""}`}
          onClick={()=>setActiveTab("Tarefas")}
        >
          Agenda
        </div>
        <div className="nav-btn">Notas</div>
        <div className="nav-btn">Alertas</div>
        <div className="nav-btn">Mais</div>
      </nav>
    </div>
  );
}
