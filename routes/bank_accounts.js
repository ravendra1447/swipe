const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM bank_accounts WHERE user_id = ?", [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { account_holder_name, account_no, ifsc_code, bank_name, branch_name, upi_id, upi_number, opening_balance, notes, is_default } = req.body;
    
    if (is_default) {
      try {
        await db.execute("UPDATE bank_accounts SET is_default = 0 WHERE user_id = ?", [req.user.id]);
      } catch (err) {
        console.error('Failed to reset default banks', err.message);
      }
    }

    const [result] = await db.execute("INSERT INTO bank_accounts (user_id, account_holder_name, account_no, ifsc_code, bank_name, branch_name, upi_id, upi_number, opening_balance, notes, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, account_holder_name, account_no, ifsc_code, bank_name, branch_name, upi_id, upi_number, opening_balance, notes, is_default ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
