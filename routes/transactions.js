const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM transactions");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, invoice, date, amount, status, by_user, hasWhatsapp, items } = req.body;
    const [result] = await db.execute(
      "INSERT INTO transactions (name, invoice, date, amount, status, by_user, hasWhatsapp) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, invoice, date, amount, status, by_user, hasWhatsapp]
    );
    
    const transactionId = result.insertId;
    
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (item.id) {
          try {
            await db.execute("UPDATE product_details SET quantity = quantity - ? WHERE product_id = ?", [item.qty || 1, item.id]);
          } catch (updateErr) {
            console.error('Failed to update inventory for item', item.id, updateErr);
          }
        }
      }
    }
    res.status(201).json({ id: transactionId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, invoice, date, amount, status, by_user, hasWhatsapp } = req.body;
    await db.execute("UPDATE transactions SET name=?, invoice=?, date=?, amount=?, status=?, by_user=?, hasWhatsapp=? WHERE id=?",
      [name, invoice, date, amount, status, by_user, hasWhatsapp, req.params.id]
    );
    res.json({ message: 'Transaction updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.execute("DELETE FROM transactions WHERE id=?", [req.params.id]);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM transactions WHERE id=?", [req.params.id]);
    const tx = rows[0];
    if (!tx) return res.status(404).send('Transaction not found');
    
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/excel', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM transactions WHERE id=?", [req.params.id]);
    const tx = rows[0];
    if (!tx) return res.status(404).send('Transaction not found');
    
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
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
