const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  db.get("SELECT * FROM dashboard_stats LIMIT 1", [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

module.exports = router;
