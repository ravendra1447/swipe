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
    billNumber, amount, status,
    supplierGSTIN, supplierName, recipientGSTIN, recipientName,
    placeOfDispatch, placeOfDelivery, hsnCode, transportReason,
    transactionType, transportMode, vehicleNo, transporterId,
    transporterName, transporterDoc, transporterDocDate, fromPlace, toPlace,
    items 
  } = req.body;

  const sql = `INSERT INTO eway_bills (
    billNumber, amount, status, supplierGSTIN, supplierName, recipientGSTIN, recipientName,
    placeOfDispatch, placeOfDelivery, hsnCode, transportReason, transactionType, transportMode,
    vehicleNo, transporterId, transporterName, transporterDoc, transporterDocDate, fromPlace, toPlace,
    docNo, docDate, docType
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    billNumber, amount, status, supplierGSTIN||'', supplierName||'', recipientGSTIN||'', recipientName||'',
    placeOfDispatch||'', placeOfDelivery||'', hsnCode||'', transportReason||'', transactionType||'', transportMode||'',
    vehicleNo||'', transporterId||'', transporterName||'', transporterDoc||'', transporterDocDate||'', fromPlace||'', toPlace||'',
    billNumber, new Date().toLocaleDateString(), 'Tax Invoice'
  ];

  try {
    const [result] = await db.execute(sql, values);
    
    if (items && items.length > 0) {
      for (const item of items) {
        await db.execute(`INSERT INTO document_items (document_id, document_type, sn, hsn, description, qty, unit, val) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [result.insertId, 'eway_bill', item.sn||'', item.hsn||'', item.desc||'', item.qty||'', item.unit||'', item.val||'']);
      }
    }

    res.status(201).json({ id: result.insertId, billNumber, amount, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

router.get('/:id/pdf', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM eway_bills WHERE id=?', [req.params.id]);
    const bill = results[0];
    if (!bill) return res.status(404).send('E-Way bill not found');

    const [itemResults] = await db.execute('SELECT * FROM document_items WHERE document_id=? AND document_type=?', [bill.id, 'eway_bill']);
    
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
