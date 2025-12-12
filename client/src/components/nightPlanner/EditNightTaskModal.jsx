import React, { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";

export default function EditNightTaskModal({ task, onClose, onUpdated }) {
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");
    const [busy, setBusy] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setTime(task.time || "");
            setDescription(task.description || "");
        }
    }, [task]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!title || !time) return;

        try {
            setBusy(true);
            await axios.put(
                `/night-tasks/${task._id}`,
                { title, time, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onUpdated();
            onClose();
        } catch (err) {
            console.error("Error updating night task:", err);
            alert("Failed to update task.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className="w-full max-w-md rounded-2xl p-6 shadow-xl"
                style={{
                    background: "#1B1B1D",
                    border: "1px solid #2A2A2C",
                }}
            >
                <h2 className="text-xl font-semibold text-gray-100 mb-4">
                    Edit Night Task
                </h2>

                <form onSubmit={handleUpdate} className="space-y-4">

                    <input
                        type="text"
                        className="w-full p-3 rounded-xl bg-[#151517] border border-gray-700 text-gray-200
                       focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full p-3 rounded-xl text-gray-200 bg-[#1B1B1D] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4A6CF7] appearance-none"
                        required
                    />


                    <textarea
                        className="w-full p-3 rounded-xl bg-[#151517] border border-gray-700 text-gray-200
                       focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Description (optional)"
                        value={description}
                        rows={3}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={busy}
                            className="px-4 py-2 rounded-md font-medium text-white bg-[#4A6CF7] hover:bg-[#3D5CE0] transition-all disabled:opacity-60"
                        >
                            {busy ? "Updating..." : "Update Task"}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
}
