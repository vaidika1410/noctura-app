import React, { useMemo } from "react";

export default function ProductivityScore({ habits = [] }) {
  const stats = useMemo(() => {
    let totalCompletions = 0;
    let maxPossible = 0;
    const now = new Date();
    now.setHours(0,0,0,0);

    const last30Start = new Date(now);
    last30Start.setDate(now.getDate() - 29);

    let activeDaysSet = new Set();

    habits.forEach(habit => {
      const dates = habit.completedDates || [];

      dates.forEach(d => {
        const date = new Date(d);
        const iso = date.toISOString().split("T")[0];

        totalCompletions++;

        if (date >= last30Start && date <= now) {
          activeDaysSet.add(iso);
        }
      });

    
      maxPossible += 30;
    });

    const activeDays = activeDaysSet.size;
    const consistency = Math.round((activeDays / 30) * 100);
    const completionRate = maxPossible ? Math.round((totalCompletions / maxPossible) * 100) : 0;
    const productivityScore = Math.round(
      (consistency * 0.6) + (completionRate * 0.4)
    );

    let activityLabel = "Low";
    if (productivityScore >= 75) activityLabel = "High";
    else if (productivityScore >= 40) activityLabel = "Medium";

    return {
      productivityScore,
      completionRate,
      consistency,
      activeDays,
      totalCompletions,
      activityLabel
    };
  }, [habits]);

  return (
    <div className="glass rounded-2xl p-6 w-full h-full">
      <h2 className="text-xl font-semibold mb-4">Productivity Score</h2>

      <div className="flex flex-col gap-4">
        {/* Score number */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-indigo-300">
              {stats.productivityScore}
            </div>
            <div className="text-sm text-gray-400">Overall Score</div>
          </div>

          {/* Activity bubble */}
          <div
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              background:
                stats.activityLabel === "High"
                  ? "rgba(34,197,94,0.2)"
                  : stats.activityLabel === "Medium"
                    ? "rgba(234,179,8,0.2)"
                    : "rgba(239,68,68,0.2)",
              color:
                stats.activityLabel === "High"
                  ? "#4ADE80"
                  : stats.activityLabel === "Medium"
                    ? "#FACC15"
                    : "#F87171"
            }}
          >
            {stats.activityLabel} Activity
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div className="glass p-3 rounded-lg">
            <div className="text-gray-400 text-xs">Consistency (30d)</div>
            <div className="text-lg font-semibold">{stats.consistency}%</div>
          </div>

          <div className="glass p-3 rounded-lg">
            <div className="text-gray-400 text-xs">Completion Rate</div>
            <div className="text-lg font-semibold">{stats.completionRate}%</div>
          </div>

          <div className="glass p-3 rounded-lg">
            <div className="text-gray-400 text-xs">Active Days (30d)</div>
            <div className="text-lg font-semibold">{stats.activeDays}</div>
          </div>

          <div className="glass p-3 rounded-lg">
            <div className="text-gray-400 text-xs">Total Completions</div>
            <div className="text-lg font-semibold">{stats.totalCompletions}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
