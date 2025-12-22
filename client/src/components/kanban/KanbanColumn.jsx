
import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";

export default function KanbanColumn({ title, tasks = [], onDropCard, onAddTask, onEdit, onCommentsUpdate }) {
  const id = `col-${title}`;
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-1 w-full md:w-auto min-w-[260px]">
      <div
        ref={setNodeRef}
        className={`rounded-xl p-4 flex flex-col h-auto transition-all duration-150 ${isOver ? "kanban-drop-over" : ""}`}
        style={{
          background: "#1A1A1C",
          border: "1px solid #262628",
          minHeight: "60vh",
        }}
        data-column-id={title}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-200">{title}</h2>
          <span className="text-xs text-gray-500">{tasks.length}</span>
        </div>

        

        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {tasks.length === 0 ? (
              <p className="text-gray-600 text-sm">No tasks yet</p>
            ) : (
              tasks.map((task) => (
                <KanbanCard key={task._id} task={task} onEdit={onEdit} onCommentsUpdate={onCommentsUpdate} />
              ))


            )}
          </div>
        </SortableContext>
      </div>

      <style>{`
        .kanban-drop-over {
          box-shadow: 0 8px 30px rgba(99,102,241,0.06);
          border-color: rgba(99,102,241,0.45) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
