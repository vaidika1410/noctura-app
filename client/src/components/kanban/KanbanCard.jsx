import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";

import axios from "../../api/axiosInstance";



export default function KanbanCard({ task, onEdit, onDelete }) {
  const navigate = useNavigate();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,

    transition,
    zIndex: isDragging ? 40 : undefined,
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    try {
      await axios.delete(`/todo/${task._id}`);
      window.location.reload();
    } catch (err) {
      console.error("delete error", err);
      alert("Failed to delete task");
    }
  };

  /* Helper: Priority Bubble Color */
  function getPriorityBadge(task) {
    const p = String(task.priority || "").toLowerCase();

    if (p.includes("high")) {
      return { label: "High", color: "bg-red-500/20 text-red-400" };
    }
    if (p.includes("medium")) {
      return { label: "Medium", color: "bg-yellow-500/20 text-yellow-400" };
    }
    if (p.includes("low")) {
      return { label: "Low", color: "bg-green-500/20 text-green-400" };
    }

    return { label: "Default", color: "bg-gray-500/20 text-gray-400" };
  }


  const priority = getPriorityBadge(task);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative p-4 cursor-grab rounded-xl transition-all duration-200
        shadow-[0_6px_14px_rgba(0,0,0,0.45)]
        bg-gradient-to-br from-[#1C1D20] to-[#141416]
        border border-[#ffffff18]
        ${isDragging ? "opacity-90 scale-[1.02]" : "hover:shadow-[0_12px_22px_rgba(0,0,0,0.55)] hover:scale-[1.01]"}`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border-[1.5px] border-transparent bg-gradient-to-br from-[#2f2f33]/50 via-[#26272a]/50 to-[#1c1d20]/80 opacity-60 mix-blend-overlay" />

      {/* BADGES */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${priority.color}`}>
          {priority.label}
        </span>
        <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-blue-500/20 text-blue-400">
          Task
        </span>
      </div>

      {/* TITLE */}
      <div className="text-gray-100 font-semibold mb-1">
        {task.title}
      </div>

      {task.description && (
        <p className="text-gray-400 text-sm mb-3">{task.description}</p>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-between text-gray-500 text-xs mt-2 pb-1">
        <div className="flex items-center gap-4">
          <span className="opacity-80">💬 0</span>
          <span className="opacity-80">📎 0</span>
          {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
        </div>

        <div className="flex -space-x-2">
          <div className="w-5 h-5 rounded-full bg-gray-600 border border-[#1B1C1E]" />
          <div className="w-5 h-5 rounded-full bg-gray-700 border border-[#1B1C1E]" />
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 mt-4 pt-2 border-t border-gray-800">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(task);
          }}
          className="text-blue-400 hover:text-blue-300 text-xs"
        >
          Edit
        </button>

        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="text-red-500 hover:text-red-400 text-xs"
        >
          Delete
        </button>
      </div>

    </div>
  );
}
