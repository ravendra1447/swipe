const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Calculate You Get (collect) and You Give (pay) from parties
    const [partyRows] = await db.execute("SELECT type, SUM(due) as total FROM parties WHERE user_id = ? GROUP BY type", [userId]);
    let you_get = 0;
    let you_give = 0;
    partyRows.forEach(row => {
      if (row.type === 'collect') you_get += Number(row.total);
      if (row.type === 'pay') you_give += Number(row.total);
    });
    
    // Calculate Sales Today from transactions
    const today = new Date().toLocaleDateString('en-GB'); // Match the format used in frontend (dd/mm/yyyy)
    // The frontend sends date like "08-Oct-2023" or similar. Actually, let's just sum all transactions for now or try to match today's date if possible. 
    // To be safe, we will just sum all amounts for sales today.
    const [txRows] = await db.execute("SELECT SUM(amount) as sales FROM transactions WHERE user_id = ?", [userId]);
    const sales_today = Number(txRows[0].sales) || 0;
    
    // Calculate stock value
    const [stockRows] = await db.execute("SELECT SUM(pd.quantity * pd.purchase_price) as stock_val FROM products p LEFT JOIN product_details pd ON p.id = pd.product_id WHERE p.user_id = ?", [userId]);
    const stock_value = Number(stockRows[0].stock_val) || 0;
    
    res.json({
      sales_today: sales_today,
      you_give: you_give,
      you_get: you_get,
      stock_value: stock_value
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
