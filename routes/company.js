const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /company
router.get('/', (req, res) => {
  db.get("SELECT * FROM company LIMIT 1", [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

// PUT /company
router.put('/', (req, res) => {
  const { name, logo, phone, email, address, gst_number, pan, state, alternate_phone, website, business_type } = req.body;
  // Assume there is always at least one row since we seeded it
  db.run(`UPDATE company SET name = ?, logo = ?, phone = ?, email = ?, address = ?, gst_number = ?, pan = ?, state = ?, alternate_phone = ?, website = ?, business_type = ? WHERE id = 1`,
    [name, logo, phone, email, address, gst_number, pan, state, alternate_phone, website, business_type],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Company details updated' });
    }
  );
});

// POST /company
router.post('/', (req, res) => {
  const { name, logo, phone, email, address, gst_number, pan, state, alternate_phone, website, business_type } = req.body;
  db.run(`INSERT INTO company (name, logo, phone, email, address, gst_number, pan, state, alternate_phone, website, business_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, logo, phone, email, address, gst_number, pan, state, alternate_phone, website, business_type],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Company created successfully' });
    }
  );
});

module.exports = router;
