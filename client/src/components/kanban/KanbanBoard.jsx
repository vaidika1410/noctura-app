
import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";


import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import AddTodoForm from "../todo/AddTodoForm";
import EditTodoModal from "../todo/EditTodoModal";

const COLUMNS = ["To Do", "In Progress", "Done"];

const TODO_TO_KANBAN = {
  pending: "To Do",
  "in-progress": "In Progress",
  completed: "Done",
};

const KANBAN_TO_TODO = {
  "To Do": "pending",
  "In Progress": "in-progress",
  Done: "completed",
};

export default function KanbanBoard() {

  const handleDeleteTask = async (taskId) => {
    try {

      setGrouped((prev) => {
        const updated = {};
        for (const col of Object.keys(prev)) {
          updated[col] = prev[col].filter((t) => t._id !== taskId);
        }
        return updated;
      });


      await axios.delete(`/api/todo/${taskId}`);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete task");
      fetchTasks();
    }
  };

  const handleAddTaskFromColumn = (columnTitle) => {
    const status = KANBAN_TO_TODO[columnTitle] || "pending";
    setAddTaskStatus(status);
    setIsAddModalOpen(true);
  };

  const [grouped, setGrouped] = useState({
    "To Do": [],
    "In Progress": [],
    Done: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);



  const [activeId, setActiveId] = useState(null);
  const [editTask, setEditTask] = useState(null);

  const [addTaskStatus, setAddTaskStatus] = useState(null);



  const updateTaskComments = (taskId, updatedComments) => {
    setGrouped((prev) => {
      const next = {};
      for (const col of Object.keys(prev)) {
        next[col] = prev[col].map((t) =>
          t._id === taskId
            ? { ...t, comments: updatedComments }
            : t
        );
      }
      return next;
    });
  };



  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/todo");
      const data = res?.data?.data ?? res?.data ?? [];
      const groupedResp = { "To Do": [], "In Progress": [], Done: [] };

      if (Array.isArray(data)) {
        data.forEach((t) => {
          const col = TODO_TO_KANBAN[t.status] || "To Do";
          groupedResp[col].push({
            ...t,
            comments: Array.isArray(t.comments) ? t.comments : [],
          });

        });
      }

      setGrouped(groupedResp);
    } catch (err) {
      console.error("Kanban fetch error:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);


  const findColumnOfTask = (id) => {
    for (const col of COLUMNS) {
      if ((grouped[col] || []).some((t) => t._id === id)) return col;
    }
    return null;
  };


  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };


  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeIdLocal = active.id;
    const overId = over.id;


    if (String(overId).startsWith("col-")) {
      const destColumn = String(overId).slice(4);
      const srcColumn = findColumnOfTask(activeIdLocal);
      if (!srcColumn || srcColumn === destColumn) return;


      setGrouped((prev) => {
        const prevSrc = [...(prev[srcColumn] || [])];
        const prevDst = [...(prev[destColumn] || [])];
        const idx = prevSrc.findIndex((t) => t._id === activeIdLocal);
        if (idx === -1) return prev;
        const [moved] = prevSrc.splice(idx, 1);
        prevDst.unshift(moved);
        return { ...prev, [srcColumn]: prevSrc, [destColumn]: prevDst };
      });
    }


  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdLocal = active.id;
    const overId = over.id;

    const srcColumn = findColumnOfTask(activeIdLocal);
    let destColumn = null;

    if (String(overId).startsWith("col-")) {
      destColumn = String(overId).slice(4);
    } else {
      destColumn = findColumnOfTask(overId);
    }

    if (!srcColumn || !destColumn || srcColumn === destColumn) return;

    // optimistic UI (IMMUTABLE)
    setGrouped((prev) => {
      const srcTasks = prev[srcColumn].filter(t => t._id !== activeIdLocal);
      const movedTask = prev[srcColumn].find(t => t._id === activeIdLocal);
      if (!movedTask) return prev;

      const updatedTask = {
        ...movedTask,
        status: KANBAN_TO_TODO[destColumn]
      };

      return {
        ...prev,
        [srcColumn]: srcTasks,
        [destColumn]: [updatedTask, ...prev[destColumn]]
      };
    });

    try {
      await axios.put(`/api/todo/${activeIdLocal}`, {
        status: KANBAN_TO_TODO[destColumn],
      });
      await fetchTasks(); // sync with backend
    } catch (err) {
      console.error("Failed to update status:", err);
      await fetchTasks(); // rollback
    }
  };


  return (
    <div className="p-4 md:p-6 min-h-screen" style={{ background: "#151517", color: "#E5E7EB" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Kanban Board</h1>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              {loading ? "Loading…" : `${grouped["To Do"].length + grouped["In Progress"].length + grouped["Done"].length} tasks`}
            </div>

            <button onClick={() => setIsAddModalOpen(true)} className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 transition text-sm">
              Add Task
            </button>

            <button onClick={fetchTasks} className="px-3 py-2 rounded-md border border-white/10 hover:bg-white/5 text-sm">
              Refresh
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >

          {/* Top-level SortableContext for columns (helps mobile leave/enter detection) */}
          <SortableContext items={COLUMNS.map((c) => `col-${c}`)}>
            <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6 pb-6">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col}
                  title={col}
                  tasks={grouped[col] || []}
                  onEdit={(task) => setEditTask(task)}
                  onAddTask={handleAddTaskFromColumn}
                  onCommentsUpdate={updateTaskComments} 
                />


              ))}
            </div>
          </SortableContext>

          {/* Drag overlay - shows a floating copy while dragging */}
          <DragOverlay>
            {activeId ? (
              (() => {
                const srcCol = findColumnOfTask(activeId);
                const task = srcCol ? grouped[srcCol].find((t) => t._id === activeId) : null;
                return task ? <KanbanCard task={task} /> : null;
              })()
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {isAddModalOpen && (
        <AddTodoForm
          onClose={() => setIsAddModalOpen(false)}
          onTaskAdded={() => {
            fetchTasks();
            setIsAddModalOpen(false);
          }}
        />
      )}

      {editTask && (
        <EditTodoModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onUpdated={() => {
            fetchTasks();
            setEditTask(null);
          }}
        />
      )}

    </div>
  );
}
