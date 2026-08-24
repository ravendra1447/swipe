const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /company
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM company LIMIT 1");
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /company
router.put('/', async (req, res) => {
  try {
    const { name, logo, phone, email, address, gst_number, pan, state, alternate_phone, website, business_type } = req.body;
    await db.execute(`UPDATE company SET name = ?, logo = ?, phone = ?, email = ?, address = ?, gst_number = ?, pan = ?, state = ?, alternate_phone = ?, website = ?, business_type = ? WHERE id = 1`,
      [name, logo, phone, email, address, gst_number, pan, state, alternate_phone, website, business_type]
    );
    res.json({ message: 'Company details updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /company
router.post('/', async (req, res) => {
  try {
    const { name, logo, phone, email, address, gst_number, pan, state, alternate_phone, website, business_type } = req.body;
    const [result] = await db.execute(`INSERT INTO company (name, logo, phone, email, address, gst_number, pan, state, alternate_phone, website, business_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, logo, phone, email, address, gst_number, pan, state, alternate_phone, website, business_type]
    );
    res.status(201).json({ id: result.insertId, message: 'Company created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
