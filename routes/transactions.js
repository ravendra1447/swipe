const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM transactions WHERE user_id = ?", [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, invoice, date, amount, status, by_user, hasWhatsapp, items } = req.body;
    const params = [req.user.id, name, invoice, date, amount, status, by_user, hasWhatsapp].map(v => v === undefined ? null : v);
    const [result] = await db.execute(
      "INSERT INTO transactions (user_id, name, invoice, date, amount, status, by_user, hasWhatsapp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      params
    );
    
    const transactionId = result.insertId;
    
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (item.id) {
          try {
            await db.execute("UPDATE product_details SET quantity = quantity - ? WHERE product_id = ? AND user_id = ?", [item.qty || 1, item.id, req.user.id]);
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
    const params = [name, invoice, date, amount, status, by_user, hasWhatsapp, req.params.id, req.user.id].map(v => v === undefined ? null : v);
    await db.execute("UPDATE transactions SET name=?, invoice=?, date=?, amount=?, status=?, by_user=?, hasWhatsapp=? WHERE id=? AND user_id=?",
      params
    );
    res.json({ message: 'Transaction updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.execute("DELETE FROM transactions WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM transactions WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
    const tx = rows[0];
    if (!tx) return res.status(404).send('Transaction not found');
    
    const PDFDocument = require('pdfkit');
    const { generateInvoicePDF } = require('../pdf_generator');
    
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${tx.invoice}.pdf`);
    doc.pipe(res);
    
    // Map transaction data to the generator
    const pdfData = {
      ewbNo: tx.invoice,
      generatedDate: tx.date,
      validUntil: '',
      supplierGSTIN: '09ABCDE1234F1Z5',
      supplierName: 'Bangkok Mart',
      recipientGSTIN: '',
      recipientName: tx.name,
      placeOfDispatch: '',
      placeOfDelivery: '',
      docNo: tx.invoice,
      docDate: tx.date,
      docType: 'Tax Invoice',
      totalValue: tx.amount,
      hsnCode: '',
      transportReason: 'Outward - Supply',
      transactionType: 'Regular',
      transportMode: '',
      vehicleNo: '',
      transporterId: '',
      transporterName: '',
      transporterDoc: '',
      transporterDocDate: '',
      fromPlace: '',
      toPlace: '',
      items: [
         // Ideally we would fetch items from a transaction_items table, but for now we put a placeholder total
         { sn: '1', hsn: '', desc: 'Total Transaction Value', qty: '1', unit: 'Pcs', val: tx.amount }
      ]
    };
    
    generateInvoicePDF(doc, pdfData);
    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/excel', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM transactions WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
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
