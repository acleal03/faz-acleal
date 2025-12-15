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
  /* ================= ESTADO PRINCIPAL ================= */
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

  /* ================= PERSISTÊNCIA ================= */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksMap));
  }, [tasksMap]);

  /* ================= CALENDÁRIO ================= */
  const monthDays = generateMonthDays(viewYear, viewMonth);
  const [row1, row2, row3, row4, row5] = splitThreeRows(monthDays);

  /* ================= HELPERS ================= */

  // existe tarefa neste dia?
  function hasTasks(date) {
    return Array.isArray(tasksMap[date]) && tasksMap[date].length > 0;
  }

  // preparado para alertas (quando existir estado de alertas)
  function hasAlerts(date) {
    return false; // por enquanto não existe alerta no app
  }

  /* ================= NAVEGAÇÃO DE MESES ================= */
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

  /* ================= TAREFAS ================= */
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

    setTaskText("");
    setShowAddModal(false);
  }

  /* ================= RENDER ================= */
  return (
    <div className="boston-root">
      {/* ================= HEADER ================= */}
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

      {/* ================= CALENDÁRIO ================= */}
      {[row1, row2, row3, row4, row5].map((row, idx) => (
        <div className="cal-row" key={idx}>
          {row.map((d) => (
            <div
              key={d.date}
              className={`cal-cell ${
                d.date === selectedDate ? "cal-active" : ""
              }`}
              onClick={() => setSelectedDate(d.date)}
            >
              {/* 🔥 INDICADORES PREMIUM */}
              {(hasTasks(d.date) || hasAlerts(d.date)) && (
                <div className="day-indicators">
                  {hasTasks(d.date) && (
                    <div className="day-badge badge-task">T</div>
                  )}
                  {hasAlerts(d.date) && (
                    <div className="day-badge badge-alert">A</div>
                  )}
                </div>
              )}

              <div className="cal-week">{d.weekday}</div>
              <div className="cal-num">{d.day}</div>
            </div>
          ))}
        </div>
      ))}

      {/* ================= BOTÃO + ================= */}
      <button
        className="fab-mobile"
        onClick={() => setShowAddModal(true)}
      >
        +
      </button>

      {/* ================= MODAL NOVA TAREFA ================= */}
      {showAddModal && (
        <div className="modal-back" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
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
              <button
                className="btn-ghost"
                onClick={() => setShowAddModal(false)}
              >
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
