const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('../controllers/authController');

// POST /register -> registerUser
router
  .route('/register')
  .post(registerUser)
  .all((req, res) =>
    res.status(405).json({
      error: 'Method Not Allowed. Use POST /api/auth/register with JSON body { username, email, password }'
    })
  );

// POST /login -> loginUser
router
  .route('/login')
  .post(loginUser)
  .all((req, res) =>
    res.status(405).json({
      error: 'Method Not Allowed. Use POST /api/auth/login with JSON body { email, password }'
    })
  );

module.exports = router;