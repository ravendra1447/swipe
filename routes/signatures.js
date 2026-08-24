const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  db.all("SELECT * FROM signatures", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name, type, data } = req.body;
  
  db.run("INSERT INTO signatures (name, type, data) VALUES (?, ?, ?)",
    [name, type, data],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

module.exports = router;
