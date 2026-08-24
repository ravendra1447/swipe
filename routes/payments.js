const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/timeline', (req, res) => {
  db.all("SELECT * FROM payments_timeline ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
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
  });
});

router.post('/', (req, res) => {
  const { date, type, amount, reference } = req.body;
  db.run("INSERT INTO payments_timeline (date, type, amount, reference) VALUES (?, ?, ?, ?)",
    [date, type, amount, reference],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

router.put('/:id', (req, res) => {
  const { date, type, amount, reference } = req.body;
  db.run("UPDATE payments_timeline SET date=?, type=?, amount=?, reference=? WHERE id=?",
    [date, type, amount, reference, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Payment updated' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run("DELETE FROM payments_timeline WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Payment deleted' });
  });
});

module.exports = router;
