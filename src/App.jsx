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

  const [filter, setFilter] = useState("all");
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(today);

  const [tasksMap, setTasksMap] = useState(() =>
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksMap));
  }, [tasksMap]);

  const monthDays = generateMonthDays(viewYear, viewMonth);
  const [row1,row2,row3,row4,row5] = splitThreeRows(monthDays);

  /* ===== HELPERS ===== */
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
    Object.values(tasksMap).forEach(list =>
      list.forEach(t => {
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

  /* ===== RENDER ===== */
  const finalList = applyFilter(tasksForAgenda());

  return (
    <div className="boston-root">
      <main>
        {[row1,row2,row3,row4,row5].map((row,i)=>(
          <div className="cal-row" key={i}>
            {row.map(d=>(
              <div key={d.date}
                className={`cal-cell ${d.date===selectedDate?"cal-active":""}`}
                onClick={()=>setSelectedDate(d.date)}>
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
                  className={`small-pill ${filter==="all"?"active":""}`}
                  onClick={()=>setFilter("all")}
                >Todas</button>

                <button
                  className={`small-pill ${filter==="today"?"active":""}`}
                  onClick={()=>setFilter("today")}
                >Hoje</button>

                <button
                  className={`small-pill ${filter==="late"?"active":""}`}
                  onClick={()=>setFilter("late")}
                >Atrasadas</button>
              </div>
            )}
          </div>

          {finalList.length === 0 && (
            <div className="empty-large">Nenhuma tarefa.</div>
          )}

          {finalList.map(t=>(
            <div key={t.id} className={`task-item ${borderClass(t)}`}>
              <div className="task-left">
                <div className="task-title">{t.title}</div>
                <div className="task-meta">Dia: {t.date}</div>
              </div>
              <div className="task-right">
                <input type="checkbox" checked={t.done} readOnly />
                <button className="icon">✏️</button>
                <button className="icon">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
