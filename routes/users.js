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
      // Assuming a single tenant local setup for now. We update the company record (ID = 1) 
      // or insert it if it doesn't exist.
      await db.execute(
        "INSERT INTO company (id, name, gst_number, address, phone) VALUES (1, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), gst_number = VALUES(gst_number), address = VALUES(address), phone = VALUES(phone)",
        [companyName, gstin || '', companyAddress || '', companyPhone || '']
      );
    }
    
    res.status(201).json({ id: result.insertId, message: 'User and Company created/updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
