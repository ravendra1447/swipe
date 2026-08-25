const PDFDocument = require('pdfkit');

function drawBox(doc, x, y, width, height, strokeColor = '#000000', fillColor = null) {
  if (fillColor) {
    doc.rect(x, y, width, height).fillAndStroke(fillColor, strokeColor);
  } else {
    doc.rect(x, y, width, height).stroke(strokeColor);
  }
}

function drawText(doc, text, x, y, width, align = 'left', size = 10, font = 'Helvetica', color = '#000000') {
  if(!text) text = "";
  doc.font(font).fontSize(size).fillColor(color).text(text, x, y, { width, align });
}

function drawLine(doc, x1, y1, x2, y2, color = '#000000', width = 1) {
  doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(width).strokeColor(color).stroke();
}

// =========================================================
// INVOICE / PURCHASE FORMAT (The original Green Tabular Design)
// =========================================================
function generateInvoicePDF(doc, data) {
  const margins = { top: 30, left: 30, right: 30, bottom: 30 };
  const contentWidth = 595.28 - margins.left - margins.right; 
  
  const docNo = data.docNo || data.ewbNo || '';
  const docDate = data.docDate || data.generatedDate || '';
  const supplierGSTIN = data.supplierGSTIN || '';
  const supplierName = data.supplierName || '';
  const recipientGSTIN = data.recipientGSTIN || '';
  const recipientName = data.recipientName || '';
  const placeOfDispatch = data.placeOfDispatch || '';
  const placeOfDelivery = data.placeOfDelivery || '';
  const totalValue = data.totalValue || '0.00';
  const hsnCode = data.hsnCode || '';
  const transportReason = data.transportReason || '';
  const transactionType = data.transactionType || '';
  const transportMode = data.transportMode || '';
  const vehicleNo = data.vehicleNo || '';
  const transporterId = data.transporterId || '';
  const transporterName = data.transporterName || '';
  const transporterDoc = data.transporterDoc || '';
  const transporterDocDate = data.transporterDocDate || '';
  const fromPlace = data.fromPlace || '';
  const toPlace = data.toPlace || '';

  let currentY = margins.top;

  // Header
  // Instead of drawing an empty box for the logo, we just add the Ashok Emblem text properly.
  // Actually, we'll draw a nice styled text block for the National Emblem.
  drawText(doc, 'SATYAMEV JAYATE', margins.left, currentY + 10, 80, 'center', 7, 'Helvetica-Bold');
  drawText(doc, '(Emblem)', margins.left, currentY + 20, 80, 'center', 8, 'Helvetica-Oblique');
  drawText(doc, 'Government of India', margins.left, currentY + 5, contentWidth, 'center', 14, 'Helvetica', '#1e5f30');
  drawText(doc, 'Goods and Services Tax', margins.left, currentY + 25, contentWidth, 'center', 12, 'Helvetica', '#1e5f30');
  drawText(doc, 'TAX INVOICE', margins.left, currentY + 45, contentWidth, 'center', 20, 'Helvetica-Bold', '#1e5f30');
  drawBox(doc, margins.left + contentWidth - 60, currentY, 60, 60, '#000000');
  drawText(doc, 'QR Code', margins.left + contentWidth - 55, currentY + 25, 50, 'center', 8);

  currentY += 90;
  
  // Summary Box
  const box1Height = 40;
  drawBox(doc, margins.left, currentY, contentWidth, box1Height, '#707070');
  drawLine(doc, margins.left + contentWidth / 2, currentY, margins.left + contentWidth / 2, currentY + box1Height, '#707070');
  drawText(doc, 'Document No.', margins.left, currentY + 5, contentWidth / 2, 'center', 10);
  drawText(doc, docNo, margins.left, currentY + 20, contentWidth / 2, 'center', 16, 'Helvetica-Bold');
  drawText(doc, 'Date', margins.left + contentWidth / 2, currentY + 5, contentWidth / 2, 'center', 10);
  drawText(doc, docDate, margins.left + contentWidth / 2, currentY + 22, contentWidth / 2, 'center', 11);
  currentY += box1Height + 10;

  // PART A
  const partAHeight = 150;
  drawBox(doc, margins.left, currentY, contentWidth, partAHeight, '#9dbfa6');
  drawBox(doc, margins.left, currentY, contentWidth, 20, '#9dbfa6', '#e6efe8');
  drawText(doc, 'PART - A : GSTIN & Invoice Details', margins.left + 5, currentY + 5, contentWidth, 'left', 11, 'Helvetica-Bold', '#1e5f30');
  
  let pAY = currentY + 20;
  const col1W = 140, col2W = 120, col3W = 130, col4W = 145;
  drawLine(doc, margins.left, pAY, margins.left + contentWidth, pAY, '#9dbfa6');
  drawLine(doc, margins.left + col1W, pAY, margins.left + col1W, currentY + partAHeight, '#9dbfa6');
  drawLine(doc, margins.left + col1W + col2W, pAY, margins.left + col1W + col2W, currentY + partAHeight, '#9dbfa6');
  drawLine(doc, margins.left + col1W + col2W + col3W, pAY, margins.left + col1W + col2W + col3W, currentY + partAHeight, '#9dbfa6');

  const rowHeight = 21;
  const labelsA = [
    ['1. GSTIN of Supplier', `${supplierGSTIN}\n(${supplierName})`, '1A. GSTIN of Recipient', `${recipientGSTIN}\n(${recipientName})`],
    ['2. Place of Dispatch', placeOfDispatch, '2A. Place of Delivery', placeOfDelivery],
    ['3. Invoice / Bill of Supply', docNo, '3A. Invoice / Bill Date', docDate],
    ['4. Document Type', 'Tax Invoice', '4A. Document No.', docNo],
    ['5. Value of Goods', `Rs. ${totalValue}`, '5A. HSN Code', hsnCode],
    ['6. Reason for Transportation', transportReason, '6A. Transaction Type', transactionType]
  ];

  labelsA.forEach((row, i) => {
    let rY = pAY + (i * rowHeight);
    if(i > 0) drawLine(doc, margins.left, rY, margins.left + contentWidth, rY, '#9dbfa6');
    drawText(doc, row[0], margins.left + 5, rY + 4, col1W - 5, 'left', 9);
    drawText(doc, row[1], margins.left + col1W + 5, rY + 4, col2W - 5, 'left', 9);
    drawText(doc, row[2], margins.left + col1W + col2W + 5, rY + 4, col3W - 5, 'left', 9);
    drawText(doc, row[3], margins.left + col1W + col2W + col3W + 5, rY + 4, col4W - 5, 'left', 9);
  });
  currentY += partAHeight + 10;

  // Item Table
  const items = data.items && data.items.length > 0 ? data.items : [];
  const tableH = 20 + (items.length * 20) + 20;
  drawBox(doc, margins.left, currentY, contentWidth, tableH, '#9dbfa6');
  drawBox(doc, margins.left, currentY, contentWidth, 20, '#9dbfa6', '#e6efe8');
  
  const c1=30, c2=60, c3=210, c4=60, c5=50, c6=125;
  const cw = [0, c1, c1+c2, c1+c2+c3, c1+c2+c3+c4, c1+c2+c3+c4+c5];
  
  drawText(doc, 'S.No.', margins.left, currentY + 5, c1, 'center', 9, 'Helvetica-Bold', '#1e5f30');
  drawText(doc, 'HSN Code', margins.left+cw[1], currentY + 5, c2, 'center', 9, 'Helvetica-Bold', '#1e5f30');
  drawText(doc, 'Product Name / Description', margins.left+cw[2], currentY + 5, c3, 'center', 9, 'Helvetica-Bold', '#1e5f30');
  drawText(doc, 'Qty', margins.left+cw[3], currentY + 5, c4, 'center', 9, 'Helvetica-Bold', '#1e5f30');
  drawText(doc, 'Unit', margins.left+cw[4], currentY + 5, c5, 'center', 9, 'Helvetica-Bold', '#1e5f30');
  drawText(doc, 'Value (Rs.)', margins.left+cw[5], currentY + 5, c6, 'center', 9, 'Helvetica-Bold', '#1e5f30');

  let tY = currentY + 20;
  for (let i = 1; i < cw.length; i++) drawLine(doc, margins.left + cw[i], currentY, margins.left + cw[i], currentY + tableH, '#9dbfa6');

  let runningTotal = 0;
  items.forEach((item, i) => {
    drawLine(doc, margins.left, tY, margins.left + contentWidth, tY, '#9dbfa6');
    drawText(doc, String(i+1), margins.left, tY + 5, c1, 'center', 9, 'Helvetica');
    drawText(doc, item.hsn || '', margins.left+cw[1], tY + 5, c2, 'center', 9);
    drawText(doc, item.desc || item.name || '', margins.left+cw[2], tY + 5, c3, 'center', 9);
    drawText(doc, String(item.qty || '1'), margins.left+cw[3], tY + 5, c4, 'center', 9);
    drawText(doc, item.unit || 'Pcs', margins.left+cw[4], tY + 5, c5, 'center', 9);
    drawText(doc, String(item.val || '0.00'), margins.left+cw[5], tY + 5, c6, 'center', 9);
    let valFloat = parseFloat((item.val || '0').toString().replace(/,/g, ''));
    if(!isNaN(valFloat)) runningTotal += valFloat;
    tY += 20;
  });

  drawLine(doc, margins.left, tY, margins.left + contentWidth, tY, '#9dbfa6');
  drawText(doc, 'Total', margins.left+cw[2], tY + 5, c3, 'center', 10, 'Helvetica-Bold');
  drawText(doc, runningTotal.toFixed(2), margins.left+cw[5], tY + 5, c6, 'center', 10, 'Helvetica-Bold');
  
  tY += 30;
  
  // Bank Details Section
  if (data.bankDetails) {
    drawText(doc, 'Bank Details:', margins.left, tY, contentWidth, 'left', 10, 'Helvetica-Bold', '#1e5f30');
    tY += 15;
    drawText(doc, `Bank Name: ${data.bankDetails.bank_name || '-'}`, margins.left, tY, contentWidth, 'left', 9);
    tY += 15;
    drawText(doc, `Account Name: ${data.bankDetails.account_holder_name || '-'}`, margins.left, tY, contentWidth, 'left', 9);
    tY += 15;
    drawText(doc, `Account No: ${data.bankDetails.account_no || '-'}`, margins.left, tY, contentWidth, 'left', 9);
    tY += 15;
    drawText(doc, `IFSC Code: ${data.bankDetails.ifsc_code || '-'}`, margins.left, tY, contentWidth, 'left', 9);
    
    if (data.bankDetails.upi_id) {
      tY += 15;
      drawText(doc, `UPI ID: ${data.bankDetails.upi_id}`, margins.left, tY, contentWidth, 'left', 9);
    }
  }
}


// =========================================================
// E-WAY BILL FORMAT (The new specific design for e-way bills)
// =========================================================
function generateEWayBillPDF(doc, data) {
  const margins = { top: 30, left: 40, right: 40, bottom: 30 };
  const contentWidth = 595.28 - margins.left - margins.right;
  let currentY = margins.top;

  const supplierDisplay = data.supplierGSTIN ? `${data.supplierGSTIN}, ${data.supplierName || ''}` : '';
  const recipientDisplay = data.recipientGSTIN ? `${data.recipientGSTIN}, ${data.recipientName || ''}` : '';
  const placeDispatchDisplay = `${data.placeOfDispatch || ''}, ${data.fromPlace || ''}`;
  const placeDeliveryDisplay = `${data.placeOfDelivery || ''}, ${data.toPlace || ''}`;

  // --- HEADER ---
  drawText(doc, 'SATYAMEV JAYATE', margins.left, currentY + 10, 80, 'center', 7, 'Helvetica-Bold');
  drawText(doc, '(Emblem)', margins.left, currentY + 20, 80, 'center', 8, 'Helvetica-Oblique');

  drawText(doc, 'E-WAY BILL', margins.left, currentY + 10, contentWidth, 'center', 16, 'Helvetica-Bold');
  drawText(doc, 'E WAY BILL SYSTEM', margins.left, currentY + 28, contentWidth, 'center', 10, 'Helvetica');
  
  drawBox(doc, margins.left + contentWidth - 60, currentY, 60, 40, '#000');
  drawText(doc, '1 NATION\nTAX MARKET', margins.left + contentWidth - 55, currentY + 10, 50, 'center', 8);

  currentY += 60;

  // --- QR CODE ---
  drawText(doc, 'E-way Bill', margins.left, currentY, contentWidth, 'center', 10, 'Helvetica-Bold');
  currentY += 15;
  drawBox(doc, margins.left + (contentWidth / 2) - 45, currentY, 90, 90, '#000');
  drawText(doc, 'QR Code', margins.left, currentY + 40, contentWidth, 'center', 12);
  currentY += 100;
  
  drawText(doc, 'E-way Bill Details', margins.left, currentY, contentWidth, 'center', 10, 'Helvetica-Bold');
  currentY += 20;

  // --- TOP DETAILS LIST ---
  const leftCol = margins.left + 40;
  const rightCol = margins.left + 180;
  const lineH = 18;

  function drawListRow(label, value, isBold = false) {
    drawText(doc, label, leftCol, currentY, 130, 'left', 10, 'Helvetica-Bold', '#555555');
    drawText(doc, value || '-', rightCol, currentY, 300, 'left', 10, isBold ? 'Helvetica-Bold' : 'Helvetica', '#000000');
    currentY += lineH;
  }

  drawListRow('E-Way Bill No:', data.ewbNo, true);
  drawListRow('E-Way Bill Date:', data.generatedDate, true);
  drawListRow('Generated By:', supplierDisplay, true);
  drawListRow('Valid From:', data.generatedDate, true);
  drawListRow('Valid until:', data.validUntil || '-', true);

  currentY += 10;
  drawText(doc, 'PART A', margins.left, currentY, contentWidth, 'center', 10, 'Helvetica');
  currentY += 15;

  // --- PART A LIST ---
  drawListRow('GSTIN of Supplier:', supplierDisplay, true);
  drawListRow('Place of Dispatch:', placeDispatchDisplay, true);
  drawListRow('GSTIN of Recepient:', recipientDisplay, true);
  drawListRow('Place of Delivery:', placeDeliveryDisplay, true);
  drawListRow('Document No.:', data.docNo, true);
  drawListRow('Document Date:', data.docDate, true);
  drawListRow('Transaction Type:', data.transactionType || 'Regular', true);
  drawListRow('Value of Goods:', `Rs. ${data.totalValue || '0.00'}`, true);
  drawListRow('HSN Code:', data.hsnCode, true);
  drawListRow('Reason for Transportation:', data.transportReason || 'Outward - Supply', true);

  currentY += 20;
  drawText(doc, 'PART B Vehicle Details', margins.left, currentY, contentWidth, 'center', 10, 'Helvetica');
  currentY += 15;

  // --- PART B TABLE ---
  const tableTop = currentY;
  const row1H = 30;
  const row2H = 25;
  const tableH = row1H + row2H;

  drawBox(doc, margins.left, tableTop, contentWidth, tableH, '#000'); // Outer border
  drawLine(doc, margins.left, tableTop + row1H, margins.left + contentWidth, tableTop + row1H, '#000');

  const bCols = [0, 40, 130, 180, 260, 360, 430];
  const bHeaders = ['Mode', 'Vehicle /\nTrans Doc No. / Dt.', 'From', 'Entered Date', 'Entered By', 'CEWB No\n(If any)', 'Multi Veh.Info\n(If any)'];
  
  // Draw columns & headers
  for(let i=0; i<bCols.length; i++) {
    const startX = margins.left + bCols[i];
    const width = (i === bCols.length - 1 ? contentWidth : bCols[i+1]) - bCols[i];
    
    // Draw vline (skip index 0)
    if(i > 0) drawLine(doc, startX, tableTop, startX, tableTop + tableH, '#000');
    
    // Header Text
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#333').text(bHeaders[i], startX + 2, tableTop + 4, { width: width - 4, align: 'left' });
  }

  // Row Data
  const rowY = tableTop + row1H + 6;
  const vehString = `${data.vehicleNo || '-'}/\n${data.transporterDocDate || '-'}`;
  
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#000');
  doc.text(data.transportMode || 'Road', margins.left + bCols[0] + 2, rowY, { width: bCols[1] - bCols[0] - 4 });
  doc.text(vehString, margins.left + bCols[1] + 2, rowY - 2, { width: bCols[2] - bCols[1] - 4 });
  doc.text(data.fromPlace || 'Noida', margins.left + bCols[2] + 2, rowY, { width: bCols[3] - bCols[2] - 4 });
  doc.text(data.generatedDate || '-', margins.left + bCols[3] + 2, rowY, { width: bCols[4] - bCols[3] - 4 });
  doc.text(data.supplierGSTIN || '-', margins.left + bCols[4] + 2, rowY, { width: bCols[5] - bCols[4] - 4 });
  doc.text('--', margins.left + bCols[5] + 2, rowY, { width: bCols[6] - bCols[5] - 4 });
  doc.text('--', margins.left + bCols[6] + 2, rowY, { width: contentWidth - bCols[6] - 4 });

  currentY += tableH + 40;

  // --- FOOTER BARCODE ---
  drawBox(doc, margins.left + (contentWidth / 2) - 80, currentY, 160, 30, '#000');
  drawText(doc, '|| |||||||||||||||| |||||| ||', margins.left, currentY + 10, contentWidth, 'center', 14);
  drawText(doc, data.ewbNo || '-', margins.left, currentY + 35, contentWidth, 'center', 10, 'Helvetica-Bold');
  
  currentY += 60;
  
  // Bank Details Section
  if (data.bankDetails) {
    drawText(doc, 'Bank Details:', margins.left, currentY, contentWidth, 'left', 10, 'Helvetica-Bold', '#555555');
    currentY += 15;
    drawText(doc, `Bank Name: ${data.bankDetails.bank_name || '-'}`, margins.left, currentY, contentWidth, 'left', 9);
    currentY += 15;
    drawText(doc, `Account Name: ${data.bankDetails.account_holder_name || '-'}`, margins.left, currentY, contentWidth, 'left', 9);
    currentY += 15;
    drawText(doc, `Account No: ${data.bankDetails.account_no || '-'}`, margins.left, currentY, contentWidth, 'left', 9);
    currentY += 15;
    drawText(doc, `IFSC Code: ${data.bankDetails.ifsc_code || '-'}`, margins.left, currentY, contentWidth, 'left', 9);
  }
}

module.exports = {
  generateInvoicePDF,
  generateEWayBillPDF
};
