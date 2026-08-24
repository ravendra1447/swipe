const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/timeline', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM payments_timeline ORDER BY id DESC");
    
    let received = 0;
    let paid = 0;
    rows.forEach(r => {
      if (r.type === 'received') received += r.amount;
      if (r.type === 'paid') paid += r.amount;
    });

    res.json({
      summary: { received, paid, netBalance: received - paid },
      events: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, type, amount, reference } = req.body;
    const [result] = await db.execute("INSERT INTO payments_timeline (date, type, amount, reference) VALUES (?, ?, ?, ?)",
      [date, type, amount, reference]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { date, type, amount, reference } = req.body;
    await db.execute("UPDATE payments_timeline SET date=?, type=?, amount=?, reference=? WHERE id=?",
      [date, type, amount, reference, req.params.id]
    );
    res.json({ message: 'Payment updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.execute("DELETE FROM payments_timeline WHERE id=?", [req.params.id]);
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
