const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM signatures");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, data } = req.body;
    const [result] = await db.execute("INSERT INTO signatures (name, type, data) VALUES (?, ?, ?)",
      [name, type, data]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
