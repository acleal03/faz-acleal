import React, { useEffect, useState } from "react";
import "./App.css";
import { generateDays, todayISO, uid } from "./utils";

const STORAGE_KEY = "faz_acleal_boston_v1";

const PALETTES = {
  azul: { id: "azul", color: "#2F80ED" },
  vermelho: { id: "vermelho", color: "#EF4444" },
  verde: { id: "verde", color: "#10B981" },
};

// helpers
function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function formatDateTimeBR(v) {
  if (!v) return "";
  if (v.includes(" ") && !v.includes("T")) {
    const [date, time] = v.split(" ");
    return `${formatDateBR(date)} ${time}`;
  }
  const dt = new Date(v);
  if (isNaN(dt.getTime())) return v;
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}
function localISODateTime() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}
function isOverdue(task) {
  const today = todayISO();
  return task && task.date < today && !task.done;
}

export default function App() {
  // app state
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [tasksMap, setTasksMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  const [activeTab, setActiveTab] = useState("agenda"); // agenda | notas | alertas | mais
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("all");

  // modal fields
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(todayISO());
  const [formPalette, setFormPalette] = useState(PALETTES.azul.id);

  // notes & alerts (simple)
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY + "_notes")) || [];
    } catch {
      return [];
    }
  });
  const [alerts, setAlerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY + "_alerts")) || [];
    } catch {
      return [];
    }
  });

  // persist
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksMap)), [tasksMap]);
  useEffect(() => localStorage.setItem(STORAGE_KEY + "_notes", JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem(STORAGE_KEY + "_alerts", JSON.stringify(alerts)), [alerts]);

  // days
  const days = generateDays();
  const last = days.length;
  const half = Math.ceil(last / 2);
  const row1 = days.slice(0, half);
  const row2 = days.slice(half);

  // ensure selectedDate is today when month contains today
  useEffect(() => {
    const t = todayISO();
    if (days.find(d => d.date === t)) setSelectedDate(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  // auto-mark overdue tasks red (when app starts or date change)
  useEffect(() => {
    const today = todayISO();
    let changed = false;
    const updated = Object.fromEntries(
      Object.entries(tasksMap).map(([date, list]) => {
        const newList = list.map(t => {
          if (!t.done && t.date < today && t.palette !== PALETTES.vermelho.id) {
            changed = true;
            return { ...t, palette: PALETTES.vermelho.id };
          }
          return t;
        });
        return [date, newList];
      })
    );
    if (changed) setTasksMap(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const tasksOfDay = tasksMap[selectedDate] || [];
  const todayTasks = tasksMap[todayISO()] || [];
  const todayDone = todayTasks.filter(t => t.done).length;
  const todayTotal = todayTasks.length;

  // modal open
  function openAddModal() {
    setModalMode("add");
    setFormTitle("");
    setFormDate(selectedDate);
    setFormPalette(PALETTES.azul.id);
    setEditingTask(null);
    setShowModal(true);
  }
  function openEditModal(task) {
    setModalMode("edit");
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDate(task.date);
    setFormPalette(task.palette || PALETTES.azul.id);
    setShowModal(true);
  }

  // add
  function saveAdd() {
    if (!formTitle.trim()) return alert("Descreva a tarefa.");
    const today = todayISO();
    const paletteToUse = formDate < today ? PALETTES.vermelho.id : formPalette || PALETTES.azul.id;
    const t = {
      id: uid(),
      title: formTitle.trim(),
      done: false,
      palette: paletteToUse,
      createdAt: localISODateTime(),
      date: formDate,
    };
    setTasksMap(prev => ({ ...prev, [formDate]: [t, ...(prev[formDate] || [])] }));
    setShowModal(false);
  }

  // edit
  function saveEdit() {
    if (!editingTask) return;
    if (!formTitle.trim()) return alert("Título inválido.");
    const today = todayISO();
    setTasksMap(prev => {
      const m = { ...prev };
      Object.keys(m).forEach(d => { m[d] = m[d].filter(x => x.id !== editingTask.id); });
      const palette = editingTask.done ? PALETTES.verde.id : (formDate < today ? PALETTES.vermelho.id : formPalette || PALETTES.azul.id);
      const updated = { ...editingTask, title: formTitle.trim(), palette, date: formDate };
      m[formDate] = [updated, ...(m[formDate] || [])];
      return m;
    });
    setShowModal(false);
    setEditingTask(null);
  }

  // toggle done
  function toggleTask(task) {
    setTasksMap(prev => {
      const m = { ...prev };
      m[task.date] = (m[task.date] || []).map(t => {
        if (t.id !== task.id) return t;
        const done = !t.done;
        const palette = done ? PALETTES.verde.id : (t.date < todayISO() ? PALETTES.vermelho.id : PALETTES.azul.id);
        return { ...t, done, palette };
      });
      return m;
    });
  }

  // delete
  function deleteTask(task) {
    if (!confirm("Remover tarefa?")) return;
    setTasksMap(prev => {
      const m = { ...prev };
      m[task.date] = (m[task.date] || []).filter(t => t.id !== task.id);
      return m;
    });
  }

  function visibleTasks(list) {
    if (!list) return [];
    if (filter === "pending") return list.filter(t => !t.done);
    if (filter === "done") return list.filter(t => t.done);
    return list;
  }

  // notes/alerts helpers
  function addNote(text) { if (!text || !text.trim()) return; setNotes(n => [{ id: uid(), text: text.trim(), createdAt: localISODateTime() }, ...n]); }
  function removeNote(id) { if (!confirm("Remover nota?")) return; setNotes(n => n.filter(x => x.id !== id)); }
  function addAlert(text) { if (!text || !text.trim()) return; setAlerts(a => [{ id: uid(), text: text.trim(), createdAt: localISODateTime() }, ...a]); }
  function removeAlert(id) { if (!confirm("Remover alerta?")) return; setAlerts(a => a.filter(x => x.id !== id)); }

  // small renderers
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
      <header className="b-header">
        <div className="b-left">
          <button className="menu-btn" aria-label="menu" onClick={() => setActiveTab("agenda")}>☰</button>
          <h1 className="app-title">fazer@acleal</h1>
        </div>
        <div className="b-right">
          <div className="month-label">{new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" })}</div>
        </div>
      </header>

      <main className="b-main">
        <section className="calendar-wrap">
          <div className="cal-row">{row1.map(d => <CalendarCell key={d.date} d={d} />)}</div>
          <div className="cal-row">{row2.map(d => <CalendarCell key={d.date} d={d} />)}</div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">{selectedDate === todayISO() ? "Hoje" : formatDateBR(selectedDate)}</div>
              <div className="panel-sub">{todayDone}/{todayTotal} concluídas hoje</div>
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

          <div className="tasks-list">
            {visibleTasks(tasksOfDay).length === 0 ? (
              <div className="empty-large">Nenhuma tarefa.</div>
            ) : visibleTasks(tasksOfDay).map(t => (
              <article key={t.id} className={`task-item ${t.done ? "task-done" : ""}`}>
                <div className="task-left">
                  <div className="task-title">{t.title}</div>
                  <div className="task-meta">Criada: {formatDateTimeBR(t.createdAt)} </div>
                  <div className="task-meta"> • Dia: {formatDateBR(t.date)}</div>
                </div>
                <div className="task-right">
                  <input type="checkbox" className="task-actions" checked={!!t.done} onChange={() => toggleTask(t)} />
                  <button className="icon" onClick={() => openEditModal(t)} title="Editar">✏️</button>
                  <button className="icon del" onClick={() => deleteTask(t)} title="Remover">🗑️</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* modal */}
      {showModal && (
        <div className="modal-back" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-card" role="dialog" aria-modal>
            <h3>{modalMode === "add" ? "Nova tarefa" : "Editar tarefa"}</h3>

             <div className="modal-actions">
              {modalMode === "add" ? (
                <button className="btn-primary" onClick={saveAdd}>Adicionar</button>
              ) : (
                <>
                  <button className="btn-primary" onClick={saveEdit}>Salvar</button>
                  <button className="btn-ghost" onClick={() => { setShowModal(false); setEditingTask(null); }}>Cancelar</button>
                </>
              )}
            </div>
            
            <input className="input" placeholder="Título" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
            <div className="row">
              <input type="date" className="input date" value={formDate} onChange={e => setFormDate(e.target.value)} />
              <select className="input" value={formPalette} onChange={e => setFormPalette(e.target.value)}>
                <option value="azul">Azul (a realizar)</option>
                <option value="vermelho">Vermelho (pendente)</option>
                <option value="verde">Verde (concluída)</option>
              </select>
            </div>
           
          </div>
        </div>
      )}

      {/* bottom nav */}
      <nav className="bottom-nav">
        <div className={`nav-btn ${activeTab === "agenda" ? "nav-active" : ""}`} onClick={() => setActiveTab("agenda")}>Agenda</div>
        <div className={`nav-btn ${activeTab === "notas" ? "nav-active" : ""}`} onClick={() => setActiveTab("notas")}>Notas</div>
        <div className={`nav-btn ${activeTab === "alertas" ? "nav-active" : ""}`} onClick={() => setActiveTab("alertas")}>Alertas</div>
        <div className={`nav-btn ${activeTab === "mais" ? "nav-active" : ""}`} onClick={() => setActiveTab("mais")}>Mais</div>
      </nav>

      {/* floating add */}
      <button className="fab-mobile" onClick={() => { setActiveTab("agenda"); openAddModal(); }}>+</button>
    </div>
  );
}
