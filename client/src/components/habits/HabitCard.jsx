import React from 'react';
import WeeklyProgress from './WeeklyProgress';
import HabitHeatmap from './HabitHeatmap';

const HabitCard = ({ habit, onEdit, onDelete, onToggleDay }) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


  // FIXED: timezone-safe Monday calculation

  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const today = new Date();
  const monday = getMonday(today);

  // STREAK CALCULATION
  function calculateStreak() {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;

    let streak = 0;
    let cursor = new Date(today);
    cursor.setHours(0, 0, 0, 0);

    while (true) {
      const dateStr = cursor.toISOString().split("T")[0];
      if (habit.completedDates.includes(dateStr)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    return streak;
  }

  const streak = calculateStreak();

  return (
    <div
      className="p-5 rounded-2xl shadow-md w-full max-w-sm flex flex-col gap-4"
      style={{
        background: "#1B1B1D",
        border: "1px solid #262628",
      }}
    >
      {/* Title */}
      <div>
        <h3 className="font-semibold text-lg text-white tracking-wide">
          {habit.title || "Untitled Habit"}
        </h3>
        {habit.description && (
          <p className="text-gray-400 mt-1 text-sm">{habit.description}</p>
        )}
        

        {/* Streak Counter */}
        <p className="text-xs mt-1" style={{ color: streak > 0 ? "#2ECC71" : "#B0B0B4" }}>
          🔥 {streak} day{streak !== 1 ? "s" : ""} streak
        </p>
      </div>

      {/* Weekday circles */}
      <div className="flex justify-between mt-2">
        {daysOfWeek.map((day, index) => {
          const dayDate = new Date(monday);
          dayDate.setDate(monday.getDate() + index);
          dayDate.setHours(0, 0, 0, 0);

          const dayStr = dayDate.toISOString().split("T")[0];
          const done = habit.completedDates?.includes(dayStr);

          return (
            <div
              key={day}
              onClick={() => onToggleDay(habit._id, dayStr)}
              className="w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all text-sm font-semibold"
              style={{
                background: done ? "#2ECC71" : "#2A2A2C",
                color: done ? "#0B0B0C" : "#B0B0B4",
                border: done ? "1px solid #29B567" : "1px solid #343436",
              }}
            >
              {done ? "✓" : day[0]}
            </div>
          );
        })}
      </div>

      {/* Weekly Progress Bar */}
      <WeeklyProgress completedDates={habit.completedDates} />

      {/* Heatmap */}
      <HabitHeatmap completedDates={habit.completedDates} />

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-3 relative">

        {habit.isShutdown && (
          <span
            className="text-[10px] px-2 py-1 rounded-md font-medium absolute bottom-0 left-0"
            style={{
              background: "rgba(74,123,247,0.18)",
              border: "1px solid rgba(74,123,247,0.35)",
              color: "#89A7FF",
            }}
          >
            Shutdown
          </span>
        )}

        {/* Edit */}
        <button
          onClick={() => onEdit(habit)}
          className="px-3 py-1 rounded-sm text-sm font-medium transition-all"
          style={{
            background: "#F4D06F",
            color: "#1A1A1A",
            border: "1px solid #E3C45C"
          }}
        >
          Edit
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(habit._id)}
          className="px-3 py-1 rounded-sm text-sm font-medium transition-all text-white"
          style={{
            background: "#E85D75",
            border: "1px solid #D44F65",
          }}
        >
          Delete
        </button>

        {/* Sheet */}
        {habit.sheetUrl && (
          <a
            href={habit.sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-sm text-sm font-medium transition-all"
            style={{
              background: "#7AB8F5",
              color: "#0F0F11",
              border: "1px solid #6BA8E0",
            }}
          >
            Sheet
          </a>
        )}
      </div>
    </div>
  );
};

export default HabitCard;
