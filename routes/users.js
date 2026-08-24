const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');

// GET /users
router.get('/', (req, res) => {
  db.all("SELECT id, name, email, role FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /users
router.post('/', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const hash = bcrypt.hashSync(password, 8);
  db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, hash, role || 'user'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, message: 'User created' });
  });
});

module.exports = router;
