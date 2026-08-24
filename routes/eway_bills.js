const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM eway_bills', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/', (req, res) => {
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

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Simple handling of items if provided (just insert all for now, ignoring strict error handling)
    if (items && items.length > 0) {
      items.forEach(item => {
        db.query(`INSERT INTO document_items (document_id, document_type, sn, hsn, description, qty, unit, val) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [result.insertId, 'eway_bill', item.sn||'', item.hsn||'', item.desc||'', item.qty||'', item.unit||'', item.val||'']);
      });
    }

    res.status(201).json({ id: result.insertId, billNumber, amount, status });
  });
});

module.exports = router;

router.get('/:id/pdf', (req, res) => {
  db.query('SELECT * FROM eway_bills WHERE id=?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const bill = results[0];
    if (!bill) return res.status(404).send('E-Way bill not found');

    db.query('SELECT * FROM document_items WHERE document_id=? AND document_type=?', [bill.id, 'eway_bill'], (err2, itemResults) => {
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
    });
  });
});
