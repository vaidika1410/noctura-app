import React from "react";

export default function NightTaskCard({ task, onEdit, onDelete }) {
  return (
    <div
      className="
        relative p-4 rounded-xl cursor-pointer 
        transition-all duration-300 
        hover:scale-[1.02] 
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.55)]
        bg-gradient-to-br from-[#1c1c1e] to-[#141416]
        border border-[#ffffff23]
        group
      "
    >
      {/* Gradient overlay */}
      <div
        className="
          absolute inset-0 rounded-xl pointer-events-none 
          bg-linear-to-br from-[#939395c8] via-[#898a8d80] to-[#4d4e52]
          opacity-60 mix-blend-overlay
        "
      />

      {/* TIME */}
      <div className="text-xs text-gray-400 bg-[#32353dd1] py-1 w-max px-2 rounded mb-1 flex items-center gap-1">
        <span className="text-indigo-400">⏱</span>
        {task.time?.slice(0,5) || "--:--"}
      </div>

      {/* TITLE */}
      <div className="text-gray-100 font-semibold text-lg mb-1">
        {task.title}
      </div>

      {/* DESCRIPTION */}
      {task.description && (
        <p className="text-gray-400 text-sm leading-relaxed">
          {task.description}
        </p>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-2 mt-6 border-t pt-4 border-[#ffffff13]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(task);
          }}
          className="text-white p-1 px-4 rounded-sm bg-[#4f75d7] text-sm"
        >
          Edit
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(task._id);
          }}
          className="bg-[#c85555] text-sm text-white p-1 px-4 rounded-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
