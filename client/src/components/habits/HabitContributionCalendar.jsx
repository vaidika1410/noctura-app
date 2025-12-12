import React, { useMemo } from "react";

export default function HabitContributionCalendar({ habits }) {
  const completed = useMemo(() => {
    const set = new Set();
    habits.forEach(h => {
      (h.completedDates || []).forEach(d => set.add(d));
    });
    return set;
  }, [habits]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [...Array(60)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (59 - i));
    return d.toISOString().split("T")[0];
  });

  function color(dateStr) {
    if (completed.has(dateStr)) {
      return "#2ECC71";
    }
    return "#1F1F21"; 
  }

  return (
    <div className="mt-10">
      <div className="text-xl font-semibold text-white">Contribution Activity</div>
      <p className="text-gray-400 text-sm mb-4">
        Your habit consistency over the last 60 days
      </p>

      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: "repeat(10, 12px)",
        }}
      >
        {days.map((d, i) => (
          <div
            key={i}
            title={d}
            style={{
              width: 12,
              height: 12,
              background: color(d),
              borderRadius: 3,
              transition: "background 0.3s ease",
              filter: completed.has(d) ? "drop-shadow(0 0 4px #2ecc7133)" : "none",
            }}
          />
        ))}
      </div>

      <div className="text-xs text-gray-500 mt-3">
        Green squares represent days where at least one habit was completed.
      </div>
    </div>
  );
}
