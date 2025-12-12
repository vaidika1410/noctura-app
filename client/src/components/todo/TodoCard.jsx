import React from "react";

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
  if (p.includes("urgent")) {
    return { label: "Urgent", color: "bg-red-700/30 text-red-300" };
  }

  return { label: "Default", color: "bg-gray-500/20 text-gray-400" };
}


const TodoCard = ({ task, onEdit, onStatusChange, onDelete }) => {
  return (
    <div
      className="
        p-5 rounded-xl shadow-lg border
        flex flex-col justify-between h-full
        transition-transform duration-200
        hover:scale-[1.02] hover:shadow-2xl
      "
      style={{
        backgroundColor: "#1A1A1C",      
        borderColor: "#2A2A2C",          
        boxShadow: "0 6px 18px rgba(0,0,0,0.55)",
      }}
    >
      {/* Top Section */}
      <div className="mb-4 space-y-2">
        {/* PRIORITY BADGE */}
        <span
          className={`inline-block px-2 py-1 text-xs rounded-md font-medium ${getPriorityBadge(task).color}`}
          style={{ border: "1px solid #2A2A2C" }}
        >
          {getPriorityBadge(task).label}
        </span>

        <h3 className="text-lg font-semibold" style={{ color: "#E5E5E7" }}>
          {task.title}
        </h3>

        {task.description && (
          <p className="text-sm leading-relaxed" style={{ color: "#A1A1A5" }}>
            {task.description}
          </p>
        )}

        <span
          className="inline-block px-2 py-1 text-xs rounded-md mt-2 select-none"
          style={{
            backgroundColor:
              task.status === "completed"
                ? "#133B2F"
                : task.status === "in-progress"
                  ? "#4C380A"
                  : "#1B1B1D",
            color:
              task.status === "completed"
                ? "#7ED8B5"
                : task.status === "in-progress"
                  ? "#E3B74F"
                  : "#C5C5C8",
            border: "1px solid #2A2A2C",
          }}
        >
          Status: {task.status}
        </span>
      </div>

      {/* Bottom Section */}
      <div className="flex justify-between items-end">
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-1 rounded text-sm font-medium text-white transition shadow-sm"
            style={{
              backgroundColor: "#4A6CF7",
              border: "1px solid #3E5CD1",
            }}
            onClick={() => onEdit(task)}
          >
            Edit
          </button>

          {task.status === "pending" && (
            <button
              className="px-3 py-1 rounded text-sm font-medium text-white transition shadow-sm"
              style={{
                backgroundColor: "#D9A537",
                border: "1px solid #B88929",
              }}
              onClick={() => onStatusChange(task._id, "in-progress")}
            >
              Start
            </button>
          )}

          {task.status === "in-progress" && (
            <button
              className="px-3 py-1 rounded text-sm font-medium text-white transition shadow-sm"
              style={{
                backgroundColor: "#2A8C4A",
                border: "1px solid #22703A",
              }}
              onClick={() => onStatusChange(task._id, "completed")}
            >
              Done
            </button>
          )}

          <button
            className="px-3 py-1 rounded text-sm font-medium text-white transition shadow-sm"
            style={{
              backgroundColor: "#C24343",
              border: "1px solid #9E3434",
            }}
            onClick={() => onDelete(task._id)}
          >
            Delete
          </button>
        </div>

        {task.dueDate && (
          <span
            className="inline-block text-xs px-3 py-2 rounded-lg shadow-sm whitespace-nowrap"
            style={{
              backgroundColor: "#1B1B1D",
              color: "#C5C5C8",
              border: "1px solid #2A2A2C",
            }}
          >
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default TodoCard;
