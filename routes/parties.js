const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  db.all("SELECT * FROM parties", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id } = req.body;
  db.run("INSERT INTO parties (name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

router.put('/:id', (req, res) => {
  const { name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id } = req.body;
  db.run("UPDATE parties SET name=?, phone=?, due=?, type=?, initials=?, color=?, email=?, gstin=?, company_name=?, billing_address=?, shipping_address=?, tds=?, tcs=?, rcm_applicable=?, notes=?, tags=?, credit_limit=?, state=?, linked_customer_id=? WHERE id=?",
    [name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Party updated' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run("DELETE FROM parties WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Party deleted' });
  });
});

module.exports = router;
