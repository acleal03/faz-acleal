import React, { useEffect, useState } from "react";
import "./App.css";
import { todayISO, uid, generateMonthDays, localISODateTime } from "./utils";

const STORAGE_KEY = "faz_acleal_boston_v3";

export default function App() {
  const today = todayISO();

  const [activeTab] = useState("Agenda");
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

  /* =========================
     TAREFAS ATRASADAS
  ========================= */
  function overdueTasks() {
    const list = [];
    Object.entries(tasksMap).forEach(([date, tasks]) => {
      if (date < today) {
        tasks.forEach(t => {
          if (!t.done) list.push(t);
        });
      }
    });
    return list;
  }

  function tasksForSelectedDay() {
    const base = tasksMap[selectedDate] || [];
    if (selectedDate !== today) return base;
    return [...overdueTasks(), ...base];
  }

  function taskClass(t) {
    if (t.done) return "task-done";
    if (t.date < today) return "task-late";
    return "task-today";
  }

  function toggleTask(task) {
    setTasksMap(prev => {
      const map = { ...prev };
      map[task.date] = map[task.date].map(t =>
        t.id === task.id ? { ...t, done: !t.done } : t
      );
      return map;
    });
  }

  function deleteTask(task) {
    if (!confirm("Excluir tarefa?")) return;
    setTasksMap(prev => {
      const map = { ...prev };
      map[task.date] = map[task.date].filter(t => t.id !== task.id);
      return map;
    });
  }

  function openEdit(task) {
    setEditingTask(task);
    setTaskText(task.title);
    setShowEditModal(true);
  }

  function saveEdit() {
    if (!taskText.trim()) return;

    setTasksMap(prev => {
      const map = { ...prev };
      map[editingTask.date] = map[editingTask.date].map(t =>
        t.id === editingTask.id ? { ...t, title: taskText.trim() } : t
      );
      return map;
    });

    setShowEditModal(false);
    setEditingTask(null);
    setTaskText("");
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

    setTasksMap(prev => ({
      ...prev,
      [selectedDate]: [t, ...(prev[selectedDate] || [])],
    }));

    setTaskText("");
    setShowAddModal(false);
  }

  function prevMonth() {
    setViewMonth(m => (m === 0 ? 11 : m - 1));
    if (viewMonth === 0) setViewYear(y => y - 1);
  }

  function nextMonth() {
    setViewMonth(m => (m === 11 ? 0 : m + 1));
    if (viewMonth === 11) setViewYear(y => y + 1);
  }

  function hasTasks(date) {
    return (tasksMap[date] || []).length > 0;
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
                <div className="day-badge">T</div>
              </div>
            )}
            <div className="cal-week">{d.weekday}</div>
            <div className="cal-day">{d.day}</div>
          </div>
        ))}
      </div>

      {/* LISTA */}
      <div className="panel">
        <div className="panel-title">
          {selectedDate === today ? "Hoje" : selectedDate.split("-").reverse().join("/")}
        </div>

        {tasksForSelectedDay().length === 0 ? (
          <div className="empty">Nenhuma tarefa.</div>
        ) : (
          tasksForSelectedDay().map(t => (
            <div key={t.id} className={`task-item ${taskClass(t)}`}>
              <div className="task-info">
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  Data: {t.date.split("-").reverse().join("/")}
                </div>
              </div>

              <div className="task-actions">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(t)}
                />
                <button onClick={() => openEdit(t)}>✏️</button>
                <button onClick={() => deleteTask(t)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button className="fab-mobile" onClick={() => setShowAddModal(true)}>+</button>

      {/* MODAL NOVA */}
      {showAddModal && (
        <div className="modal-back" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <input
              className="input"
              placeholder="Digite a tarefa"
              value={taskText}
              onChange={e => setTaskText(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveTask}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditModal && (
        <div className="modal-back" onClick={() => setShowEditModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <input
              className="input"
              value={taskText}
              onChange={e => setTaskText(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveEdit}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MENU */}
      <nav className="bottom-nav">
        <div className="nav-btn nav-active">Agenda</div>
        <div className="nav-btn">Notas</div>
        <div className="nav-btn">Alertas</div>
        <div className="nav-btn">Mais</div>
      </nav>
    </div>
  );
}
