
import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import AddTodoForm from "./AddTodoForm";
import TodoCard from "./TodoCard";
import EditTodoModal from "./EditTodoModal";

export default function TodoList({
  selectedDate,
  openAddTodoModal,
  setOpenAddTodoModal,
}) {
  const [tasks, setTasks] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/todo");
      const fetched = Array.isArray(res.data.data) ? res.data.data : [];
      setTasks(fetched);
    } catch (err) {
      console.error("Fetch error:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  
  useEffect(() => {
    if (!selectedDate) return;

    const normalized =
      typeof selectedDate === "string"
        ? new Date(selectedDate + "T12:00:00") 
        : selectedDate;

    setDateFilter(normalized);
  }, [selectedDate]);

  useEffect(() => {
    let filtered = tasks;

    // Status filter
    if (filter !== "all") {
      filtered = filtered.filter((t) => t.status.toLowerCase() === filter);
    }

    // Date filter
    if (dateFilter) {
      const filterDate =
        typeof dateFilter === "string"
          ? new Date(dateFilter + "T12:00:00")
          : dateFilter;

      filtered = filtered.filter((t) => {
        if (!t.dueDate) return false;

        const taskDate = new Date(t.dueDate);

        
        return taskDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, filter, dateFilter]);
  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };


  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/todo/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Couldn't update status");
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axios.delete(`/api/todo/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Couldn't delete");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };


  return (
    <div
      className="p-4 md:p-8 min-h-screen text-white"
      style={{ backgroundColor: "#151517" }}
    >
      {/* HEADER */}
      <h1 className="text-3xl font-semibold mb-4">My To-Do List</h1>

      {/* INLINE ADD FORM */}
      <div className="w-full mb-8">
        <AddTodoForm
          inline={true}
          prefilledDate={null}
          onTaskAdded={() => fetchTasks()}
          onClose={() => {}}
        />
      </div>

      {/* FILTER PANEL */}
      <div className="flex flex-wrap gap-3 mt-6 mb-6">
        {["all", "pending", "in-progress", "completed"].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition"
            style={{
              backgroundColor: filter === key ? "#2563EB" : "#1B1B1D",
              color: filter === key ? "#FFFFFF" : "#A1A1A5",
              border: filter === key ? "none" : "1px solid #202022",
            }}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)} ({counts[key]})
          </button>
        ))}
      </div>

      {/* DATE FILTER BAR */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setDateFilter(new Date())}
            className="px-3 py-2 rounded text-sm"
            style={{ background: "#202022", color: "#A1A1A5" }}
          >
            Today
          </button>

          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() + 1);
              setDateFilter(d);
            }}
            className="px-3 py-2 rounded text-sm"
            style={{ background: "#202022", color: "#A1A1A5" }}
          >
            Tomorrow
          </button>

          <button
            onClick={() => setDateFilter(null)}
            className="px-3 py-2 rounded text-sm"
            style={{ background: "#202022", color: "#A1A1A5" }}
          >
            Reset
          </button>
        </div>

        {dateFilter && (
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{ backgroundColor: "#1B1B1D", border: "1px solid #202022" }}
          >
            <p className="text-sm" style={{ color: "#A1A1A5" }}>
              Showing tasks for:
              <strong className="ml-1" style={{ color: "white" }}>
                {(
                  typeof dateFilter === "string"
                    ? new Date(dateFilter + "T12:00:00")
                    : dateFilter
                ).toDateString()}
              </strong>
            </p>

            <button
              onClick={() => setDateFilter(null)}
              className="text-xs px-2 py-1 rounded"
              style={{ background: "#EF4444", color: "white" }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* TASK GRID */}
      {loading ? (
        <p className="text-gray-400">Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet. Add one!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredTasks.map((task) => (
            <TodoCard
              key={task._id}
              task={task}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingTask && (
        <EditTodoModal
          task={editingTask}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={() => {
            fetchTasks();
            setIsEditModalOpen(false);
          }}
        />
      )}

      {/* Calendar-triggered ADD modal */}
      {openAddTodoModal && (
        <div className="z-40 fixed inset-0">
          <AddTodoForm
            prefilledDate={selectedDate}
            onClose={() => setOpenAddTodoModal(false)}
            onTaskAdded={() => {
              fetchTasks();
              setOpenAddTodoModal(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
