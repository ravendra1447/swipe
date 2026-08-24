const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/gstr1', (req, res) => {
  const { tab } = req.query;
  let query = "SELECT * FROM gstr1_records";
  let params = [];
  if (tab) {
    query += " WHERE tab_type = ?";
    params.push(tab);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
