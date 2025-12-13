import React, { useEffect, useMemo, useState } from "react";
import axios from "../../api/axiosInstance";
import { getToken } from "../../utils/auth";

import AddTodoForm from "../todo/AddTodoForm";
import "./CalendarPage.css";

function fmtISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isoToLocalYMD(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return fmtISODate(d);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);


  const startOffset = first.getDay(); 

  const cells = [];

  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, i - startOffset + 1);
    cells.push({ date: d, isOtherMonth: true });
  }


  for (let d = 1; d <= last.getDate(); d++) {
    cells.push({ date: new Date(year, month, d), isOtherMonth: false });
  }

  while (cells.length < 42) {
    const prev = cells[cells.length - 1].date;
    const next = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
    cells.push({ date: next, isOtherMonth: true });
  }

  return cells;
}


function pickPriorityColor(tasks = []) {
  let hasHigh = false;
  let hasMedium = false;
  let hasLow = false;
  for (const t of tasks) {
    const p = String((t.priority || t.pr || t.priorityLevel || "").toLowerCase()).trim();
    if (!p) continue;
    if (p.includes("high") || p.includes("urgent")) hasHigh = true;
    else if (p.includes("med") || p.includes("normal")) hasMedium = true;
    else if (p.includes("low")) hasLow = true;
  }
  if (hasHigh) return "high";
  if (hasMedium) return "medium";
  if (hasLow) return "low";
  return "default";
}

export default function CalendarPage() {

  async function refreshRemindersForMonth(date = viewDate) {
    const y = date.getFullYear();
    const m = date.getMonth();

    const start = fmtISODate(new Date(y, m, 1));
    const end = fmtISODate(new Date(y, m + 1, 0));

    try {
      const res = await axios.get(`/api/reminders/range?start=${start}&end=${end}`);
      const map = {};

      (res.data || []).forEach((rem) => {
        if (!map[rem.date]) map[rem.date] = [];
        map[rem.date].push(rem);
      });

      setRemindersByDate(map);
    } catch (err) {
      console.error("refreshRemindersForMonth error:", err);
    }
  }


  const [viewDate, setViewDate] = useState(new Date()); 
  const [tasksByDate, setTasksByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [remindersByDate, setRemindersByDate] = useState({});
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);


  async function fetchAllTasks() {
    setLoading(true);
    try {
      const res = await axios.get("/api/todo");
      const items = (res.data && (res.data.data || res.data)) || [];

      const map = {};
      (items || []).forEach((t) => {
        if (!t.dueDate) return;
        const key = isoToLocalYMD(t.dueDate);
        if (!map[key]) map[key] = [];
        map[key].push(t);
      });

      setTasksByDate(map);

      if (selectedDate) {
        const selectedKey = fmtISODate(selectedDate);
        setSelectedTasks(map[selectedKey] || []);
      }
    } catch (err) {
      console.error("CalendarPage fetch error:", err);
      setTasksByDate({});
      setSelectedTasks([]);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchAllTasks();
    }
    return () => {
      mounted = false;
    };
  }, []);

  const grid = useMemo(() => {
    return buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth());
  }, [viewDate]);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();

    const start = fmtISODate(new Date(y, m, 1));
    const end = fmtISODate(new Date(y, m + 1, 0));

    axios
      .get(`/reminders/range?start=${start}&end=${end}`)
      .then((res) => {
        const map = {};
        (res.data || []).forEach((rem) => {
          const key = rem.date;
          if (!map[key]) map[key] = [];
          map[key].push(rem);
        });
        setRemindersByDate(map);
      })
      .catch((err) => {
        console.error("Reminders range error:", err);
        setRemindersByDate({});
      });
  }, [viewDate]);

  useEffect(() => {
    if (!selectedDate) return;

    const iso = fmtISODate(selectedDate);

    axios.get(`/api/reminders/${iso}`).then((res) => {
      setReminders(res.data || []);
    });
  }, [selectedDate]);


  async function handleAddReminder() {
    if (!selectedDate) return;

    const iso = fmtISODate(selectedDate);
    const payload = { ...newReminder, date: iso };

    try {
      await axios.post("/api/reminders", payload);

      await refreshRemindersForMonth();

      const r = await axios.get(`/api/reminders/${iso}`);
      setReminders(r.data || []);

      setNewReminder({ title: "", description: "", time: "" });
    } catch (err) {
      console.error("Reminder save error:", err);
    }
  }


  async function handleDeleteReminder(id) {
    if (!confirm("Delete this reminder?")) return;

    const iso = fmtISODate(selectedDate);

    await axios.delete(`/api/reminders/${id}`);

    await refreshRemindersForMonth();

    const res = await axios.get(`/api/reminders/${iso}`);
    setReminders(res.data || []);
  }


  function goPrevMonth() {
    setViewDate((d) => {
      const n = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      return n;
    });
  }
  function goNextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }
  function goToday() {
    setViewDate(new Date());
  }

  function handleDayClick(cellDate) {
    setSelectedDate(cellDate);
    const key = fmtISODate(cellDate);
    setSelectedTasks(tasksByDate[key] || []);
    setSidebarOpen(true);

  }


  function goToDashboard() {
    window.location.href = "/dashboard";
  }

  const [reminders, setReminders] = useState([]);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    time: "",
  });

  useEffect(() => {
    if (!selectedDate) return;
    const iso = fmtISODate(selectedDate);

    axios.get(`/api/reminders/${iso}`).then((res) => {
      setReminders(res.data || []);
    });
  }, [selectedDate]);


  async function handleDeleteTask(id) {
    if (!confirm("Delete this task?")) return;

    await axios.delete(`/api/todo/${id}`);

    await fetchAllTasks();
  }

  async function handleSaveTask() {
    if (!editingTask) return;
    console.log("Saving task (from calendar):", editingTask);

    try {
      const payload = {
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        dueDate: editingTask.dueDate,
      };

      const res = await axios.put(`/api/todo/${editingTask._id}`, payload);
      console.log("Task save response:", res.data);

      await fetchAllTasks();

      setTaskModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error("Error saving task:", err);
      alert("Failed to save task. Check console for details.");
    }
  }

  return (
    <div className="cp-page-root">
      {/* LEFT column - reminders/overview */}
      <aside className="cp-left-col">
        <div className="cp-left-card">
          <h4>Today</h4>
          <p className="muted">{today.toDateString()}</p>
        </div>
        <div className="cp-left-card">
          <h3>Quick Reminders</h3>

          {(!reminders || reminders.length === 0) && (
            <p className="muted">No reminders for this date.</p>
          )}

          {reminders && reminders.length > 0 && (
            <ul className="cp-reminder-list">
              {reminders.map((r) => (
                <li key={r._id} className="cp-reminder-item">
                  <div className="rem-top">
                    <strong>{r.title}</strong>
                    {r.time && <span className="cp-rem-time">{r.time}</span>}
                  </div>

                  {r.description && <p className="muted small">{r.description}</p>}

                  <div className="rem-actions">
                    <button
                      className="btn tiny"
                      onClick={() => {
                        setNewReminder({
                          title: r.title,
                          description: r.description,
                          time: r.time || "",
                        });
                        setEditingReminderId(r._id);
                        setReminderModalOpen(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="btn tiny danger"
                      onClick={() => handleDeleteReminder(r._id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button
            className="btn small"
            onClick={() => {
              if (!selectedDate) {
                alert("Please select a date on the calendar first.");
                return;
              }
              setReminderModalOpen(true);
            }}
          >
            + Add Reminder
          </button>
        </div>
      </aside>

      {/* CENTER column - calendar */}
      <main className="cp-center-col">
        <div className="cp-header">
          <div>
            <h1 className="cp-title">Calendar</h1>
            <p className="cp-sub">View tasks by date</p>
          </div>

          <div className="cp-controls">
            <button className="btn small" onClick={goPrevMonth} aria-label="Previous month">◀</button>
            <button className="btn small" onClick={goToday} aria-label="Go to today">Today</button>
            <button className="btn small" onClick={goNextMonth} aria-label="Next month">▶</button>
          </div>
        </div>

        <div className="cp-calendar-shell">
          <div className="cp-month-title border-b border-b-[#232325] pb-2">
            {viewDate.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </div>

          {/* Weekday headings (Sunday-first) */}
          <div className="cp-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
              <div key={w} className="cp-weekday">{w}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="cp-grid">
            {grid.map((cell, idx) => {
              const iso = fmtISODate(cell.date);
              const tasks = tasksByDate[iso] || [];
              const remindersForDay = remindersByDate[iso] || [];

              const isToday = cell.date.toDateString() === today.toDateString();
              const isSelected =
                selectedDate &&
                cell.date.toDateString() === selectedDate.toDateString();

              const priority = pickPriorityColor(tasks);

              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(cell.date)}
                  className={`cp-tile ${cell.isOtherMonth ? "other" : "current"} ${isToday ? "now" : ""} ${isSelected ? "selected" : ""}`}
                  title={`${cell.date.toDateString()} — ${tasks.length} tasks`}
                >
                  <div className={`cp-left-mark ${tasks.length ? `cp-mark-${priority}` : ""}`} />

                  <div className="cp-tile-content">
                    <div className="cp-daynum" style={{ color: cell.isOtherMonth ? "#6B6B6F" : "white" }}>
                      {cell.date.getDate()}
                    </div>

                    <div className="cp-dot-row" aria-hidden>
                      {tasks.slice(0, 3).map((t, i) => (
                        <span key={i} className="cp-dot" />
                      ))}

                      {remindersForDay.length > 0 && (
                        <span className="cp-reminder-dot" />
                      )}

                      {tasks.length > 3 && <span className="cp-plus">+{tasks.length - 3}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {loading && <div className="cp-loading">Loading tasks…</div>}
        </div>
      </main>

      {/* RIGHT column - task sidebar */}
      <aside className={`cp-right-col ${sidebarOpen ? "open" : "closed"}`}>
        <div className="cp-right-header">
          <div>
            <div className="cp-sidebar-title">Tasks</div>
            <div className="cp-sidebar-date">
              {selectedDate ? selectedDate.toDateString() : "Select a date"}
            </div>
          </div>

          <button className="btn small" onClick={() => setSidebarOpen(false)}>
            Close
          </button>
        </div>

        <div className="cp-right-body">
          {!selectedDate && <p className="muted">Pick a date to see tasks.</p>}

          {selectedDate && (!selectedTasks || selectedTasks.length === 0) && (
            <p className="muted">No tasks for this date.</p>
          )}

          {selectedTasks && selectedTasks.length > 0 && (
            <ul className="cp-task-list">
              {selectedTasks.map((t) => (
                <li key={t._id} className="cp-task-card">
                  <div className="cp-task-line">
                    <div className="cp-task-title">{t.title}</div>
                    <div className={`cp-task-status cp-status-${t.status || "pending"}`}>
                      {t.status}
                    </div>
                  </div>

                  {t.description && <div className="cp-task-desc">{t.description}</div>}

                  <div className="task-actions">
                    <button
                      className="btn tiny"
                      onClick={() => {
                        setEditingTask({
                          _id: t._id,
                          title: t.title || "",
                          description: t.description || "",
                          status: t.status || "pending",
                          dueDate: t.dueDate || ""
                        });
                        setTaskModalOpen(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="btn tiny danger"
                      onClick={() => handleDeleteTask(t._id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cp-right-footer">
          <button
            className="btn primary"
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
          >
            + Add Task
          </button>
        </div>
      </aside>

      {/* Floating Go to Dashboard */}
      <button className="cp-floating-dashboard z-10" onClick={goToDashboard}>
        Go to Dashboard
      </button>

      {/* REMINDER MODAL */}
      {reminderModalOpen && (
        <div className="cp-modal">
          <div className="cp-modal-content">
            <h3>Add Reminder</h3>
            <p className="muted small">
              Date: {selectedDate ? selectedDate.toDateString() : "None"}
            </p>

            <input
              type="text"
              placeholder="Title"
              value={newReminder.title}
              onChange={(e) =>
                setNewReminder({ ...newReminder, title: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              value={newReminder.description}
              onChange={(e) =>
                setNewReminder({
                  ...newReminder,
                  description: e.target.value,
                })
              }
            />

            <input
              type="time"
              value={newReminder.time}
              onChange={(e) =>
                setNewReminder({ ...newReminder, time: e.target.value })
              }
            />

            <div className="cp-modal-actions">
              <button
                className="btn"
                onClick={() => setReminderModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="btn primary"
                onClick={async () => {
                  if (!selectedDate) {
                    alert("Select a date first.");
                    return;
                  }

                  const iso = fmtISODate(selectedDate);
                  const payload = { ...newReminder, date: iso };

                  if (editingReminderId) {
                    await axios.put(`/api/reminders/${editingReminderId}`, payload);
                  } else {
                    await axios.post("/api/reminders", payload);
                  }
                  await refreshRemindersForMonth();

                  const res = await axios.get(`/api/reminders/${iso}`);
                  setReminders(res.data || []);
                  setReminderModalOpen(false);
                  setEditingReminderId(null);
                  setNewReminder({ title: "", description: "", time: "" });
                }}
              >
                {editingReminderId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK MODAL - Add (via AddTodoForm) */}
      {taskModalOpen && !editingTask && (
        <AddTodoForm
          prefilledDate={selectedDate ? fmtISODate(selectedDate) : undefined}
          onClose={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
          }}
          onTaskAdded={async () => {
            await fetchAllTasks();
            setTaskModalOpen(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* TASK MODAL - Edit (existing task inline modal you had) */}
      {taskModalOpen && editingTask && (
        <div className="cp-modal">
          <div className="cp-modal-content">
            <h3>Edit Task</h3>

            <input
              type="text"
              placeholder="Title"
              value={editingTask.title}
              onChange={(e) =>
                setEditingTask({ ...editingTask, title: e.target.value })
              }
            />

            <textarea
              placeholder="Add a description (optional)"
              value={editingTask.description}
              onChange={(e) =>
                setEditingTask({ ...editingTask, description: e.target.value })
              }
            />

            <label className="cp-select-label">Status</label>
            <select
              className="cp-select"
              value={editingTask.status}
              onChange={(e) =>
                setEditingTask({ ...editingTask, status: e.target.value })
              }
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <div className="cp-modal-actions">
              <button
                className="btn"
                onClick={() => {
                  setTaskModalOpen(false);
                  setEditingTask(null);
                }}
              >
                Cancel
              </button>

              <button
                className="btn primary"
                onClick={async () => {
                  await handleSaveTask();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
