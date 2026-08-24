const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM app_settings WHERE user_id = ?", [req.user.id]);
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { key, value } = req.body;
    await db.execute("INSERT INTO app_settings (user_id, `key`, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?", [req.user.id, key, value, value]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
