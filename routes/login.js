const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key_here'; // Mock secret

// POST /login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// POST /signup
router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const hash = bcrypt.hashSync(password, 8);
  db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, hash, 'user'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'User created successfully', userId: this.lastID });
  });
});

// POST /otp
router.post('/otp', (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) return res.status(400).json({ error: 'Missing fields' });

  if (otp === '123456') {
    const token = jwt.sign({ id: 999, mobile: mobile, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ message: 'Login successful', token, user: { id: 999, name: 'Demo User', mobile: mobile } });
  } else {
    return res.status(401).json({ error: 'Invalid OTP' });
  }
});

module.exports = router;
