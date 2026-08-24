const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM einvoices', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { invoice_number, status } = req.body;
  const sql = 'INSERT INTO einvoices (invoice_number, status) VALUES (?, ?)';
  db.query(sql, [invoice_number, status], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, invoice_number, status });
  });
});

module.exports = router;

router.get('/:id/pdf', (req, res) => {
  db.query('SELECT * FROM einvoices WHERE id=?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const bill = results[0];
    if (!bill) return res.status(404).send('E-Invoice not found');
    
    const PDFDocument = require('pdfkit');
    const { generateInvoicePDF } = require('../pdf_generator');
    
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=einvoice_${bill.invoice_number}.pdf`);
    doc.pipe(res);
    
    const pdfData = {
      ewbNo: bill.invoice_number,
      generatedDate: new Date().toLocaleDateString(),
      validUntil: '',
      supplierGSTIN: '09ABCDE1234F1Z5',
      supplierName: 'Bangkok Mart',
      recipientGSTIN: '',
      recipientName: 'Customer',
      placeOfDispatch: '',
      placeOfDelivery: '',
      docNo: bill.invoice_number,
      docDate: new Date().toLocaleDateString(),
      docType: 'Tax Invoice',
      totalValue: '0',
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
         { sn: '1', hsn: '', desc: 'E-Invoice Service', qty: '1', unit: 'Pcs', val: '0' }
      ]
    };
    
    generateInvoicePDF(doc, pdfData);
    doc.end();
  });
});
