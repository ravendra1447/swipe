const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM eway_bills WHERE user_id = ?', [req.user.id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { 
    billNumber, amount, status
  } = req.body;

  const sql = `INSERT INTO eway_bills (
    user_id, billNumber, amount, status
  ) VALUES (?, ?, ?, ?)`;

  const values = [
    req.user.id, billNumber, amount, status
  ];

  try {
    const [result] = await db.execute(sql, values);
    res.status(201).json({ id: result.insertId, billNumber, amount, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM eway_bills WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    const bill = results[0];
    if (!bill) return res.status(404).send('E-Way bill not found');

    const itemResults = []; // Table document_items does not exist in DB
    
    const PDFDocument = require('pdfkit');
    const { generateEWayBillPDF } = require('../pdf_generator');
    
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=eway_bill_${bill.billNumber}.pdf`);
    doc.pipe(res);
    
    // Fetch the company for this user
    const [compRows] = await db.execute("SELECT * FROM company WHERE user_id=? LIMIT 1", [req.user.id]);
    const company = compRows[0] || { name: 'My Company', gst_number: '' };
    
    const pdfData = {
      ewbNo: bill.billNumber,
      generatedDate: bill.docDate,
      validUntil: '',
      supplierGSTIN: bill.supplierGSTIN || company.gst_number || '',
      supplierName: bill.supplierName || company.name,
      recipientGSTIN: bill.recipientGSTIN || '',
      recipientName: bill.recipientName || 'Recipient',
      placeOfDispatch: bill.placeOfDispatch,
      placeOfDelivery: bill.placeOfDelivery,
      docNo: bill.docNo,
      docDate: bill.docDate,
      docType: bill.docType,
      totalValue: bill.amount,
      hsnCode: bill.hsnCode,
      transportReason: bill.transportReason,
      transactionType: bill.transactionType,
      transportMode: bill.transportMode,
      vehicleNo: bill.vehicleNo,
      transporterId: bill.transporterId,
      transporterName: bill.transporterName,
      transporterDoc: bill.transporterDoc,
      transporterDocDate: bill.transporterDocDate,
      fromPlace: bill.fromPlace,
      toPlace: bill.toPlace,
      items: itemResults && itemResults.length > 0 ? itemResults.map(i => ({ sn: i.sn, hsn: i.hsn, desc: i.description, qty: i.qty, unit: i.unit, val: i.val })) : [
         { sn: '1', hsn: '', desc: 'Total Value', qty: '1', unit: 'Pcs', val: bill.amount }
      ]
    };
    
    generateEWayBillPDF(doc, pdfData);
    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
