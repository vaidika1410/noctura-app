
import React, { useState, useEffect } from "react";
import "./CalendarWidget.css"; 

export default function MiniCalendar({
  value,
  onSelect,
  tileSize = 70,
  tasksByDate = {},
  compact = true,
}) {
  const [current, setCurrent] = useState(() => {

    const d = value ? new Date(value) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [days, setDays] = useState([]);

  useEffect(() => {
    const year = current.getFullYear();
    const month = current.getMonth();

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);


    const startOffset = (first.getDay() + 6) % 7;

    const arr = [];

    for (let i = 0; i < startOffset; i++) {
      const d = new Date(year, month, i - startOffset + 1);
      arr.push({ date: d, isOtherMonth: true });
    }


    for (let d = 1; d <= last.getDate(); d++) {
      arr.push({ date: new Date(year, month, d), isOtherMonth: false });
    }

    while (arr.length < 42) {
      const lastDate = arr[arr.length - 1].date;
      arr.push({ date: new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1), isOtherMonth: true });
    }

    setDays(arr);
  }, [current]);

  useEffect(() => {
    if (!value) return;
    const v = new Date(value);
    if (v.getMonth() !== current.getMonth() || v.getFullYear() !== current.getFullYear()) {
      setCurrent(new Date(v.getFullYear(), v.getMonth(), 1));
    }


  }, [value]);

  const fmtISO = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  const prevMonth = () => setCurrent((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const nextMonth = () => setCurrent((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  const goToday = () => {
    const t = new Date();
    setCurrent(new Date(t.getFullYear(), t.getMonth(), 1));
    if (typeof onSelect === "function") onSelect(t);
  };

  return (
  <div className="mini-cal-root" style={{ width: "100%" }}>
    
    {/* HEADER */}
    <div
      className="mc-header"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
        padding: "4px 2px",
      }}
    >
      <button className="mc-nav-btn" onClick={prevMonth} aria-label="Previous month">
        ‹
      </button>

      <div
        className="mc-month-label"
        style={{
          fontWeight: 700,
          fontSize: "1rem",
          color: "white",
          letterSpacing: "0.3px",
        }}
      >
        {current.toLocaleString(undefined, { month: "long", year: "numeric" })}
      </div>

      <button className="mc-nav-btn" onClick={nextMonth} aria-label="Next month">
        ›
      </button>

      <div style={{ flex: 1 }} />

      <button className="mc-today-btn" onClick={goToday}>
        Today
      </button>
    </div>

    {/* WEEKDAYS */}
    <div
      className="mc-weekdays"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7,1fr)",
        gap: 8,
        color: "#A1A1A5",
        fontSize: 12,
        marginBottom: 8,
        textAlign: "center",
      }}
    >
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
        <div key={w} className="mc-weekday" style={{ fontWeight: 500 }}>
          {w}
        </div>
      ))}
    </div>

    {/* DATE GRID */}
    <div
      className="mini-cal-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 10,
        alignItems: "start",
      }}
    >
      {days.map((cell, idx) => {
        const iso = fmtISO(cell.date);
        const tasks = tasksByDate[iso] || [];
        const isToday =
          new Date().toDateString() === cell.date.toDateString();
        const isSelected =
          value && new Date(value).toDateString() === cell.date.toDateString();

        return (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onSelect === "function")
                onSelect(new Date(cell.date));
            }}
            className={`mc-tile 
              ${cell.isOtherMonth ? "mc-other" : ""} 
              ${isToday ? "mc-today" : ""} 
              ${isSelected ? "mc-selected" : ""}
            `}
            style={{
              height: tileSize + 6,
              minHeight: tileSize + 6,
              padding: 8,
              borderRadius: 12,
              background: cell.isOtherMonth
                ? "#151517"
                : "#1B1B1D",
              border: isSelected
                ? "2px solid #2563EB"
                : "1px solid #202022",
              color: cell.isOtherMonth ? "#3A3A3D" : "#E5E5E5",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 13,
              fontWeight: isToday ? 600 : 500,
              transition: "0.15s ease",
              boxShadow: isToday
                ? "0 0 10px rgba(37,99,235,0.3)"
                : "0 0 0 transparent",
            }}
          >
            {/* DATE NUMBER */}
            <div
              style={{
                alignSelf: "flex-start",
                fontWeight: isToday ? 700 : 600,
                fontSize: 14,
              }}
            >
              {cell.date.getDate()}
            </div>

            {/* DOTS ROW */}
            <div
              style={{
                marginTop: 4,
                display: "flex",
                gap: 4,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tasks.length > 0 ? (
                compact ? (
                  <span
                    className="mc-dot dot-default"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 6,
                      background: "#9CA3AF",
                    }}
                  />
                ) : (
                  <>
                    {tasks.slice(0, 3).map((t, i) => (
                      <span
                        key={i}
                        className="mc-dot dot-default"
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 6,
                          background: "#9CA3AF",
                        }}
                      />
                    ))}
                    {tasks.length > 3 && (
                      <span style={{ fontSize: 11, color: "#A1A1A5" }}>
                        +{tasks.length - 3}
                      </span>
                    )}
                  </>
                )
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

}
