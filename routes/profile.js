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
router.get('/', mockAuth, (req, res) => {
  db.get("SELECT id, name, email, role FROM users WHERE id = ?", [req.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

// PUT /profile
router.put('/', mockAuth, (req, res) => {
  const { name, email, password } = req.body;
  if (password) {
    const hash = bcrypt.hashSync(password, 8);
    db.run("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?", [name, email, hash, req.userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile updated with new password' });
    });
  } else {
    db.run("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, req.userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile updated' });
    });
  }
});

module.exports = router;
