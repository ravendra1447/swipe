const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  db.all("SELECT * FROM transactions", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name, invoice, date, amount, status, by_user, hasWhatsapp, items } = req.body;
  db.run("INSERT INTO transactions (name, invoice, date, amount, status, by_user, hasWhatsapp) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, invoice, date, amount, status, by_user, hasWhatsapp],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      const transactionId = this.lastID;
      
      // Update inventory if items were provided
      if (items && Array.isArray(items) && items.length > 0) {
        let itemsProcessed = 0;
        items.forEach(item => {
          if (item.id) {
            db.run("UPDATE product_details SET quantity = quantity - ? WHERE product_id = ?", [item.qty || 1, item.id], (updateErr) => {
              if (updateErr) console.error('Failed to update inventory for item', item.id, updateErr);
              itemsProcessed++;
              if (itemsProcessed === items.length) {
                res.status(201).json({ id: transactionId });
              }
            });
          } else {
            itemsProcessed++;
            if (itemsProcessed === items.length) {
              res.status(201).json({ id: transactionId });
            }
          }
        });
      } else {
        res.status(201).json({ id: transactionId });
      }
    }
  );
});

router.put('/:id', (req, res) => {
  const { name, invoice, date, amount, status, by_user, hasWhatsapp } = req.body;
  db.run("UPDATE transactions SET name=?, invoice=?, date=?, amount=?, status=?, by_user=?, hasWhatsapp=? WHERE id=?",
    [name, invoice, date, amount, status, by_user, hasWhatsapp, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Transaction updated' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run("DELETE FROM transactions WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Transaction deleted' });
  });
});

router.get('/:id/pdf', (req, res) => {
  db.get("SELECT * FROM transactions WHERE id=?", [req.params.id], (err, tx) => {
    if (err || !tx) return res.status(404).send('Transaction not found');
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${tx.invoice}.pdf`);
    doc.pipe(res);
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Invoice No: ${tx.invoice}`);
    doc.fontSize(14).text(`Date: ${tx.date}`);
    doc.text(`Customer: ${tx.name}`);
    doc.moveDown();
    doc.text(`Total Amount: Rs. ${tx.amount}`);
    doc.text(`Status: ${tx.status}`);
    doc.end();
  });
});

router.get('/:id/excel', (req, res) => {
  db.get("SELECT * FROM transactions WHERE id=?", [req.params.id], (err, tx) => {
    if (err || !tx) return res.status(404).send('Transaction not found');
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Invoice');
    sheet.columns = [
      { header: 'Invoice No', key: 'invoice', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Customer', key: 'name', width: 30 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];
    sheet.addRow(tx);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${tx.invoice}.xlsx`);
    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  });
});

module.exports = router;
