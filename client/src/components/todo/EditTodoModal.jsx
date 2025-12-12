import React, { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";

const EditTodoModal = ({ task, onClose, onUpdated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);

  const [priority, setPriority] = useState("medium");


  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "pending");
      setPriority(task.priority || "medium");
    }
  }, [task]);

  if (!task) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    try {
      setLoading(true);
      await axios.put(`/todo/${task._id}`, {
        title: title.trim(),
        description,
        status,
        priority,
      });

      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("Update task error:", err);
      alert(err.response?.data?.message || "Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-1200 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <div
        className="p-6 rounded-xl w-full max-w-md shadow-xl"
        style={{
          background: "linear-gradient(180deg, #1b1b1d 0%, #151517 100%)",
          border: "1px solid #202022",
          boxShadow: "0 8px 35px rgba(0,0,0,0.55)",
        }}
      >
        {/* HEADER */}
        <h2 className="text-xl font-semibold mb-4 text-white">
          Edit Task
        </h2>

        {/* FORM */}
        <form className="space-y-4" onSubmit={handleUpdate}>
          {/* TITLE INPUT */}
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg text-sm"
            style={{
              backgroundColor: "#151517",
              border: "1px solid #202022",
              color: "white",
            }}
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-lg text-sm"
            style={{
              backgroundColor: "#151517",
              border: "1px solid #202022",
              color: "white",
            }}
          />

          {/* STATUS SELECTOR */}
          {/* STATUS SELECTOR */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 rounded-lg text-sm appearance-none cursor-pointer transition"
              style={{
                backgroundColor: "#151517",
                border: "1px solid #202022",
                color: "white",
                paddingRight: "2.5rem",
              }}
            >
              <option value="pending" className="status-option pending-opt">
                ⏳ Pending
              </option>
              <option value="in-progress" className="status-option progress-opt">
                🔄 In Progress
              </option>
              <option value="completed" className="status-option completed-opt">
                ✔ Completed
              </option>
            </select>

            {/* Custom dropdown arrow */}
            <div
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
              style={{ fontSize: "14px" }}
            >
              ▼
            </div>
          </div>

          {/* PRIORITY SELECTOR */}
          <div className="relative">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-3 rounded-lg text-sm appearance-none cursor-pointer transition"
              style={{
                backgroundColor: "#151517",
                border: "1px solid #202022",
                color: "white",
                paddingRight: "2.5rem",
              }}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>

            <div
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
              style={{ fontSize: "14px" }}
            >
              ▼
            </div>


          </div>


          {/* BUTTONS */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm transition"
              style={{
                backgroundColor: "#202022",
                color: "#A1A1A5",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm transition shadow-md"
              style={{
                backgroundColor: "#2563EB",
                color: "white",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Updating..." : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTodoModal;
