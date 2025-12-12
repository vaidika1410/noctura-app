
import React, { useEffect, useState, useCallback } from "react";
import axios from "../../api/axiosInstance";
import AddNightTaskForm from "./AddNightTaskForm";
import NightTaskCard from "./NightTaskCard";
import EditNightTaskModal from "./EditNightTaskModal";

import { useNavigate } from "react-router-dom";

const getTodayDateString = (d = new Date()) => d.toISOString().split("T")[0];

export default function NightPlanner() {
  // Night Tasks
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [editTask, setEditTask] = useState(null);

  const navigate = useNavigate();

  const [entryLoading, setEntryLoading] = useState(true);
  const [entryError, setEntryError] = useState("");

  const [top1, setTop1] = useState("");
  const [top2, setTop2] = useState("");
  const [top3, setTop3] = useState("");
  const [prepareNotes, setPrepareNotes] = useState("");

  
  const [shutdownHabits, setShutdownHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(false);

  const [reflectionLearned, setReflectionLearned] = useState("");
  const [reflectionGrateful, setReflectionGrateful] = useState("");
  const [reflectionMood, setReflectionMood] = useState("3"); 
  const [reflectionFreeform, setReflectionFreeform] = useState("");

  const [shutdownReady, setShutdownReady] = useState(false);

  const [currentEntry, setCurrentEntry] = useState(null);

  const [journalOpen, setJournalOpen] = useState(false);
  const [journalNotes, setJournalNotes] = useState([]);
  const [loadingJournal, setLoadingJournal] = useState(false);

  const [dateStr, setDateStr] = useState(getTodayDateString());

  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    setTasksError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/night-tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasksArray = Array.isArray(res.data.data) ? res.data.data : [];
      tasksArray.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
      setTasks(tasksArray);
    } catch (err) {
      console.error("Error fetching night tasks:", err);
      setTasks([]);
      setTasksError("Failed to load night tasks.");
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this night task?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/night-tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleEdit = (task) => setEditTask(task);
  const cancelEdit = () => setEditTask(null);


  const fetchShutdownHabits = useCallback(async () => {
    setLoadingHabits(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/habits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = Array.isArray(res.data.data) ? res.data.data : res.data || [];

      const shutdownList = all.filter((h) => Boolean(h.isShutdown));
      const normalized = shutdownList.map((h) => ({
        ...h,
        _id: String(h._id || h.id),
        completed: false,
      }));
      setShutdownHabits(normalized);
      return normalized;
    } catch (err) {
      console.error("Failed to load habits:", err);
      setShutdownHabits([]);
      return [];
    } finally {
      setLoadingHabits(false);
    }
  }, []);

  const fetchNightEntry = useCallback(
    async (date = dateStr, baseShutdownHabits = []) => {
      setEntryLoading(true);
      setEntryError("");

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/night-entry?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const entry = res?.data?.data || null;
        setCurrentEntry(entry);

        if (!entry) {
          setTop1("");
          setTop2("");
          setTop3("");
          setPrepareNotes("");
          setReflectionLearned("");
          setReflectionGrateful("");
          setReflectionMood("3");
          setReflectionFreeform("");

        
          setShutdownHabits(
            baseShutdownHabits.map((h) => ({
              ...h,
              completed: false,
            }))
          );

          return;
        }

        // ---- Prepare Tomorrow ----
        const tops = Array.isArray(entry.topTasks) ? entry.topTasks : [];
        setTop1(tops[0] || "");
        setTop2(tops[1] || "");
        setTop3(tops[2] || "");
        setPrepareNotes(entry.notes || "");

        // ---- Reflection ----
        const reflectionRaw = entry.reflection || "";
        const learnedMatch = reflectionRaw.match(/Learned:(.*?)(?:\n|$)/i);
        const gratefulMatch = reflectionRaw.match(/Grateful:(.*?)(?:\n|$)/i);
        const moodMatch = reflectionRaw.match(/Mood:(.*?)(?:\n|$)/i);
        const restMatch = reflectionRaw.split(/\n\s*\n/).slice(1).join("\n\n");

        setReflectionLearned(learnedMatch ? learnedMatch[1].trim() : "");
        setReflectionGrateful(gratefulMatch ? gratefulMatch[1].trim() : "");
        setReflectionMood(moodMatch ? moodMatch[1].trim() : "3");
        setReflectionFreeform(
          restMatch
            ? restMatch.trim()
            : !learnedMatch && !gratefulMatch && !moodMatch
              ? reflectionRaw
              : ""
        );

        // ---- Merge Shutdown Habits ----
        const entryShutdown = Array.isArray(entry.shutdownHabits)
          ? entry.shutdownHabits
          : [];

        const map = new Map(
          baseShutdownHabits.map((h) => [String(h._id), { ...h }])
        );

        for (const s of entryShutdown) {
          const id = String(s.habitId);
          if (map.has(id)) {
            map.set(id, { ...map.get(id), completed: !!s.completed });
          }
        }

        // Apply final merged list
        setShutdownHabits(Array.from(map.values()));
      } catch (err) {
        console.error("Failed to fetch night entry:", err);
        setEntryError("Failed to load night entry.");
      } finally {
        setEntryLoading(false);
      }
    },
    [dateStr] 
  );

  useEffect(() => {
    let mounted = true;

    setShutdownReady(false);

    (async () => {
      const habits = await fetchShutdownHabits();
      if (!mounted) return;

      await fetchNightEntry(dateStr, habits);
      if (!mounted) return;

      setShutdownReady(true);
    })();

    return () => (mounted = false);
  }, [dateStr]);


  const toggleShutdownHabit = (habitId) => {
    setShutdownHabits((prev) =>
      prev.map((h) =>
        String(h._id) === String(habitId)
          ? { ...h, completed: !h.completed }
          : h
      )
    );
  };


  const buildReflectionString = () => {
    const lines = [];
    if (reflectionLearned.trim()) lines.push(`Learned: ${reflectionLearned.trim()}`);
    if (reflectionGrateful.trim()) lines.push(`Grateful: ${reflectionGrateful.trim()}`);
    if (reflectionMood) lines.push(`Mood: ${reflectionMood}`);

    if (reflectionFreeform.trim()) {
      if (lines.length) lines.push("");
      lines.push(reflectionFreeform.trim());
    }
    return lines.join("\n");
  };


  const handleSaveEntry = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      const payload = {
        date: dateStr,
        topTasks: [top1 || "", top2 || "", top3 || ""].filter((t) => !!t).slice(0, 3),
        notes: prepareNotes || "",
        reflection: buildReflectionString(),
      
        freeformJournal: reflectionFreeform || "",
        shutdownHabits: shutdownHabits.map((h) => ({
          habitId: String(h._id),
          completed: !!h.completed,
        })),
      };

      await axios.put("/night-entry", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

  
      await fetchNightEntry(dateStr);
      await fetchTasks();

      setReflectionLearned("");
      setReflectionGrateful("");
      setReflectionMood("3");
      setReflectionFreeform("");

      setShutdownHabits((prev) => prev.map((h) => ({ ...h, completed: false })));

    } catch (err) {
      // console.error("Failed to save night entry:", err);
      console.error("NightEntry save REAL error >>> ", err);
      alert(err?.response?.data?.message || "Failed to save night entry.");
    } finally {
      setSaving(false);
    }
  };

  // Journal history helpers
  const fetchJournalHistory = async () => {
    setLoadingJournal(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/night-entry/journal-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notes = Array.isArray(res.data.data) ? res.data.data : [];
      setJournalNotes(notes);
    } catch (err) {
      console.error("Failed to fetch journal history:", err);
      setJournalNotes([]);
    } finally {
      setLoadingJournal(false);
    }
  };

  const openJournal = async () => {
    setJournalOpen(true);
    await fetchJournalHistory();
  };

  const deleteJournalNote = async (noteId) => {
    if (!window.confirm("Delete this journal note?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/night-entry/journal/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchJournalHistory();
    } catch (err) {
      console.error("Failed to delete note:", err);
      alert("Failed to delete note");
    }
  };

  return (
    <div className="p-6" style={{ background: "#151517", minHeight: "100vh", color: "#E5E7EB" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold">Night Planner</h1>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400">{entryLoading ? "Loading…" : "Plan your tomorrow • Process today"}</div>
            <button
              onClick={() => {
                fetchShutdownHabits().then((h) => fetchNightEntry(dateStr, h));
                fetchTasks();
              }}
              className="px-3 py-2 rounded-md border border-white/10 hover:bg-white/5 text-sm"
            >
              Refresh
            </button>

            <button
              onClick={() => navigate("/journal")}
              className="px-3 py-2 rounded-md border border-white/10 hover:bg-white/5 text-sm"
            >
              Journal
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="rounded-xl p-4 shadow-lg" style={{ background: "#1B1B1D", border: "1px solid #2A2A2C" }}>
              <h2 className="text-lg font-semibold mb-3">Prepare Tomorrow</h2>

              <div className="space-y-2 mb-4">
                <label className="text-xs text-gray-400">Top 3 for tomorrow</label>
                <input
                  type="text"
                  value={top1}
                  onChange={(e) => setTop1(e.target.value)}
                  placeholder="1. Important task"
                  className="w-full p-2 rounded-md text-sm"
                  style={{ background: "#151517", border: "1px solid #202022", color: "#E5E7EB" }}
                />
                <input
                  type="text"
                  value={top2}
                  onChange={(e) => setTop2(e.target.value)}
                  placeholder="2. "
                  className="w-full p-2 rounded-md text-sm"
                  style={{ background: "#151517", border: "1px solid #202022", color: "#E5E7EB" }}
                />
                <input
                  type="text"
                  value={top3}
                  onChange={(e) => setTop3(e.target.value)}
                  placeholder="3. "
                  className="w-full p-2 rounded-md text-sm"
                  style={{ background: "#151517", border: "1px solid #202022", color: "#E5E7EB" }}
                />
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="text-xs text-gray-400">Notes</label>
                <textarea
                  value={prepareNotes}
                  onChange={(e) => setPrepareNotes(e.target.value)}
                  rows={3}
                  placeholder="Anything to remember for tomorrow..."
                  className="w-full p-2 rounded-md text-sm"
                  style={{ background: "#151517", border: "1px solid #202022", color: "#E5E7EB" }}
                />
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: "#1B1B1D", border: "1px solid #2A2A2C" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Night Tasks</h3>
                <div className="text-sm text-gray-400">{loadingTasks ? "Loading…" : `${tasks.length} tasks`}</div>
              </div>

              <AddNightTaskForm
                onTaskAdded={() => {
                  fetchTasks();
                }}
                editTask={editTask}
                onCancelEdit={() => cancelEdit()}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {tasks.length === 0 && !loadingTasks ? <div className="text-gray-400 text-sm">No night tasks yet.</div> : null}
                {tasks.map((task) => (
                  <NightTaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Shutdown Habits */}
            <div className="rounded-xl p-4" style={{ background: "#1B1B1D", border: "1px solid #2A2A2C" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Shutdown</h3>
                <div className="text-xs text-gray-400">Evening habits from your tracker</div>
              </div>

              {!shutdownReady ? (
                <div className="text-gray-400 text-sm">Loading habits...</div>
              ) : shutdownHabits.length === 0 ? (
                <div className="text-gray-400 text-sm">No habits added to Shutdown yet.</div>
              ) : (
                <div className="space-y-2">
                  {shutdownHabits.map((h) => (
                    <label
                      key={h._id}
                      className="flex items-center justify-between gap-3 p-2 rounded-md"
                      style={{ background: "#151517", border: "1px solid #202022" }}
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-200">{h.title}</div>
                        {h.description && <div className="text-xs text-gray-400">{h.description}</div>}
                      </div>

                      <input
                        type="checkbox"
                        checked={!!h.completed}
                        onChange={() => toggleShutdownHabit(h._id)}
                        className="w-4 h-4"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Reflection */}
            <div className="rounded-xl p-4" style={{ background: "#1B1B1D", border: "1px solid #2A2A2C" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Process Today</h3>
                <div className="text-xs text-gray-400">Reflect briefly before sleep</div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Today I learned</label>
                  <input
                    type="text"
                    value={reflectionLearned}
                    onChange={(e) => setReflectionLearned(e.target.value)}
                    placeholder="One thing you learned today"
                    className="w-full p-2 rounded-md text-sm"
                    style={{ background: "#151517", border: "1px solid #202022", color: "#E5E7EB" }}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400">I'm grateful for</label>
                  <input
                    type="text"
                    value={reflectionGrateful}
                    onChange={(e) => setReflectionGrateful(e.target.value)}
                    placeholder="One thing you're grateful for"
                    className="w-full p-2 rounded-md text-sm"
                    style={{ background: "#151517", border: "1px solid #202022", color: "#E5E7EB" }}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400">Mood (1-5)</label>
                  <select
                    value={reflectionMood}
                    onChange={(e) => setReflectionMood(e.target.value)}
                    className="w-full p-2 rounded-md text-sm"
                    style={{ background: "#151517", border: "1px solid #202022", color: "#E5E7EB" }}
                  >
                    <option value="1">1 — Low</option>
                    <option value="2">2</option>
                    <option value="3">3 — Neutral</option>
                    <option value="4">4</option>
                    <option value="5">5 — Great</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs text-gray-400">Reflection / Journal</label>
                <textarea
                  value={reflectionFreeform}
                  onChange={(e) => setReflectionFreeform(e.target.value)}
                  rows={5}
                  placeholder="Write anything you want to process before sleep..."
                  className="w-full p-2 rounded-md text-sm"
                  style={{ background: "#151517", border: "1px solid #202022", color: "#E5E7EB" }}
                />
              </div>

              {/* Save button */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-400">Date: {dateStr}</div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const today = getTodayDateString();
                      setDateStr(today);
                      fetchShutdownHabits().then((h) => fetchNightEntry(today, h));
                    }}
                    className="px-3 py-2 rounded-md border border-white/10 hover:bg-white/5 text-sm"
                  >
                    Today
                  </button>

                  <button onClick={handleSaveEntry} disabled={saving} className="px-4 py-2 rounded-md text-sm font-semibold" style={{ background: "#4A6CF7", color: "white" }}>
                    {saving ? "Saving..." : "Save Night"}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Tip: marking shutdown habits here will store their nightly completion under this entry. Habit streak logic remains in Habits.
            </div>
          </div>
        </div>

        {/* Edit Night Task Modal */}
        {editTask && (
          <EditNightTaskModal
            task={editTask}
            onClose={() => setEditTask(null)}
            onUpdated={() => {
              setEditTask(null);
              fetchTasks();
            }}
          />
        )}

        {/* Journal modal */}
        {journalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-6 overflow-auto">
            <div className="w-full max-w-2xl rounded-xl p-6 bg-[#1B1B1D]" style={{ border: "1px solid #2A2A2C" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Journal History</h2>
                <div>
                  <button onClick={() => setJournalOpen(false)} className="px-3 py-1 rounded border">Close</button>
                </div>
              </div>

              {loadingJournal ? (
                <p className="text-gray-400">Loading...</p>
              ) : journalNotes.length === 0 ? (
                <p className="text-gray-400">No journal entries yet.</p>
              ) : (
                <div className="space-y-3">
                  {journalNotes.map((n) => (
                    <div key={n.noteId} className="p-3 rounded-md" style={{ background: "#151517", border: "1px solid #202022" }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs text-gray-400">Entry date: {n.entryDate} • Saved: {new Date(n.createdAt).toLocaleString()}</div>
                          <div className="mt-2 text-sm">{n.text}</div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <button onClick={() => deleteJournalNote(n.noteId)} className="px-3 py-1 rounded bg-[#E85D75] text-white text-sm">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
