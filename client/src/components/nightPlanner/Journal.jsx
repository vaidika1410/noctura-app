
import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Journal() {
    const navigate = useNavigate();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedNote, setSelectedNote] = useState(null); 

    const [text, setText] = useState("");
    const [saving, setSaving] = useState(false);
    const textareaRef = useRef(null);

    const today = new Date().toISOString().split("T")[0];

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/night-entry/journal-history", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotes(res.data.data || []);
        } catch (err) {
            console.error("Failed to load journal:", err);
            setNotes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    };

    useEffect(() => {
        autoResize();
    }, [text]);


    const handleSave = async () => {
        if (!text.trim()) return alert("Write something first!");

        setSaving(true);
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                "/api/night-entry",
                { date: today, freeformJournal: text },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setText("");
            setSelectedNote(null);
            fetchNotes();
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save journal entry.");
        } finally {
            setSaving(false);
        }
    };

    const deleteNote = async (id) => {
        if (!window.confirm("Delete this journal entry?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/night-entry/journal/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (selectedNote?.noteId === id) {
                setSelectedNote(null);
            }

            fetchNotes();
        } catch (err) {
            alert("Failed to delete note");
        }
    };

    const openPreview = (note) => {
        setSelectedNote(note);
        setText(""); 
    };

    return (
        <div
            className="min-h-screen w-full"
            style={{ background: "#151517", color: "#E5E7EB", padding: "2rem" }}
        >
            {/* Header */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
                <h1 className="text-3xl font-semibold">Journal</h1>

                <button
                    onClick={() => navigate("/dashboard?section=nightPlanner")}
                    className="px-2 py-2 text-sm rounded border border-white/10 hover:bg-white/5"
                >
                    Back to Night Planner
                </button>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* DESKTOP NOTEBOOK LAYOUT */}
                <div
                    className="hidden md:flex justify-center gap-6 p-8 rounded-xl shadow-lg"
                    style={{
                        background: "#1B1B1D",
                        border: "2px solid #2A2A2C",
                        position: "relative",
                    }}
                >
                    {/* LEFT PAGE — HISTORY LIST */}
                    <div
                        className="left-page flex-1 p-6 rounded-xl overflow-y-scroll"
                        style={{
                            background: "#18181A",
                            borderRight: "3px dashed #2E2E30",
                            maxHeight: "70vh",
                        }}
                    >
                        <h2 className="text-xl font-semibold mb-4">Entries</h2>

                        {loading ? (
                            <p className="text-gray-400">Loading...</p>
                        ) : notes.length === 0 ? (
                            <p className="text-gray-500">No journal entries yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {notes.map((n) => (
                                    <div
                                        key={n.noteId}
                                        className="p-4 rounded-lg cursor-pointer hover:bg-[#202022]"
                                        style={{ background: "#151517", border: "1px solid #2A2A2C" }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs text-gray-400">
                                                    {n.entryDate} • {new Date(n.createdAt).toLocaleString()}
                                                </div>

                                                {/* PREVIEW TEXT — line clamp */}
                                                <div className="mt-1 text-sm line-clamp-3 text-gray-300">
                                                    {n.text.replace(/<[^>]+>/g, "").slice(0, 200)}
                                                    {n.text.length > 200 ? "..." : ""}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openPreview(n);
                                                    }}
                                                    className="text-xs px-2 py-1 rounded bg-[#6A94FD] text-white"
                                                >
                                                    Preview
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNote(n.noteId);
                                                    }}
                                                    className="text-xs px-2 py-1 rounded bg-[#E85D75] text-white"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SPIRAL / BINDING */}
                    <div
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: 0,
                            transform: "translateX(-50%)",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-around",
                        }}
                    >
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    background: "#101011",
                                    border: "2px solid #2A2A2C",
                                }}
                            />
                        ))}
                    </div>

                    {/* RIGHT PAGE — DOT GRID + PREVIEW */}
                    <div
                        className="flex-1 p-6 rounded-xl relative"
                        style={{ background: "#0b0c0d", minHeight: "70vh" }}
                    >
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedNote ? "Preview" : "Journal • Write"}
                        </h2>

                        {!selectedNote ? (
                            <>
                                {/* Editor */}
                                <textarea
                                    ref={textareaRef}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Write your journal entry..."
                                    className="w-full p-4 text-sm text-gray-100 caret-white resize-none rounded-lg outline-none"
                                    style={{
                                        backgroundColor: "#0b0c0d",
                                        backgroundImage:
                                            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 1px)",
                                        backgroundSize: "18px 18px",
                                        lineHeight: "1.7",
                                        minHeight: "350px",
                                        border: "1px solid #1e1e1f",
                                    }}
                                />

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="mt-4 px-5 py-2 rounded-md text-sm font-semibold absolute bottom-6 left-6"
                                    style={{ background: "#4A6CF7", color: "white" }}
                                >
                                    {saving ? "Saving..." : "Save Entry"}
                                </button>
                            </>
                        ) : (
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                {/* IMAGE SUPPORT */}
                                {String(selectedNote.text).includes("<img") ? (
                                    <div dangerouslySetInnerHTML={{ __html: selectedNote.text }} />
                                ) : (
                                    selectedNote.text
                                )}

                                <button
                                    className="mt-4 px-4 py-2 rounded bg-[#4A6CF7] absolute bottom-6 left-6"
                                    onClick={() => setSelectedNote(null)}
                                >
                                    Close Preview
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ----------------------- MOBILE VERSION ----------------------- */}
                <div className="md:hidden space-y-4 mt-4">
                    <h2 className="text-xl font-semibold">Entries</h2>

                    {/* Editor */}
                    <div
                        className="p-4 rounded-lg relative"
                        style={{
                            background: "#0b0c0d",
                            border: "1px solid #2A2A2C",
                            minHeight: "300px",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* DOT GRID BACKGROUND LAYER */}
                        <div
                            className="absolute inset-0 rounded-lg pointer-events-none"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 1px)",
                                backgroundSize: "16px 16px",
                                opacity: 0.25,
                            }}
                        />

                        {/* TEXTAREA */}
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            ref={textareaRef}
                            placeholder="Write your journal entry..."
                            className="w-full p-3 text-sm text-gray-100 caret-white resize-none rounded-lg outline-none relative"
                            style={{
                                background: "transparent",                
                                lineHeight: "1.6",
                                minHeight: "200px",
                                paddingBottom: "4rem",       
                                flexGrow: 1,
                            }}
                        />

                        {/* SAVE BUTTON */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full mt-3 px-4 py-2 rounded-md text-sm font-semibold relative z-10"
                            style={{
                                background: "#4A6CF7",
                                color: "white",
                                marginTop: "auto", 
                            }}
                        >
                            {saving ? "Saving..." : "Save Entry"}
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-gray-400">Loading...</p>
                    ) : notes.length === 0 ? (
                        <p className="text-gray-500">No journal entries yet.</p>
                    ) : (
                        notes.map((n) => (
                            <div
                                key={n.noteId}
                                className="p-4 rounded-lg"
                                style={{ background: "#1B1B1D", border: "1px solid #2A2A2C" }}
                            >
                                <div className="text-xs text-gray-400 mb-2">
                                    {n.entryDate} • {new Date(n.createdAt).toLocaleString()}
                                </div>

                                <div className="text-sm mb-3 line-clamp-4">
                                    {n.text.replace(/<[^>]+>/g, "").slice(0, 300)}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedNote(n)}
                                        className="px-3 py-1 rounded bg-[#6A94FD] text-white text-xs"
                                    >
                                        Preview
                                    </button>
                                    <button
                                        onClick={() => deleteNote(n.noteId)}
                                        className="px-3 py-1 rounded bg-[#E85D75] text-white text-xs"
                                    >
                                        Delete
                                    </button>
                                </div>

                                {/* Mobile preview modal */}
                                {selectedNote?.noteId === n.noteId && (
                                    <div className="mt-3 p-3 rounded bg-[#0b0c0d] border border-[#222]">
                                        <div className="text-xs mb-2 text-gray-400">Preview</div>

                                        {String(n.text).includes("<img") ? (
                                            <div dangerouslySetInnerHTML={{ __html: n.text }} />
                                        ) : (
                                            <p className="text-sm whitespace-pre-wrap">{n.text}</p>
                                        )}

                                        <button
                                            className="mt-3 px-3 py-1 rounded bg-[#4A6CF7] text-xs text-white"
                                            onClick={() => setSelectedNote(null)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}



                </div>
            </div>
        </div>
    );
}
