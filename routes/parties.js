const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM parties WHERE user_id = ?", [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id } = req.body;
    const params = [req.user.id, name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id].map(v => v === undefined ? null : v);
    const [result] = await db.execute("INSERT INTO parties (user_id, name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      params
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id } = req.body;
    const params = [name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id, req.params.id, req.user.id].map(v => v === undefined ? null : v);
    await db.execute("UPDATE parties SET name=?, phone=?, due=?, type=?, initials=?, color=?, email=?, gstin=?, company_name=?, billing_address=?, shipping_address=?, tds=?, tcs=?, rcm_applicable=?, notes=?, tags=?, credit_limit=?, state=?, linked_customer_id=? WHERE id=? AND user_id=?",
      params
    );
    res.json({ message: 'Party updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.execute("DELETE FROM parties WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
    res.json({ message: 'Party deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
