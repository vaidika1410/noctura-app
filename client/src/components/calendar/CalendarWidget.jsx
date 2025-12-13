import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiCalendar, FiGrid } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import MiniCalendar from "./MiniCalendar";
import "./CalendarWidget.css";

export default function CalendarWidget({ onDateSelect, onAddTask }) {
  const navigate = useNavigate();
  const rootRef = useRef(null);

  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get("/api/todo");
      const items = (res.data && (res.data.data || res.data)) || [];
      const map = {};
      items.forEach((t) => {
        if (!t.dueDate) return;
        const d = new Date(t.dueDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
        if (!map[key]) map[key] = [];
        map[key].push(t);
      });
      setTasksByDate(map);
    } catch (err) {
      console.error("CalendarWidget fetch error:", err);
      setTasksByDate({});
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    function onDocDown(e) {
      if (!expanded) return;
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setExpanded(false);
        setSelectedDate(null);
      }
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [expanded]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setExpanded(false);
        setSelectedDate(null);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const fmtISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const handleSelect = (d) => {
    setValue(d);
    setSelectedDate(d);
    const key = fmtISO(d);
    setTasksForSelectedDate(tasksByDate[key] || []);
    if (typeof onDateSelect === "function") onDateSelect(d);
  };

  const handleAddTaskClick = (e) => {
    e && e.stopPropagation();
    if (!selectedDate) return;
    const d = new Date(selectedDate);
    d.setHours(12, 0, 0, 0);
    if (typeof onAddTask === "function") {
      onAddTask(d);
    } else if (window.openAddTodoFromCalendar) {
      window.openAddTodoFromCalendar(d);
    } else {
      navigate("/dashboard");
      setTimeout(() => {
        if (window.openAddTodoFromCalendar) window.openAddTodoFromCalendar(d);
      }, 300);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`cw-widget-root ${expanded ? "cw-expanded" : "cw-collapsed"}`}
      style={{ zIndex: 100 }}
    >
      {/* pill header  */}
      <div
        className="cw-pill"
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
          if (expanded) {
            setSelectedDate(null);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        <div className="cw-pill-icon" aria-hidden>
          <FiCalendar size={18} />
        </div>

        {expanded && (
          <>
            <div className="cw-pill-title">Calendar</div>

            <div className="cw-pill-actions">
              <button
                className="cw-page-btn"
                title="Open full calendar"
                onClick={(ev) => {
                  ev.stopPropagation();
                  navigate("/calendar");
                }}
                aria-label="Open calendar page"
              >
                <FiGrid size={14} />
              </button>

              <button
                className="cw-close-small"
                title="Close"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setExpanded(false);
                  setSelectedDate(null);
                }}
                aria-label="Close widget"
              >
                ×
              </button>
            </div>
          </>
        )}
      </div>

      {/* expanded body */}
      {expanded && (
        <div className="cw-expanded-body" onClick={(e) => e.stopPropagation()}>
          <div className="cw-mini-wrapper">
            <MiniCalendar
              value={value}
              onSelect={handleSelect}
              tileSize={70} 
              tasksByDate={tasksByDate}
              compact={true}
            />
          </div>

          {/* Task popup: floats left on desktop, below on mobile */}
          {selectedDate && (
            <div
              className="cw-task-popup"
              role="dialog"
              aria-label={`Tasks for ${selectedDate.toDateString()}`}
              onClick={(e) => e.stopPropagation()}
              style={{ zIndex: 60 }}
            >
              <div className="popup-head">
                <div className="popup-title">Tasks for</div>
                <div className="popup-date">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>

              <div className="popup-body">
                {tasksForSelectedDate.length === 0 ? (
                  <p className="no-tasks">No tasks for this date</p>
                ) : (
                  <ul className="task-list">
                    {tasksForSelectedDate.map((t) => (
                      <li key={t._id} className={`task-item status-${t.status || "pending"}`}>
                        <div className="task-line">
                          <span className="task-title">{t.title || "Untitled"}</span>
                          <span className="task-badge">{t.status}</span>
                        </div>
                        {t.description && <div className="task-desc">{t.description}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="popup-actions">
                <button className="add-task-btn" onClick={handleAddTaskClick}>
                  + Add Task
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
