const express = require("express");
const router = express.Router();
const Reminder = require("../models/Reminder");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/debug/all", async (req, res) => {
  const all = await Reminder.find({});
  res.json(all);
});

router.get("/range", authMiddleware, async (req, res) => {
  try {
    const { start, end } = req.query;

    const reminders = await Reminder.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET reminders for a specific date
router.get("/:date", authMiddleware, async (req, res) => {
  try {
    const reminders = await Reminder.find({
      userId: req.user._id,
      date: req.params.date,
    });

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE reminder
router.post("/", authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.create({
      ...req.body,
      userId: req.user._id,
    });

    res.json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE reminder
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE reminder
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
