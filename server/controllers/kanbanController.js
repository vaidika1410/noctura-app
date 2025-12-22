const mongoose = require("mongoose");
const KanbanTask = require("../models/KanbanTask");

async function addKanbanComment(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (String(task.user) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!Array.isArray(task.comments)) {
      task.comments = [];
    }

    task.comments.push({
      text: text.trim(),
      createdAt: new Date(),
    });

    await task.save();

    return res.json({
      success: true,
      data: task.comments,
    });
  } catch (err) {
    console.error("🔥 ADD COMMENT CRASH:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


// EDIT COMMENT
async function editComment(req, res) {
  try {
    const userId = req.user.id;
    const { id, commentId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (String(task.user) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const comment = task.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.text = text.trim();
    await task.save();

    res.json({ success: true, data: task.comments });
  } catch (err) {
    console.error("Edit comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE COMMENT
const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, commentId } = req.params;

    const task = await KanbanTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (String(task.userId) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.deleteOne();     
    await task.save();

    return res.json({
      success: true,
      data: task.comments,
    });
  } catch (err) {
    console.error("Delete comment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  addKanbanComment,
  editComment,
  deleteComment,
};
