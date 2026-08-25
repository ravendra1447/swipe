const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/gstr1', async (req, res) => {
  try {
    const { tab } = req.query;
    let query = "SELECT * FROM gstr1_records WHERE 1=1";
    let params = [];
    
    if (tab) {
      query += " AND tab_type = ?";
      params.push(tab);
    }
    
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
