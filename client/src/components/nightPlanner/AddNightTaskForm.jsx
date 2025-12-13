import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const AddNightTaskForm = ({ onTaskAdded, editTask, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '');
      setDescription(editTask.description || '');
      setTime(editTask.time || '');
    } else {
      setTitle('');
      setDescription('');
      setTime('');
    }
  }, [editTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !time) return;

    try {
      setBusy(true);
      const token = localStorage.getItem('token');

      if (editTask) {
        await axios.put(
          `/api/night-tasks/${editTask._id}`,
          { title, description, time },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          '/api/night-tasks',
          { title, description, time },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setTitle('');
      setDescription('');
      setTime('');
      onTaskAdded();
      if (onCancelEdit) onCancelEdit();

    } catch (err) {
      console.error('Add/Edit night task error:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-xl shadow-xl space-y-4"
      style={{
        background: "#1B1B1D",
        border: "1px solid #2A2A2C",
        boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
      }}
    >
      <h2 className="font-semibold text-lg text-gray-200">
        {editTask ? 'Edit Night Task' : 'Add Night Task'}
      </h2>

      {/* Title */}
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 rounded-lg text-gray-200 focus:outline-none focus:ring-2 transition"
        style={{
          background: "#202022",
          border: "1px solid #3A3A3C",     
          boxShadow: "0 0 0 3px transparent",
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = "0 0 0 3px rgba(74,123,247,0.25)";
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = "0 0 0 transparent";
        }}
        required
      />

      {/* Time */}

      {/* Time Input */}
      <div className="relative w-full">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="
      w-full 
      p-3 
      rounded-lg 
      text-gray-200 
      focus:outline-none 
      focus:ring-2 
      transition
      pl-10         /* space for the icon */
      md:pl-3       /* desktop uses native icon, no extra padding */
      text-base
    "
          style={{
            background: "#202022",
            border: "1px solid #3A3A3C",
            
            WebkitAppearance: "none",
          }}
          required
        />

        {/* icon */}
        <span
          className="
      absolute 
      left-3 
      top-1/2 
      -translate-y-1/2 
      text-gray-500 
      pointer-events-none
      text-lg
      md:hidden     /* Hide icon on desktop because browser already shows one */
    "
        >
          ⏱️
        </span>
      </div>


      {/* Description */}
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full p-3 rounded-lg text-gray-200 focus:outline-none focus:ring-2 transition"
        style={{
          background: "#202022",
          border: "1px solid #3A3A3C",
          boxShadow: "0 0 0 3px transparent",
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = "0 0 0 3px rgba(74,123,247,0.25)";
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = "0 0 0 transparent";
        }}
      />

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="py-2 px-4 rounded-md font-medium text-white transition disabled:opacity-60"
          style={{
            background: "#4A7BF7",
            border: "1px solid #3A6BE0",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#3A6BE0")}
          onMouseLeave={(e) => (e.target.style.background = "#4A7BF7")}
        >
          {busy
            ? editTask ? 'Updating...' : 'Adding...'
            : editTask ? 'Update Task' : 'Add Task'}
        </button>

        {editTask && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="py-2 px-4 rounded-md font-medium text-gray-300 transition"
            style={{
              background: "#2A2A2C",
              border: "1px solid #3A3A3C",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#38383A")}
            onMouseLeave={(e) => (e.target.style.background = "#2A2A2C")}
          >
            Cancel
          </button>
        )}
      </div>
    </form>

  );
};

export default AddNightTaskForm;
