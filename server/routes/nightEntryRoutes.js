// routes/nightEntryRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const nightEntryController = require("../controllers/nightEntryController");

// Get entry for a specific date (or today)
router.get("/", auth, nightEntryController.getEntry);

// Save or update night entry
router.put("/", auth, nightEntryController.saveEntry);

// Get full night entry history
router.get("/history", auth, nightEntryController.getHistory);

// Get flattened journal history (for browsing all notes)
router.get("/journal-history", auth, nightEntryController.getJournalHistory);

// Delete a specific journal note
router.delete("/journal/:noteId", auth, nightEntryController.deleteJournalNote);

module.exports = router;
