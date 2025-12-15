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
  const [r1,r2,r3,r4,r5] = splitThreeRows(days);

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
      done: false,
    };

    setTasksMap(p => ({
      ...p,
      [selectedDate]: [t, ...(p[selectedDate] || [])],
    }));

    setShowAddModal(false);
    setTaskText("");
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

      {/* Tarefas */}
      {activeTab === "Tarefas" && (
        <>
          {[r1,r2,r3,r4,r5].map((row,i)=>(
            <div className="cal-row" key={i}>
              {row.map(d=>(
                <div
                  key={d.date}
                  className={`cal-cell ${d.date===selectedDate?"cal-active":""}`}
                  onClick={()=>setSelectedDate(d.date)}
                >
                  {d.day}
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* BOTÃO + */}
      {activeTab === "Tarefas" && (
        <button className="fab-mobile" onClick={()=>setShowAddModal(true)}>
          +
        </button>
      )}

      {/* MODAL */}
      {showAddModal && (
        <div className="modal-back" onClick={()=>setShowAddModal(false)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">Nova tarefa</div>

            <input
              className="input"
              placeholder="Digite a tarefa"
              value={taskText}
              onChange={e=>setTaskText(e.target.value)}
              autoFocus
              onKeyDown={e=>{
                if (e.key==="Enter") saveTask();
                if (e.key==="Escape") setShowAddModal(false);
              }}
            />

            <div className="modal-actions">
              <button className="btn-ghost" onClick={()=>setShowAddModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={saveTask}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 BARRA INFERIOR */}
      <nav className="bottom-nav">
        <div
          className={`nav-btn ${activeTab==="Tarefas"?"nav-active":""}`}
          onClick={()=>setActiveTab("Tarefas")}
        >
          Tarefas
        </div>
        <div
          className={`nav-btn ${activeTab==="notas"?"nav-active":""}`}
          onClick={()=>setActiveTab("notas")}
        >
          Notas
        </div>
        <div
          className={`nav-btn ${activeTab==="alertas"?"nav-active":""}`}
          onClick={()=>setActiveTab("alertas")}
        >
          Alertas
        </div>
        <div
          className={`nav-btn ${activeTab==="mais"?"nav-active":""}`}
          onClick={()=>setActiveTab("mais")}
        >
          Mais
        </div>
      </nav>
    </div>
  );
}
