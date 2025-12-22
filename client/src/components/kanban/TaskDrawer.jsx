import React, { useState } from "react";
import { createPortal } from "react-dom";
import axios from "../../api/axiosInstance";
import CommentItem from "./CommentItem";

export default function TaskDrawer({
    task,
    onClose,
    onCommentsUpdate,
}) {
    if (!task) return null;

    // Normalize comments safely
    const comments = Array.isArray(task.comments) ? task.comments : [];

    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(false);

    // Add comment handler
    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        setLoading(true);
        try {
            const res = await axios.post(
                `/api/kanban/tasks/${task._id}/comments`,
                { text: commentText.trim() }
            );

            // Update parent state safely
            if (typeof onCommentsUpdate === "function") {
                onCommentsUpdate(task._id, res.data.data);
            }

            setCommentText("");
        } catch (err) {
            console.error("Add comment failed:", err);
            alert("Failed to add comment");
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex">
            {/* Overlay */}
            <div
                className="flex-1 bg-black/60"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className="w-full max-w-md h-full bg-[#151517] border-l border-white/10 p-5 overflow-y-auto"
                onPointerDown={(e) => e.stopPropagation()} // ✅ prevent DnD bleed
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white mb-4"
                >
                    ✕
                </button>

                {/* Title */}
                <h2 className="text-xl font-semibold text-white mb-2">
                    {task.title}
                </h2>

                {/* Description */}
                {task.description && (
                    <p className="text-gray-400 mb-4">
                        {task.description}
                    </p>
                )}

                {/* Add Comment */}
                <div className="mb-5">
                    <textarea
                        className="w-full rounded-lg p-2 text-sm text-white"
                        style={{
                            backgroundColor: "#151517",
                            border: "1px solid #262626",
                        }}
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={2}
                        disabled={loading}
                    />

                    <div className="flex justify-end mt-2">
                        <button
                            onClick={handleAddComment}
                            disabled={!commentText.trim() || loading}
                            className={`px-3 py-1.5 rounded-md text-sm transition
                ${commentText.trim()
                                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            Add Comment
                        </button>
                    </div>
                </div>

                {/* Comments */}
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">
                        Comments ({comments.length})
                    </h3>

                    {comments.length === 0 ? (
                        <div className="text-gray-500 text-sm italic">
                            No comments yet
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {comments.map((c) => (
                                <CommentItem
                                    key={c._id}
                                    taskId={task._id}
                                    comment={c}
                                    onCommentsUpdate={onCommentsUpdate}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>,
        document.body
    );
}
