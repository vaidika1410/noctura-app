import React, { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";

export default function AddReminderModal({ prefilledDate, onClose }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (prefilledDate) {
      setDate(prefilledDate.toISOString().split("T")[0]);
    }
  }, [prefilledDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/reminders", { date, time, note });
    onClose();
  };

  return (
    <div className="modal-bg">
      <form onSubmit={handleSubmit} className="modal">
        <h2>Add Reminder</h2>

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reminder details..." />

        <button type="submit">Add Reminder</button>
      </form>
    </div>
  );
}
