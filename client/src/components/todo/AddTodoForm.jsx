
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

import { CalendarIcon } from "@heroicons/react/24/outline";


function createLocalMiddayISOStringFromYMD(ymd) {
  
  if (!ymd) return null;
  const [y, m, d] = ymd.split('-').map((v) => parseInt(v, 10));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d, 12, 0, 0);
  return dt.toISOString();
}

export default function AddTodoForm({ prefilledDate, onClose, onTaskAdded, inline }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const initialDate = prefilledDate
    ? (typeof prefilledDate === 'string'
      ? prefilledDate
      : (new Date(prefilledDate)).toISOString().split('T')[0])
    : '';

  const [dueDate, setDueDate] = useState(initialDate);
  const token = localStorage.getItem('token');

  const [priority, setPriority] = useState("medium");


  useEffect(() => {
    if (prefilledDate) {
      const v = typeof prefilledDate === 'string'
        ? prefilledDate
        : (new Date(prefilledDate)).toISOString().split('T')[0];
      setDueDate(v);
    }
  }, [prefilledDate]);

  const inputStyle = {
    backgroundColor: '#151517',
    border: '1px solid #202022',
    color: '#FFFFFF',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      description,
      status: "pending",
      priority, 
    };


    if (dueDate) {
      const iso = createLocalMiddayISOStringFromYMD(dueDate);
      if (iso) payload.dueDate = iso;
    } else {
      payload.dueDate = null;
    }

    try {
      await axios.post('/api/todo', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (typeof onTaskAdded === 'function') onTaskAdded();
      if (!inline && typeof onClose === 'function') onClose();

      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (err) {
      console.error('Add task error:', err);
      alert(err?.response?.data?.message || 'Failed to add task');
    }
  };


  return (
    <div
      className={
        inline
          ? 'w-full'
          : 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50'
      }
    >
      <div
        className={`rounded-xl p-5 shadow-xl ${inline ? 'w-full' : 'w-96'}`}
        style={{
          backgroundColor: '#1B1B1D',
          border: '1px solid #202022',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#FFFFFF' }}>
          {inline ? 'Add New Task' : 'Add Task'}
        </h2>

        <form className="space-y-2" onSubmit={handleSubmit}>
          <div className="w-full max-w-full overflow-hidden">
            <input
              className="w-full p-2.5 rounded-lg text-sm"
              style={inputStyle}
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              className="w-full p-2.5 rounded-lg text-sm mt-2"
              style={inputStyle}
              placeholder="Description (optional)"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="w-full mt-2">
              <label className="block text-gray-400 text-xs mb-1">
                Due Date
              </label>

              <div className="relative">
                <input
                  type="date"
                  className="w-full p-2.5 rounded-lg text-sm"
                  style={{
                    ...inputStyle,
                    colorScheme: "dark",
                  }}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />

                {/* Custom icon overlay */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  📅
                </span>
              </div>
            </div>

            <div className="w-full mt-2 relative">
              <label className="block text-gray-400 text-xs mb-1">
                Priority
              </label>

              <select
                className="w-full p-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                style={{
                  ...inputStyle,
                  paddingRight: "2.5rem",
                }}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>

              {/* Custom arrow */}
              <div
                className="pointer-events-none absolute right-3 mt-[-28px] text-gray-400"
                style={{ fontSize: "12px" }}
              >
                ▼
              </div>
            </div>



          </div>

          <div className="flex justify-end gap-2 mt-4">
            {!inline && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: '#202022',
                  color: '#A1A1A5',
                }}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm shadow-md"
              style={{
                backgroundColor: '#2563EB',
                color: 'white',
              }}
            >
              Add Task
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
