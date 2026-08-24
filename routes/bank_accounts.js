const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  db.all("SELECT * FROM bank_accounts", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { account_holder_name, account_no, ifsc_code, bank_name, branch_name, upi_id, upi_number, opening_balance, notes, is_default } = req.body;
  
  if (is_default) {
    db.run("UPDATE bank_accounts SET is_default = 0", [], (err) => {
      if (err) console.error('Failed to reset default banks', err.message);
    });
  }

  db.run("INSERT INTO bank_accounts (account_holder_name, account_no, ifsc_code, bank_name, branch_name, upi_id, upi_number, opening_balance, notes, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [account_holder_name, account_no, ifsc_code, bank_name, branch_name, upi_id, upi_number, opening_balance, notes, is_default ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

module.exports = router;
