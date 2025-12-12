const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * UPDATE USER PROFILE
 * fields allowed: username, email
 */
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username && !email) {
      return res.status(400).json({ error: "No fields provided" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id, 
      { username, email },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Profile updated successfully",
      user: updated
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
