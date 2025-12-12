const mongoose = require('mongoose');
const Habit = require('../models/Habit');

function getUserIdFromReq(req) {
  return req.user?._id || req.user?.id || null;
}

function normalizeDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

module.exports = {
  // ---------------- GET ALL HABITS ----------------
  async getHabits(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const habits = await Habit.find({ userId }).sort({ createdAt: -1 }).lean();

      return res.status(200).json({ success: true, data: habits });
    } catch (err) {
      console.error("getHabits error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ---------------- CREATE HABIT ----------------
  async addHabit(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const { title, description, frequency, sheetUrl } = req.body;

      if (!title) {
        return res.status(400).json({ success: false, message: "title is required" });
      }

      const newHabit = await Habit.create({
        title,
        description: description || "",
        frequency: frequency || "daily",
        sheetUrl: sheetUrl || "",
        userId,
        completedDates: [],
        isShutdown: !!req.body.isShutdown,
      });

      return res.status(201).json({ success: true, data: newHabit });
    } catch (err) {
      console.error("addHabit error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ---------------- UPDATE HABIT ----------------
  async updateHabit(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const { id } = req.params;

      const updates = {};

    
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.frequency !== undefined) updates.frequency = req.body.frequency;
      if (req.body.sheetUrl !== undefined) updates.sheetUrl = req.body.sheetUrl;

      if (req.body.isShutdown !== undefined) {
        updates.isShutdown = !!req.body.isShutdown;
      }

      const updated = await Habit.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: "Habit not found" });
      }

      return res.status(200).json({ success: true, data: updated });

    } catch (err) {
      console.error("updateHabit error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ---------------- DELETE HABIT ----------------
  async deleteHabit(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      const { id } = req.params;

      const deleted = await Habit.findOneAndDelete({ _id: id, userId });

      if (!deleted) {
        return res.status(404).json({ success: false, message: "Habit not found" });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("deleteHabit error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  async markCompleted(req, res) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      let { date } = req.query;

      if (!date) {
        
        const today = new Date();
        date = today.toISOString().split("T")[0];
      }

      const habit = await Habit.findOne({ _id: id, userId });
      if (!habit) return res.status(404).json({ success: false, message: "Habit not found" });

      if (!habit.completedDates.includes(date)) {
        habit.completedDates.push(date);
        await habit.save();
      }

      return res.status(200).json({ success: true, data: habit });
    } catch (error) {
      console.error("markCompleted error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },


  async unmarkCompleted(req, res) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      let { date } = req.query;

      if (!date) {
        const today = new Date();
        date = today.toISOString().split("T")[0];
      }

      const habit = await Habit.findOne({ _id: id, userId });
      if (!habit) return res.status(404).json({ success: false, message: "Habit not found" });

      habit.completedDates = habit.completedDates.filter(d => d !== date);
      await habit.save();

      return res.status(200).json({ success: true, data: habit });
    } catch (error) {
      console.error("unmarkCompleted error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

};
