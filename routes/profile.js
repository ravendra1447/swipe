const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');

const authenticateToken = require('../middleware/auth');

// GET /profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id, name, email, role FROM users WHERE id = ?", [req.user.id]);
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (password) {
      const hash = await bcrypt.hash(password, 8);
      await db.execute("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?", [name, email, hash, req.user.id]);
      res.json({ message: 'Profile updated with new password' });
    } else {
      await db.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, req.user.id]);
      res.json({ message: 'Profile updated' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
