const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  db.all("SELECT * FROM app_settings", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });
});

router.post('/', (req, res) => {
  const { key, value } = req.body;
  db.run("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", [key, value], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
