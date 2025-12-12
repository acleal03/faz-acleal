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

/* ============================
   FORMATADORES
   ============================ */
function formatDateBRdash(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split(" ")[0].split("-");
  return `${d}-${m}-${y}`;
}

function formatDateTimeBR(v) {
  if (!v) return "";
  if (v.includes(" ") && !v.includes("T")) {
    const [date, time] = v.split(" ");
    return `${formatDateBRdash(date)} ${time}`;
  }
  const dt = new Date(v);
  if (isNaN(dt)) return v;
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}`;
}

/* Paletas */
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

  // persistência
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksMap)), [tasksMap]);
  useEffect(() => localStorage.setItem(STORAGE_KEY + "_notes", JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem(STORAGE_KEY + "_alerts", JSON.stringify(alerts)), [alerts]);

  // gerar calendário
  const monthDays = generateMonthDays(viewYear, viewMonth);
  const [row1, row2, row3, row4, row5] = splitThreeRows(monthDays);

  // Seleciona o dia correto ao trocar de mês
  useEffect(() => {
    if (monthDays.some((d) => d.date === today)) {
      setSelectedDate(today);
    }
  }, [viewYear, viewMonth]);

  // Auto-marca atrasadas
  useEffect(() => {
    let changed = false;
    const updated = Object.fromEntries(
      Object.entries(tasksMap).map(([date, list]) => {
        const newList = list.map((task) => {
          if (!task.done && task.date < today && task.palette !== PALETTES.vermelho) {
            changed = true;
            return { ...task, palette: PALETTES.vermelho };
          }
          return task;
        });
        return [date, newList];
      })
    );
    if (changed) setTasksMap(updated);
  }, [selectedDate]);

  /* =============================
      CLASSIFICAÇÃO DAS TAREFAS
     ============================= */
  function isLate(t) {
    return t.date < today && !t.done;
  }

  function isTodayPending(t) {
    return t.date === today && !t.done;
  }

  function isDone(t) {
    return t.done;
  }

  // lista final exibida (inclui atrasadas no dia atual)
  function tasksForDisplay() {
    const base = tasksMap[selectedDate] || [];
    if (selectedDate !== today) return base;

    // inclui atrasadas
    const overdue = [];
    Object.values(tasksMap).forEach((list) => {
      list.forEach((t) => {
        if (isLate(t)) overdue.push(t);
      });
    });

    return [...overdue, ...base];
  }

  /* Modal */
  function openAddModal() {
    setModalMode("add");
    setFormTitle("");
    setFormDate(selectedDate);
    setFormPalette(PALETTES.azul);
    setEditingTask(null);
    setShowModal(true);
  }

  function openEditModal(task) {
    setModalMode("edit");
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDate(task.date);
    setFormPalette(task.palette);
    setShowModal(true);
  }

  /* Salvar nova */
  function saveAdd() {
    if (!formTitle.trim()) return alert("Descreva a tarefa.");

    let palette = formPalette;
    if (formDate < today) palette = PALETTES.vermelho;

    const t = {
      id: uid(),
      title: formTitle.trim(),
      date: formDate,
      createdAt: localISODateTime(),
      palette,
      done: false,
    };

    setTasksMap((prev) => ({
      ...prev,
      [formDate]: [t, ...(prev[formDate] || [])],
    }));
    setShowModal(false);
  }

  /* Editar */
  function saveEdit() {
    if (!editingTask) return;
    if (!formTitle.trim()) return alert("Título inválido.");

    const todayKey = today;

    setTasksMap((prev) => {
      const m = { ...prev };

      // limpa anteriores
      Object.keys(m).forEach((k) => (m[k] = m[k].filter((x) => x.id !== editingTask.id)));

      let palette = formPalette;
      if (editingTask.done) palette = PALETTES.verde;
      else if (formDate < todayKey) palette = PALETTES.vermelho;

      const updated = { ...editingTask, title: formTitle.trim(), date: formDate, palette };
      m[formDate] = [updated, ...(m[formDate] || [])];
      return m;
    });

    setShowModal(false);
    setEditingTask(null);
  }

  /* Toggle */
  function toggleTask(task) {
    setTasksMap((prev) => {
      const m = { ...prev };
      m[task.date] = (m[task.date] || []).map((t) => {
        if (t.id !== task.id) return t;
        const done = !t.done;
        const palette = done
          ? PALETTES.verde
          : t.date < today
          ? PALETTES.vermelho
          : PALETTES.azul;
        return { ...t, done, palette };
      });
      return m;
    });
  }

  /* Excluir */
  function deleteTask(task) {
    if (!confirm("Remover tarefa?")) return;
    setTasksMap((prev) => {
      const m = { ...prev };
      m[task.date] = m[task.date].filter((t) => t.id !== task.id);
      return m;
    });
  }

  /* Filtros */
  function visibleTasks(list) {
    if (filter === "pending") return list.filter((t) => !t.done);
    if (filter === "done") return list.filter((t) => t.done);
    return list;
  }

  /* Calendar Cells */
  function CalendarCell({ d }) {
    const isActive = d.date === selectedDate;
    const isToday = d.date === today;

    return (
      <div
        className={`cal-cell ${isActive ? "cal-active" : ""} ${
          isToday ? "cal-today" : ""
        }`}
        onClick={() => setSelectedDate(d.date)}
      >
        <div className="cal-week">{d.weekday}</div>
        <div className="cal-num">{d.day}</div>
      </div>
    );
  }

  /* Navigação de mês */
  function prevMonth() {
    setViewMonth((m) => (m === 0 ? 11 : m - 1));
    if (viewMonth === 0) setViewYear((y) => y - 1);
  }

  function nextMonth() {
    setViewMonth((m) => (m === 11 ? 0 : m + 1));
    if (viewMonth === 11) setViewYear((y) => y + 1);
  }

  /* Render Agenda */
  function renderAgenda() {
    return (
      <>
        <div className="calendar-wrap">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
          </div>

          <div className="cal-row">{row1.map((d) => <CalendarCell key={d.date} d={d} />)}</div>
          <div className="cal-row">{row2.map((d) => <CalendarCell key={d.date} d={d} />)}</div>
          <div className="cal-row">{row3.map((d) => <CalendarCell key={d.date} d={d} />)}</div>
          <div className="cal-row">{row4.map((d) => <CalendarCell key={d.date} d={d} />)}</div>
          <div className="cal-row">{row5.map((d) => <CalendarCell key={d.date} d={d} />)}</div>
        </div>

        {/* Painel */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">
                {selectedDate === today ? "Hoje" : formatDateBRdash(selectedDate)}
              </div>
            </div>

            <div className="panel-actions">
              <div className="filters">
                <button
                  className={`small-pill ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  Todas
                </button>
                <button
                  className={`small-pill ${filter === "pending" ? "active" : ""}`}
                  onClick={() => setFilter("pending")}
                >
                  Pendentes
                </button>
                <button
                  className={`small-pill ${filter === "done" ? "active" : ""}`}
                  onClick={() => setFilter("done")}
                >
                  Concluídas
                </button>
              </div>

              <button className="btn-new" onClick={openAddModal}>
                Nova
              </button>
            </div>
          </div>

          <div className="tasks-list">
            {visibleTasks(tasksForDisplay()).length === 0 ? (
              <div className="empty-large">Nenhuma tarefa.</div>
            ) : (
              visibleTasks(tasksForDisplay()).map((t) => (
                <article
                  key={t.id}
                  className={`task-item ${t.done ? "task-done" : ""}`}
                  style={{
                    borderLeft: isLate(t)
                      ? "16px solid #ff4d4d"
                      : isTodayPending(t)
                      ? "16px solid #ffb347"
                      : isDone(t)
                      ? "16px solid #4ade80"
                      : "16px solid transparent",
                  }}
                >
                  <div className="task-left">
                    <div className="task-title">{t.title}</div>
                    <div className="task-meta">Criada: {formatDateTimeBR(t.createdAt)}</div>
                    <div className="task-meta">Dia: {formatDateBRdash(t.date)}</div>
                  </div>

                  <div className="task-right">
                    <input
                      className="task-actions"
                      type="checkbox"
                      checked={!!t.done}
                      onChange={() => toggleTask(t)}
                    />
                    <button className="icon" onClick={() => openEditModal(t)}>
                      ✏️
                    </button>
                    <button className="icon del" onClick={() => deleteTask(t)}>
                      🗑️
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </>
    );
  }

  /* Outras abas */
  function renderNotas() {
    let inputRef = null;

    return (
      <div style={{ padding: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" placeholder="Nova nota..." ref={(r) => (inputRef = r)} />
          <button
            className="btn-new"
            onClick={() => {
              if (inputRef?.value) {
                setNotes((n) => [
                  { id: uid(), text: inputRef.value, createdAt: localISODateTime() },
                  ...n,
                ]);
                inputRef.value = "";
              }
            }}
          >
            Adicionar
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {notes.length === 0 ? (
            <p className="empty-large">Sem notas.</p>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="task-item">
                <div className="task-left">
                  <div className="task-title" style={{ fontSize: 32 }}>
                    {n.text}
                  </div>
                  <div className="task-meta">{formatDateTimeBR(n.createdAt)}</div>
                </div>

                <button className="icon del" onClick={() => removeNote(n.id)}>
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  function renderAlerts() {
    let inputRef = null;

    return (
      <div style={{ padding: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" placeholder="Novo alerta..." ref={(r) => (inputRef = r)} />
          <button
            className="btn-new"
            onClick={() => {
              if (inputRef?.value) {
                setAlerts((a) => [
                  { id: uid(), text: inputRef.value, createdAt: localISODateTime() },
                  ...a,
                ]);
                inputRef.value = "";
              }
            }}
          >
            Adicionar
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {alerts.length === 0 ? (
            <p className="empty-large">Sem alertas.</p>
          ) : (
            alerts.map((n) => (
              <div key={n.id} className="task-item">
                <div className="task-left">
                  <div className="task-title" style={{ fontSize: 32 }}>
                    {n.text}
                  </div>
                  <div className="task-meta">{formatDateTimeBR(n.createdAt)}</div>
                </div>

                <button className="icon del" onClick={() => removeAlert(n.id)}>
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  function renderMore() {
    return (
      <div style={{ padding: 12 }}>
        <h3 style={{ fontSize: 38 }}>Mais / Configurações</h3>

        <button
          className="btn-new"
          onClick={() => {
            if (confirm("Tem certeza que deseja apagar TODAS as tarefas?"))
              setTasksMap({});
          }}
        >
          Limpar tarefas
        </button>
      </div>
    );
  }

  /* =============================
        RENDER PRINCIPAL
     ============================= */

  return (
    <div className="boston-root">
      {/* HEADER */}
      <header className="b-header">
        <div className="b-left">
          <button className="menu-btn" onClick={() => setActiveTab("agenda")}>
            ☰
          </button>
          <h1 className="app-title">fazer@acleal</h1>
        </div>

        <div className="b-right">
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="menu-btn" onClick={prevMonth}>
                ←
              </button>

              <div className="month-label" style={{ fontSize: 35, fontWeight: 700 }}>
                {new Date(viewYear, viewMonth).toLocaleString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </div>

              <button className="menu-btn" onClick={nextMonth}>
                →
              </button>
            </div>
        </div>
      </header>

      <main className="b-main">
        {activeTab === "agenda" && renderAgenda()}
        {activeTab === "notas" && renderNotas()}
        {activeTab === "alertas" && renderAlerts()}
        {activeTab === "mais" && renderMore()}
      </main>

      {/* MODAL */}
      {showModal && (
        <div
          className="modal-back"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal-card">
              
               <div className="modal-actions">
                 {modalMode === "add" ? (
                     <button className="btn-primary" onClick={saveAdd}>
                      Adicionar
                    </button>
                      ) : (
                    <>
                      <button className="btn-primary" onClick={saveEdit}>
                        Salvar
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={() => {
                          setShowModal(false);
                          setEditingTask(null);
                        }}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
              </div>

            <h3 className="modal-title">
              {modalMode === "add" ? "Nova tarefa" : "Editar tarefa"}    
            </h3>

            <div className="modal-form">
              <label className="modal-title ">Título</label>
              <input
                className="input title-input"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Digite a tarefa..."
              />

              <div className="row">
                <div style={{ flex: 1 }}>
                  <label className="field-label"></label>
                  <input
                    type="date"
                    className="input date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>

                <div style={{ width: 180 }}>
                  <label className="field-label">Cor</label>
                  <select
                    className="input"
                    value={formPalette}
                    onChange={(e) => setFormPalette(e.target.value)}
                  >
                    <option value="azul">Azul</option>
                    <option value="vermelho">Vermelho</option>
                    <option value="verde">Verde</option>
                  </select>
                </div>
              </div>

           
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <div
          className={`nav-btn ${activeTab === "agenda" ? "nav-active" : ""}`}
          onClick={() => setActiveTab("agenda")}
        >
          Agenda
        </div>

        <div
          className={`nav-btn ${activeTab === "notas" ? "nav-active" : ""}`}
          onClick={() => setActiveTab("notas")}
        >
          Notas
        </div>

        <div
          className={`nav-btn ${activeTab === "alertas" ? "nav-active" : ""}`}
          onClick={() => setActiveTab("alertas")}
        >
          Alertas
        </div>

        <div
          className={`nav-btn ${activeTab === "mais" ? "nav-active" : ""}`}
          onClick={() => setActiveTab("mais")}
        >
          Mais
        </div>
      </nav>

      {/* FAB */}
      <button className="fab-mobile" onClick={openAddModal}>
        +
      </button>
    </div>
  );
}
