const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = parts[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = { 
      _id: decoded.id,
      id: decoded.id
    };

    next();
  } catch (err) {
    console.error('[AUTH] token verification failed:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = authMiddleware;
