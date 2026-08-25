const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM eway_bills');
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
    billNumber, amount, status
  ) VALUES (?, ?, ?)`;

  const values = [
    billNumber, amount, status
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
    const [results] = await db.execute('SELECT * FROM eway_bills WHERE id=?', [req.params.id]);
    const bill = results[0];
    if (!bill) return res.status(404).send('E-Way bill not found');

    const itemResults = []; // Table document_items does not exist in DB
    
    const PDFDocument = require('pdfkit');
    const { generateEWayBillPDF } = require('../pdf_generator');
    
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=eway_bill_${bill.billNumber}.pdf`);
    doc.pipe(res);
    
    const pdfData = {
      ewbNo: bill.billNumber,
      generatedDate: bill.docDate,
      validUntil: '',
      supplierGSTIN: bill.supplierGSTIN,
      supplierName: bill.supplierName,
      recipientGSTIN: bill.recipientGSTIN,
      recipientName: bill.recipientName,
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
