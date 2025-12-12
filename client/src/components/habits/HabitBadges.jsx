
import React, { useMemo } from "react";

function toISODate(d) {
  const dt = typeof d === "string" ? new Date(d) : new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt.toISOString().split("T")[0];
}

function uniqueSortedDates(arr) {
  const s = new Set((arr || []).map(toISODate));
  return [...s].sort();
}

function calcCurrentStreak(set) {
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const iso = cursor.toISOString().split("T")[0];
    if (set.has(iso)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}

function calcLongestStreak(sorted) {
  if (!sorted.length) return 0;
  let longest = 1, current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diff = (cur - prev) / 86400000;
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export default function HabitBadges({ habits = [] }) {
  const stats = useMemo(() => {
    const perHabit = habits.map((h) => {
      const norm = uniqueSortedDates(h.completedDates || []);
      const set = new Set(norm);
      return {
        id: h._id,
        title: h.title || "Untitled",
        dates: norm,
        set,
        currentStreak: calcCurrentStreak(set),
        longestStreak: calcLongestStreak(norm),
      };
    });

    const last30 = new Set();
    const today = new Date(); today.setHours(0,0,0,0);
    const start30 = new Date(today); start30.setDate(today.getDate() - 29);

    perHabit.forEach(h => {
      h.dates.forEach(d => {
        const dd = new Date(d);
        if (dd >= start30 && dd <= today) last30.add(d);
      });
    });

    return {
      totalHabits: habits.length,
      totalCompletions: habits.reduce((sum,h) => sum + (h.completedDates?.length || 0), 0),
      activeDaysLast30: last30.size,
      consistencyPercent: Math.round((last30.size / 30) * 100),
      bestCurrent: Math.max(...perHabit.map(p => p.currentStreak), 0),
      bestLongest: Math.max(...perHabit.map(p => p.longestStreak), 0),
    };
  }, [habits]);

  const badges = [
    { key: "starter", title: "Getting Started", desc: "Created your first habit.", icon: "🌱", unlocked: stats.totalHabits > 0 },
    { key: "7day", title: "7-Day Streak", desc: "One-week consistent habit.", icon: "🔥", unlocked: stats.bestLongest >= 7 },
    { key: "14day", title: "14-Day Streak", desc: "Two-week streak achieved.", icon: "🔥🔥", unlocked: stats.bestLongest >= 14 },
    { key: "30comps", title: "30 Completions", desc: "30+ logged habit days.", icon: "🏆", unlocked: stats.totalCompletions >= 30 },
    { key: "consistent", title: "Consistent (70%)", desc: "70% activity over last 30 days.", icon: "📈", unlocked: stats.consistencyPercent >= 70 },
    { key: "collector", title: "Collector", desc: "5+ habits added.", icon: "🧰", unlocked: stats.totalHabits >= 5 },
    { key: "legend", title: "Legend", desc: "90-day long streak.", icon: "🏅", unlocked: stats.bestLongest >= 90 },
  ];

  return (
    <div style={{ width: "100%" }}>
      <style>{`
        /* responsive auto-fit grid with sane min card width */
        .badge-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          align-items: stretch;
          grid-auto-rows: minmax(90px, auto);
        }

        /* each card is a row-flex so icon + text align consistently */
        .badge-card {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 14px;
          border-radius: 12px;
          min-height: 88px;
          max-height: 160px;
          box-sizing: border-box;
          transition: transform .16s ease, box-shadow .16s ease;
        }
        .badge-card:hover { transform: translateY(-4px); }

        .badge-icon-box {
          min-width: 52px;
          min-height: 52px;
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .badge-text {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0; /* allow text truncation ellipsis if needed */
        }

        .badge-title-row {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:8px;
        }

        .badge-title {
          font-weight:600;
          font-size: 0.95rem;
          color: #fff;
        }

        .badge-sub {
          font-size: 0.85rem;
          color: #9CA3AF;
        }

        /* ensure small summary row below the grid lays out nicely */
        .badge-summary {
          margin-top: 12px;
          display:flex;
          flex-wrap:wrap;
          gap:12px;
          align-items:center;
          color:#9CA3AF;
          font-size: 0.95rem;
        }
      `}</style>

      <div className="badge-grid" role="list">
        {badges.map((b) => {
          const unlocked = Boolean(b.unlocked);
          return (
            <div
              role="listitem"
              key={b.key}
              className="badge-card glass"
              title={b.desc}
              style={{
                background: unlocked ? "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.22))" : "rgba(20,20,20,0.45)",
                border: unlocked ? "1px solid rgba(120, 80, 255, 0.16)" : "1px solid rgba(255,255,255,0.03)",
                boxShadow: unlocked ? "0 10px 30px rgba(111,91,247,0.06)" : "none",
                opacity: unlocked ? 1 : 0.6,
              }}
            >
              <div
                className="badge-icon-box"
                style={{
                  background: unlocked ? "linear-gradient(135deg,#6f5df7,#4b8bff)" : "rgba(255,255,255,0.03)",
                  color: unlocked ? "#fff" : "#cfcfcf",
                }}
                aria-hidden
              >
                <span>{b.icon}</span>
              </div>

              <div className="badge-text">
                <div className="badge-title-row">
                  <div className="badge-title">{b.title}</div>
                  <div style={{ fontSize: 12, color: unlocked ? "#A8FFD8" : "#9ea0a6" }}>
                    {unlocked ? "Unlocked" : "Locked"}
                  </div>
                </div>
                <div className="badge-sub">{b.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="badge-summary" aria-hidden>
        <div>Habits: <strong style={{color:"#fff"}}>{stats.totalHabits}</strong></div>
        <div>Total completions: <strong style={{color:"#fff"}}>{stats.totalCompletions}</strong></div>
        <div>Active days (30d): <strong style={{color:"#fff"}}>{stats.activeDaysLast30}</strong></div>
        <div>Best streak: <strong style={{color:"#fff"}}>{stats.bestLongest}d</strong></div>
      </div>
    </div>
  );
}
