const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM einvoices');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { invoice_number, status } = req.body;
    const sql = 'INSERT INTO einvoices (invoice_number, status) VALUES (?, ?)';
    const [result] = await db.execute(sql, [invoice_number, status]);
    res.status(201).json({ id: result.insertId, invoice_number, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM einvoices WHERE id=?', [req.params.id]);
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
