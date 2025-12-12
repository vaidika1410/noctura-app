import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import HabitCard from './HabitCard';
import AddHabitModal from './AddHabitModal';
import { useNavigate } from "react-router-dom";

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


const HabitTracker = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editHabit, setEditHabit] = useState(null);

  const token = localStorage.getItem('token');

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/habits', { headers: { Authorization: `Bearer ${token}` } });
      setHabits(
        (res.data.data || []).map(h => ({
          ...h,
          completedDates: h.completedDates?.map(d =>
            typeof d === "string" ? d : new Date(d).toISOString().split("T")[0]
          ) || []
        }))
      );


    } catch (err) {
      console.error('Error fetching habits:', err);
      setError('Failed to load habits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
    const now = new Date();
    const millisTillMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 5, 0) - now;

    const timeout = setTimeout(() => {
      fetchHabits();

      const interval = setInterval(fetchHabits, 24 * 60 * 60 * 1000);
    
      timeout.interval = interval;
    }, millisTillMidnight);

    return () => {
      clearTimeout(timeout);
      clearInterval(timeout.interval);
    };
  }, []);

  const handleToggleDay = async (habitId, dayStr) => {
    try {
      const habit = habits.find(h => h._id === habitId);
      const done = habit.completedDates?.includes(dayStr);

      setHabits(prev =>
        prev.map(h => {
          if (h._id !== habitId) return h;
          let updatedDates;
          if (done) {
      
            updatedDates = h.completedDates.filter(d => d !== dayStr);
          } else {
    
            updatedDates = [...(h.completedDates || []), dayStr];
          }
          return { ...h, completedDates: updatedDates };
        })
      );

      const url = done
        ? `/habits/${habitId}/uncomplete?date=${dayStr}`
        : `/habits/${habitId}/complete?date=${dayStr}`;


      await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error("Error toggling day:", err);
    }
  };



  const handleDelete = async (habit) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await axios.delete(`/habits/${habit._id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchHabits();
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  const handleEdit = (habit) => {
    setEditHabit(habit);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 min-h-screen"
      style={{ background: "#151517", color: "#E5E7EB" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold tracking-wide"
          style={{ color: "#F5F5F6" }}
        >
          Habit Tracker
        </h1>

        <div className='flex gap-2'>
          <button
            onClick={() => navigate("/habit-analytics")}
            className="px-4 py-2 rounded text-white font-medium transition-all cursor-pointer"
            style={{
              background: "",
              border: "1px solid #4A7BF7",
            }}
            onMouseEnter={e => e.target.style.background = "#4A7BF7"}
            onMouseLeave={e => e.target.style.background = ""}
          >
            Analytics
          </button>


          <button
            onClick={() => { setEditHabit(null); setIsModalOpen(true); }}
            className="px-4 py-2 rounded text-white font-medium transition-all cursor-pointer"
            style={{
              background: "#4A7BF7",
              border: "1px solid #3A6BE0"
            }}
            onMouseEnter={(e) => (e.target.style.background = "")}
            onMouseLeave={(e) => (e.target.style.background = "#4A7BF7")}
          >
            Add Habit
          </button>
        </div>

      </div>

      {/* Loading / empty states */}
      {loading && <p className="text-gray-400">Loading habits...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && habits.length === 0 && (
        <p className="text-gray-500">No habits yet. Start by adding one!</p>
      )}

      {/* Habit grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {habits.map(habit => (
          <HabitCard
            key={habit._id}
            habit={habit}
            onToggleDay={handleToggleDay}
            onEdit={handleEdit}
            onDelete={() => handleDelete(habit)}
          />
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AddHabitModal
          habit={editHabit}
          onClose={() => { setIsModalOpen(false); setEditHabit(null); }}
          onHabitAdded={fetchHabits}
        />
      )}
    </div>
  );

};

export default HabitTracker;
