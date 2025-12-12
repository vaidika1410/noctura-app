const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('../controllers/authController');

router.get('/register', (req, res) => {
  res.send(`<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Register</title></head>
  <body>
    <h2>Register (sends JSON)</h2>
    <form id="form">
      <label>Username: <input name="username" required></label><br>
      <label>Email: <input name="email" type="email" required></label><br>
      <label>Password: <input name="password" type="password" required></label><br>
      <button type="submit">Register</button>
    </form>
    <pre id="out"></pre>
    <script>
      document.getElementById('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = e.target;
        const body = {
          username: f.username.value,
          email: f.email.value,
          password: f.password.value
        };
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.text();
        document.getElementById('out').textContent = res.status + '\\n' + data;
      });
    </script>
  </body>
</html>`);
});

router.get('/login', (req, res) => {
  res.send(`<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Login</title></head>
  <body>
    <h2>Login (sends JSON)</h2>
    <form id="form">
      <label>Email: <input name="email" type="email" required></label><br>
      <label>Password: <input name="password" type="password" required></label><br>
      <button type="submit">Login</button>
    </form>
    <pre id="out"></pre>
    <script>
      document.getElementById('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = e.target;
        const body = { email: f.email.value, password: f.password.value };
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.text();
        document.getElementById('out').textContent = res.status + '\\n' + data;
      });
    </script>
  </body>
</html>`);
});

// POST /register -> registerUser
router.post('/register', registerUser);

// POST /login -> loginUser
router.post('/login', loginUser);

const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// GET /auth/me -> return logged-in user info
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error("[AUTH] /me route error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/update-profile", authMiddleware, async (req, res) => {
  console.log("🔥 HIT /update-profile");

  console.log("Headers:", req.headers);
  console.log("User from middleware:", req.user);
  console.log("Body received:", req.body);

  try {
    const userId = req.user?._id;

    if (!userId) {
      console.log("❌ No userId found");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { username, email } = req.body;

    if (!username || !email) {
      console.log("❌ Missing fields");
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true, runValidators: true }
    );

    console.log("✔️ Updated user:", updatedUser);

    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.log("💥 Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;