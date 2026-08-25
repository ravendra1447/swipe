const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/gstr1', async (req, res) => {
  try {
    const { tab } = req.query;
    // Calculate GSTR1 dynamically from transactions
    const [txRows] = await db.execute("SELECT * FROM transactions WHERE user_id = ?", [req.user.id]);
    
    // We will generate B2B and B2C mock records based on actual transactions
    const records = [];
    txRows.forEach(tx => {
      // Assuming if hasWhatsapp is 1, it's B2B, otherwise B2C (just a simple mock logic to make it dynamic)
      const tabType = tx.hasWhatsapp ? 'B2B' : 'B2C';
      if (!tab || tab === tabType) {
        records.push({
          id: tx.id,
          tab_type: tabType,
          date: tx.date || new Date().toLocaleDateString(),
          voucher_number: tx.invoice,
          total_amount: tx.amount,
          taxable_amount: (tx.amount * 0.82).toFixed(2), // Mocking 18% tax
          igst: 0,
          cgst: (tx.amount * 0.09).toFixed(2),
          sgst: (tx.amount * 0.09).toFixed(2),
          status: tx.status
        });
      }
    });
    
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
