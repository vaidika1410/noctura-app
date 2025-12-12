import React, { useMemo } from "react";

export default function MonthlyAnalyticsModal({ habits, onClose }) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();


  const monthDays = [...Array(daysInMonth)].map((_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), i + 1);
    return d.toISOString().split("T")[0];
  });


  const completedDates = useMemo(() => {
    const map = {};
    habits.forEach(h => {
      (h.completedDates || []).forEach(date => {
        if (monthDays.includes(date)) {
          map[date] = (map[date] || 0) + 1;
        }
      });
    });
    return map;
  }, [habits]);

  const totalCompletions = Object.values(completedDates).reduce((a, b) => a + b, 0);
  const avgWeekly = Math.round((totalCompletions / daysInMonth) * 7);

  const bestDay = Object.keys(completedDates).sort(
    (a, b) => completedDates[b] - completedDates[a]
  )[0];

  const mostConsistentHabit = habits.sort(
    (a, b) => b.completedDates.length - a.completedDates.length
  )[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* DARK OVERLAY */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className="relative glass-strong p-6 rounded-2xl shadow-xl w-full max-w-lg animate-fadeIn"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(14px)"
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-white text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-white mb-1">
          Monthly Analytics
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Your progress for {today.toLocaleString("default", { month: "long" })}
        </p>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Stat label="Total Completions" value={totalCompletions} />
          <Stat label="Average Weekly" value={avgWeekly} />
          <Stat
            label="Best Day"
            value={bestDay ? new Date(bestDay).toDateString().slice(0, 10) : "–"}
          />
          <Stat
            label="Most Consistent Habit"
            value={mostConsistentHabit ? mostConsistentHabit.title : "–"}
          />
        </div>

        {/* MONTH BAR CHART */}
        <div>
          <div className="text-sm text-gray-300 mb-2">Daily Activity</div>
          <div className="flex items-end gap-1 h-24">
            {monthDays.map((d, i) => {
              const height = (completedDates[d] || 0) * 8; 
              return (
                <div
                  key={i}
                  title={`${d} → ${completedDates[d] || 0} completions`}
                  style={{
                    width: "6px",
                    height: `${height}px`,
                    background: height > 0 ? "#4ADE80" : "#2A2A2C",
                    borderRadius: "3px",
                    transition: "height 0.3s ease"
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-4 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.07)"
      }}
    >
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="text-lg font-semibold text-white mt-1">{value}</div>
    </div>
  );
}
