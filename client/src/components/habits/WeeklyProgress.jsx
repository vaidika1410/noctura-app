import React from "react";

export default function WeeklyProgress({ completedDates }) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  
  const weekDates = [...Array(7)].map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  
  const completed = weekDates.filter(d => completedDates?.includes(d)).length;
  const percent = Math.round((completed / 7) * 100);

  return (
    <div className="mt-2">
      <div className="text-xs text-gray-400 mb-1">
        Weekly progress: {completed}/7 days ({percent}%)
      </div>

      <div className="w-full h-2 rounded-full bg-[#2A2A2C] overflow-hidden">
        <div
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, #4CAF50, #2ECC71)",
            transition: "width 0.3s ease"
          }}
          className="h-full rounded-full"
        ></div>
      </div>
    </div>
  );
}
