const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');

// GET /users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id, name, email, role FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, companyName, gstin, companyAddress, companyPhone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const hash = await bcrypt.hash(password, 8);
    const [result] = await db.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, hash, role || 'user']);
    
    if (companyName) {
      await db.execute(
        "INSERT INTO company (user_id, name, gst_number, address, phone) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), gst_number = VALUES(gst_number), address = VALUES(address), phone = VALUES(phone)",
        [result.insertId, companyName, gstin || '', companyAddress || '', companyPhone || '']
      );
    }
    
    res.status(201).json({ id: result.insertId, message: 'User and Company created/updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
