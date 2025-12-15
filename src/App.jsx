import React, { useEffect, useState } from "react";
import "./App.css";
import {
  todayISO,
  uid,
  generateMonthDays,
  localISODateTime,
} from "./utils";

const STORAGE_KEY = "faz_acleal_boston_v3";

/* ===== FORMATADOR BR ===== */
function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksMap));
  }, [tasksMap]);

  const days = generateMonthDays(viewYear, viewMonth);

  /* ===== STATUS VISUAL ===== */
  function taskClass(t) {
    if (t.done) return "task-done";        // verde
    if (t.date < today) return "task-late"; // vermelho
    return "task-today";                   // azul
  }

  function hasTasks(date) {
    return Array.isArray(tasksMap[date]) && tasksMap[date].length > 0;
  }

  /* ===== NAVEGAÇÃO ===== */
  function prevMonth() {
    setViewMonth(m => (m === 0 ? 11 : m - 1));
    if (viewMonth === 0) setViewYear(y => y - 1);
  }

  function nextMonth() {
    setViewMonth(m => (m === 11 ? 0 : m + 1));
    if (viewMonth === 11) setViewYear(y => y + 1);
  }

  /* ===== CRUD ===== */
  function saveTask() {
    if (!taskText.trim()) return;

    const t = {
      id: uid(),
      title: taskText.trim(),
      date: selectedDate,
      createdAt: localISODateTime(),
      done: false,
    };

    setTasksMap(p => ({
      ...p,
      [selectedDate]: [t, ...(p[selectedDate] || [])],
    }));

    setTaskText("");
    setShowAddModal(false);
  }

  function toggleDone(task) {
    setTasksMap(prev => ({
      ...prev,
      [task.date]: prev[task.date].map(t =>
        t.id === task.id ? { ...t, done: !t.done } : t
      ),
    }));
  }

  function deleteTask(task) {
    if (!confirm("Excluir tarefa?")) return;
    setTasksMap(prev => ({
      ...prev,
      [task.date]: prev[task.date].filter(t => t.id !== task.id),
    }));
  }

  function openEdit(task) {
    setEditingTask(task);
    setTaskText(task.title);
    setShowEditModal(true);
  }

  function saveEdit() {
    setTasksMap(prev => ({
      ...prev,
      [editingTask.date]: prev[editingTask.date].map(t =>
        t.id === editingTask.id ? { ...t, title: taskText } : t
      ),
    }));
    setTaskText("");
    setEditingTask(null);
    setShowEditModal(false);
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
            <div>{d.weekday}</div>
            <strong>{d.day}</strong>
          </div>
        ))}
      </div>

      {/* LISTA */}
      <div className="panel">
        <div className="panel-title">
          {selectedDate === today ? "Hoje" : formatDateBR(selectedDate)}
        </div>

        {(tasksMap[selectedDate] || []).length === 0 ? (
          <div>Nenhuma tarefa.</div>
        ) : (
          (tasksMap[selectedDate] || []).map(t => (
            <div key={t.id} className={`task-item ${taskClass(t)}`}>
              <div>
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  {formatDateBR(t.date)}
                </div>
              </div>

              <div className="task-actions">
                <button onClick={() => toggleDone(t)}>✔</button>
                <button onClick={() => openEdit(t)}>✏️</button>
                <button onClick={() => deleteTask(t)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button className="fab-mobile" onClick={() => setShowAddModal(true)}>+</button>

      {/* MODAL ADD */}
      {showAddModal && (
        <div className="modal-back" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <input
              className="input"
              value={taskText}
              onChange={e => setTaskText(e.target.value)}
              placeholder="Digite a tarefa"
            />
            <button onClick={saveTask}>Salvar</button>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {showEditModal && (
        <div className="modal-back" onClick={() => setShowEditModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <input
              className="input"
              value={taskText}
              onChange={e => setTaskText(e.target.value)}
            />
            <button onClick={saveEdit}>Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
}
