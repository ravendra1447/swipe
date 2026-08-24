const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');

// Helper middleware mock to extract user id (normally you'd parse JWT here)
const mockAuth = (req, res, next) => {
  req.userId = 1; // MOCKING LOGGED IN USER AS ID 1
  next();
};

// GET /profile
router.get('/', mockAuth, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id, name, email, role FROM users WHERE id = ?", [req.userId]);
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /profile
router.put('/', mockAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (password) {
      const hash = await bcrypt.hash(password, 8);
      await db.execute("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?", [name, email, hash, req.userId]);
      res.json({ message: 'Profile updated with new password' });
    } else {
      await db.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, req.userId]);
      res.json({ message: 'Profile updated' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
