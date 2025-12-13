
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const AddHabitModal = ({ habit, onClose, onHabitAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [isShutdown, setIsShutdown] = useState(false); 
  const token = localStorage.getItem('token');

  const isEditMode = Boolean(habit);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setSheetUrl(habit.sheetUrl || '');
      setIsShutdown(!!habit.isShutdown); 
    } else {
      setTitle('');
      setDescription('');
      setSheetUrl('');
      setIsShutdown(false);
    }
  }, [habit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Title is required');

    try {
      const body = { title, description, sheetUrl, isShutdown };

      if (isEditMode) {
        await axios.put(`/api/habits/${habit._id}`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          '/api/habits',
          { ...body, frequency: 'weekly' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      onHabitAdded?.();
      onClose();

    } catch (err) {
      console.error('Error saving habit:', err.response?.data || err);
      alert('Failed to save habit.');
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md p-6 rounded-2xl"
        style={{
          background: "#1B1B1D",
          border: "1px solid #2A2A2C",
          boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
        }}
      >
        <h2 className="text-xl font-semibold mb-4 text-white tracking-wide">
          {isEditMode ? "Edit Habit" : "Add Habit"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Title */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 rounded-lg text-white focus:outline-none"
            style={{
              background: "#202022",
              border: "1px solid #2C2C2E",
            }}
          />

          {/* Description */}
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-3 rounded-lg text-white focus:outline-none h-24"
            style={{
              background: "#202022",
              border: "1px solid #2C2C2E",
            }}
          />

          {/* Sheet URL */}
          <input
            type="text"
            placeholder="Google Sheet / Excel URL (optional)"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            className="p-3 rounded-lg text-white focus:outline-none"
            style={{
              background: "#202022",
              border: "1px solid #2C2C2E",
            }}
          />

          {/* Shutdown Toggle */}
          <label
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
            style={{ background: "#202022", border: "1px solid #2C2C2E" }}
          >
            <input
              type="checkbox"
              checked={isShutdown}
              onChange={(e) => setIsShutdown(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-300 text-sm">
              Add to <strong>Shutdown Routine</strong>
            </span>
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: "#2A2A2C",
                color: "#C7C7C9",
                border: "1px solid #3A3A3C",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: isEditMode ? "#F4D06F" : "#7AB8F5",
                color: "#111",
                border: isEditMode
                  ? "1px solid #E3C45C"
                  : "1px solid #6BA8E0",
              }}
            >
              {isEditMode ? "Update" : "Add"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
