const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /products
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /products/:id/details
router.get('/:id/details', async (req, res) => {
  try {
    const productId = req.params.id;
    const [rows] = await db.execute("SELECT p.*, pd.* FROM products p LEFT JOIN product_details pd ON p.id = pd.product_id WHERE p.id = ?", [productId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /products
router.post('/', async (req, res) => {
  try {
    const { title, price, tag, discount, details } = req.body;
    const [result] = await db.execute("INSERT INTO products (title, price, tag, discount) VALUES (?, ?, ?, ?)",
      [title, price, tag, discount]
    );
    const productId = result.insertId;
    
    if (details) {
      await db.execute("INSERT INTO product_details (product_id, selling_price, tax_rate, purchase_price, quantity, unit, category, hsn_code, type, barcode, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [productId, details.selling_price, details.tax_rate, details.purchase_price, details.quantity, details.unit, details.category, details.hsn_code, details.type, details.barcode, details.description]
      );
    }
    res.status(201).json({ id: productId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /products/:id
router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { title, price, tag, discount, details } = req.body;
    
    await db.execute("UPDATE products SET title=?, price=?, tag=?, discount=? WHERE id=?",
      [title, price, tag, discount, productId]
    );
    
    if (details) {
      await db.execute("UPDATE product_details SET selling_price=?, tax_rate=?, purchase_price=?, quantity=?, unit=?, category=?, hsn_code=?, type=?, barcode=?, description=? WHERE product_id=?",
        [details.selling_price, details.tax_rate, details.purchase_price, details.quantity, details.unit, details.category, details.hsn_code, details.type, details.barcode, details.description, productId]
      );
      res.json({ message: 'Product and details updated' });
    } else {
      res.json({ message: 'Product updated' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /products/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.execute("DELETE FROM products WHERE id=?", [req.params.id]);
    await db.execute("DELETE FROM product_details WHERE product_id=?", [req.params.id]);
    res.json({ message: 'Product and details deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
