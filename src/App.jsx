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

  const [showModal, setShowModal] = useState(false);
  const [taskText, setTaskText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksMap));
  }, [tasksMap]);

  const monthDays = generateMonthDays(viewYear, viewMonth);
  const [row1, row2, row3, row4, row5] = splitThreeRows(monthDays);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  }

  return (
    <div className="boston-root">
      {/* 🔥 HEADER CENTRALIZADO */}
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

      <main>
        {[row1,row2,row3,row4,row5].map((row,i)=>(
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
      </main>
    </div>
  );
}
