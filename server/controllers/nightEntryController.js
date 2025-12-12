
const NightEntry = require("../models/NightEntry");
const Habit = require("../models/Habit");
const mongoose = require("mongoose");

function getDateString(date = new Date()) {
    return date.toISOString().split("T")[0];
}

function parseReflectionBlock(raw) {
    if (!raw || typeof raw !== "string") return null;
    const learnedMatch = raw.match(/Learned:(.*?)(?:\n|$)/i);
    const gratefulMatch = raw.match(/Grateful:(.*?)(?:\n|$)/i);
    const moodMatch = raw.match(/Mood:(.*?)(?:\n|$)/i);
    const restMatch = raw.split(/\n\s*\n/).slice(1).join("\n\n");
    return {
        learned: learnedMatch ? learnedMatch[1].trim() : "",
        grateful: gratefulMatch ? gratefulMatch[1].trim() : "",
        mood: moodMatch ? moodMatch[1].trim() : "3",
        freeform: restMatch ? restMatch.trim() : "",
    };
}


exports.getEntry = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const date = req.query.date || getDateString();

        const entry = await NightEntry.findOne({ userId, date }).lean();

   
        if (entry && entry.reflection) {
            entry.reflectionParsed = parseReflectionBlock(entry.reflection);
        }

        return res.json({ success: true, data: entry || null });
    } catch (err) {
        console.error("NightEntry get error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.saveEntry = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: "Unauthorized" });

        const body = req.body || {};
        const date = body.date || getDateString();

      
        const cleanShutdown = Array.isArray(body.shutdownHabits)
            ? body.shutdownHabits.map((s) => ({
                habitId: String(s.habitId),
                completed: !!s.completed,
            }))
            : [];

        const baseUpdate = {
            date,
            userId,
            topTasks: Array.isArray(body.topTasks)
                ? body.topTasks.slice(0, 3)
                : [],
            notes: body.notes || "",
            reflection: body.reflection || "",
            shutdownHabits: cleanShutdown,
        };

        const updated = await NightEntry.findOneAndUpdate(
            { userId, date },
            { $set: baseUpdate },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

    
        if (body.freeformJournal && body.freeformJournal.trim()) {
            await NightEntry.findOneAndUpdate(
                { userId, date },
                {
                    $push: {
                        historyNotes: {
                            date,
                            text: body.freeformJournal.trim(),
                            createdAt: new Date(),
                        },
                    },
                }
            );
        }

        const fresh = await NightEntry.findOne({ userId, date }).lean();

        if (fresh?.reflection) {
            fresh.reflectionParsed = parseReflectionBlock(fresh.reflection);
        }

        return res.json({ success: true, data: fresh });
    } catch (err) {
        console.error("NightEntry save error REAL >>>", err);
        return res
            .status(500)
            .json({ success: false, message: "Server error", error: err.message });
    }
};




exports.getHistory = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const entries = await NightEntry.find({ userId }).sort({ date: -1 }).lean();


        return res.json({ success: true, data: entries });
    } catch (err) {
        console.error("NightEntry history error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.getJournalHistory = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const entries = await NightEntry.find({ userId }, { historyNotes: 1, date: 1 }).lean();

        const flattened = [];
        for (const entry of entries) {
            if (Array.isArray(entry.historyNotes)) {
                for (const note of entry.historyNotes) {
                    flattened.push({
                        noteId: note._id,
                        entryDate: entry.date,
                        date: note.date || entry.date,
                        text: note.text,
                        createdAt: note.createdAt,
                    });
                }
            }
        }


        flattened.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.json({ success: true, data: flattened });
    } catch (err) {
        console.error("getJournalHistory error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteJournalNote = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { noteId } = req.params;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
        if (!noteId) return res.status(400).json({ success: false, message: "noteId required" });

        const objectId = new mongoose.Types.ObjectId(noteId);

        const result = await NightEntry.findOneAndUpdate(
            { userId, "historyNotes._id": objectId },
            { $pull: { historyNotes: { _id: objectId } } },
            { new: true }
        );

        if (!result)
            return res.status(404).json({ success: false, message: "Note not found" });

        return res.json({ success: true, data: { message: "Note deleted" } });
    } catch (err) {
        console.error("deleteJournalNote error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
