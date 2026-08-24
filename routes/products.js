const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /products
router.get('/', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /products/:id/details
router.get('/:id/details', (req, res) => {
  const productId = req.params.id;
  db.get("SELECT p.*, pd.* FROM products p LEFT JOIN product_details pd ON p.id = pd.product_id WHERE p.id = ?", [productId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  });
});

// POST /products
router.post('/', (req, res) => {
  const { title, price, tag, discount, details } = req.body;
  db.run("INSERT INTO products (title, price, tag, discount) VALUES (?, ?, ?, ?)",
    [title, price, tag, discount],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const productId = this.lastID;
      
      if (details) {
        db.run("INSERT INTO product_details (product_id, selling_price, tax_rate, purchase_price, quantity, unit, category, hsn_code, type, barcode, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [productId, details.selling_price, details.tax_rate, details.purchase_price, details.quantity, details.unit, details.category, details.hsn_code, details.type, details.barcode, details.description],
          function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });
            res.status(201).json({ id: productId });
          }
        );
      } else {
        res.status(201).json({ id: productId });
      }
    }
  );
});

// PUT /products/:id
router.put('/:id', (req, res) => {
  const productId = req.params.id;
  const { title, price, tag, discount, details } = req.body;
  
  db.run("UPDATE products SET title=?, price=?, tag=?, discount=? WHERE id=?",
    [title, price, tag, discount, productId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      if (details) {
        db.run("UPDATE product_details SET selling_price=?, tax_rate=?, purchase_price=?, quantity=?, unit=?, category=?, hsn_code=?, type=?, barcode=?, description=? WHERE product_id=?",
          [details.selling_price, details.tax_rate, details.purchase_price, details.quantity, details.unit, details.category, details.hsn_code, details.type, details.barcode, details.description, productId],
          function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: 'Product and details updated' });
          }
        );
      } else {
        res.json({ message: 'Product updated' });
      }
    }
  );
});

// DELETE /products/:id
router.delete('/:id', (req, res) => {
  db.run("DELETE FROM products WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run("DELETE FROM product_details WHERE product_id=?", [req.params.id], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Product and details deleted' });
    });
  });
});

module.exports = router;
