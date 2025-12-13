// src/components/habits/HabitAnalytics.jsx
import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

import WeeklyProgressRing from "./WeeklyProgressRing";
import MonthlyAnalyticsModal from "./MonthlyAnalyticsModal";
import HabitContributionCalendar from "./HabitContributionCalendar";
import HabitBadges from "./HabitBadges";
import ProductivityScore from "./ProductivityScore";

export default function HabitAnalytics() {
    const navigate = useNavigate();

    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMonthlyModal, setOpenMonthlyModal] = useState(false);

    const fetchHabits = async () => {
        try {
            const res = await axios.get("/api/habits");
            setHabits(res.data.data || []);
        } catch (err) {
            console.error("Analytics fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHabits();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <div className="min-h-screen w-full p-4 md:p-10 bg-[#0b0b0f] text-gray-100">

            <style>{`
        .glass {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(12px) saturate(140%);
        }
        .fade-up {
          animation: fadeUp 0.4s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            {/* ---------- HEADER ---------- */}
            <div className="flex items-center justify-between mb-10 fade-up">
                <div>
                    <h1 className="text-3xl font-bold  text-white bg-clip-text">
                        Habit Analytics
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">
                        Insights & trends to help you grow every week
                    </p>
                </div>

                <button
                    onClick={() => navigate("/dashboard?section=habits")}
                    className="px-4 py-2 rounded-lg glass border border-white/10 text-gray-300 hover:text-white transition"
                >
                    ← Back
                </button>
            </div>

            {loading ? (
                <p className="text-gray-400">Loading analytics...</p>
            ) : (
                <div className="space-y-10 fade-up">

                    
                    {/* DASHBOARD GRID FOR LARGE SCREENS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* ---------- Weekly Progress (large card) ---------- */}
                        <div className="glass rounded-2xl p-6 flex flex-col justify-start">
                            <h2 className="text-xl font-semibold mb-1">Weekly Progress Overview</h2>
                            <p className="text-sm text-gray-400 mb-15">
                                Combined progress based on all tracked habits
                            </p>
                            <WeeklyProgressRing habits={habits} />
                        </div>

                        {/* ---------- Achievements / Badges ---------- */}
                    
                        <div className="glass rounded-2xl p-6 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                                <h2 className="text-xl font-semibold">Achievements</h2>
                                <span className="text-xs text-indigo-300 sm:text-right">Auto-calculated 🔥</span>
                            </div>

                            <div className="w-full">
                                <style>{`/* center and limit overall width so cards don't stretch too wide */.achievements-inner {max-width: 1180px;margin: 0 auto;}
                                /* this wrapper ensures no accidental horizontal overflow */
                                .habit-badges-wrapper {
                                width: 100%;
                                overflow-x: hidden;
                                }
                                `}</style>

                                <div className="habit-badges-wrapper">
                                    <div className="achievements-inner">
                                        <HabitBadges habits={habits} />
                                    </div>
                                </div>
                            </div>
                        </div>




                    </div>

                    {/* ---------- Contribution Calendar ---------- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">

                        <div className="order-1 lg:order-2 h-max glass rounded-2xl p-6 fade-up">
                            <h2 className="text-xl font-semibold mb-2">Productivity Score</h2>
                            <p className="text-gray-400 text-sm mb-4">Your overall activity and consistency score</p>

                            <ProductivityScore habits={habits} />
                        </div>

                        <div className="order-2 lg:order-1 glass rounded-2xl p-6 fade-up">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Contribution Calendar</h2>

                                <button
                                    onClick={() => setOpenMonthlyModal(true)}
                                    className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 transition text-sm"
                                >
                                    Monthly Insights
                                </button>
                            </div>

                            <p className="text-gray-400 text-sm mt-1 mb-4">
                                Activity timeline based on your daily completions
                            </p>

                            <HabitContributionCalendar habits={habits} />
                        </div>

                    </div>

                </div>
            )}

            {/* ---------- Monthly Modal ---------- */}
            {openMonthlyModal && (
                <MonthlyAnalyticsModal
                    habits={habits}
                    onClose={() => setOpenMonthlyModal(false)}
                />
            )}
        </div>
    );
}
