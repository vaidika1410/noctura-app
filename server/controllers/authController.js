const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const isDev = process.env.NODE_ENV !== 'production';

async function registerUser(req, res) {
  if (isDev) console.log(`[AUTH] registerUser invoked at ${new Date().toISOString()}`);
  try {
    const { username, email, password } = req.body || {};
    if (isDev) {
      console.log('[AUTH] registerUser input:', {
        username,
        email,
        password: password ? `*** length:${String(password).length}` : undefined,
      });
    }

    // Basic validation
    if (!username || !email || !password) {
      if (isDev) console.log('[AUTH] registerUser validation failed: missing fields');
      return res.status(400).json({ error: 'username, email and password are required' });
    }
    if (password.length < 6) {
      if (isDev) console.log('[AUTH] registerUser validation failed: password too short');
      return res.status(400).json({ error: 'password must be at least 6 characters' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (isDev) console.log('[AUTH] registerUser email exists:', email.toLowerCase());
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Save user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashed,
    });
    await user.save();
    if (isDev) console.log('[AUTH] registerUser saved user id:', user._id.toString());

    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Return token and user info
    const safeUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (isDev) console.log('[AUTH] registerUser success, sending response');
    return res.status(201).json({ token, user: safeUser });
  } catch (err) {
    if (isDev) console.error('[AUTH] registerUser error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function loginUser(req, res) {
  if (isDev) console.log(`[AUTH] loginUser invoked at ${new Date().toISOString()}`);
  try {
    const { email, password } = req.body || {};
    if (isDev) {
      console.log('[AUTH] loginUser input:', {
        email,
        password: password ? `*** length:${String(password).length}` : undefined,
      });
    }

    // Basic validation
    if (!email || !password) {
      if (isDev) console.log('[AUTH] loginUser validation failed: missing fields');
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      if (isDev) console.log('[AUTH] loginUser no user found for email:', email.toLowerCase());
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (isDev) console.log('[AUTH] loginUser invalid password for user id:', user._id.toString());
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const safeUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (isDev) console.log('[AUTH] loginUser success, sending response for user id:', user._id.toString());
    return res.json({ token, user: safeUser });
  } catch (err) {
    if (isDev) console.error('[AUTH] loginUser error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  registerUser,
  loginUser,
};