const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM einvoices WHERE user_id = ?', [req.user.id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { invoice_number, status } = req.body;
    const sql = 'INSERT INTO einvoices (user_id, invoice_number, status) VALUES (?, ?, ?)';
    const [result] = await db.execute(sql, [req.user.id, invoice_number, status]);
    res.status(201).json({ id: result.insertId, invoice_number, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM einvoices WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    const bill = results[0];
    if (!bill) return res.status(404).send('E-Invoice not found');
    
    const PDFDocument = require('pdfkit');
    const { generateInvoicePDF } = require('../pdf_generator');
    
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=einvoice_${bill.invoice_number}.pdf`);
    doc.pipe(res);
    
    // Fetch the company for this user
    const [compRows] = await db.execute("SELECT * FROM company WHERE user_id=? LIMIT 1", [req.user.id]);
    const company = compRows[0] || { name: 'My Company', gst_number: '' };
    
    const pdfData = {
      ewbNo: bill.invoice_number,
      generatedDate: new Date().toLocaleDateString(),
      validUntil: '',
      supplierGSTIN: company.gst_number || '',
      supplierName: company.name,
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
