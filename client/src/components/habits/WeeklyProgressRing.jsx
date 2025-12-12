import React, { useMemo } from "react";

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay(); 
  const diff = (day === 0 ? -6 : 1 - day);
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getThisWeekDates() {
  const monday = getMonday(new Date());
  return [...Array(7)].map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export default function WeeklyProgressRing({ habits }) {
  const weekDates = getThisWeekDates();


  const { doneCount, totalPossible, percent } = useMemo(() => {
    let done = 0;
    let total = habits.length * 7;

    habits.forEach(h => {
      weekDates.forEach(d => {
        if (h.completedDates?.includes(d)) done++;
      });
    });

    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { doneCount: done, totalPossible: total, percent: pct };
  }, [habits]);

  const size = 180;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl font-semibold text-white tracking-tight">
        Weekly Progress
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Completion across all habits this week
      </p>

      {/* Ring Container */}
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
        }}
      >
        <svg width={size} height={size}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2A2A2C"
            strokeWidth={stroke}
            fill="none"
          />

          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2ECC71"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s ease",
              filter: "drop-shadow(0 0 6px #2ecc7133)",
            }}
          />
        </svg>

        {/* Percentage Label */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <span className="text-4xl font-semibold">{percent}%</span>
          <span className="text-xs text-gray-400 tracking-wide mt-1">
            {doneCount} / {totalPossible}
          </span>
        </div>
      </div>
    </div>
  );
}
