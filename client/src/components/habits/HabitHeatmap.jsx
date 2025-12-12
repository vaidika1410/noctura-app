import React from "react";

export default function HabitHeatmap({ completedDates }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [...Array(28)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (27 - i));
    return d.toISOString().split("T")[0];
  });

  function color(dateStr) {
    if (!completedDates) return "#2A2A2C";
    return completedDates.includes(dateStr)
      ? "#2ECC71"
      : "#1F1F21";
  }

  return (
    <div className="mt-4">
      <div className="text-xs text-gray-400 mb-1">Last 4 weeks</div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div
            key={i}
            style={{
              width: "12px",
              height: "12px",
              background: color(d),
              borderRadius: "3px",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
