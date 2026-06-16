import { VAT } from './constants.js';

const TEAL    = [15, 110, 86];
const TEAL_MID = [29, 158, 117];
const DARK    = [10, 10, 10];
const MUTED   = [120, 120, 120];

function safeFilename(s) {
  return String(s).replace(/[^a-z0-9]/gi, '_');
}

export async function generateQuotePDF({
  customerName, customerEmail, jobRef,
  breakdown, grandMat, grandCut, grandEdge,
}) {
  const { jsPDF }           = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W    = 210;
  const M    = 14;
  const now  = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const fmt = v => `£${Number(v).toFixed(2)}`;
  const grandTotal = (grandMat ?? 0) + (grandCut ?? 0) + (grandEdge ?? 0);

  // ── Header ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...TEAL);
  doc.text('Cutting Edge', M, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text('Bespoke Panel Processing', M, 27);

  doc.setTextColor(...DARK);
  doc.setFontSize(9);
  doc.text(dateStr, W - M, 20, { align: 'right' });
  doc.text(`Ref: ${jobRef}`, W - M, 26, { align: 'right' });

  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.8);
  doc.line(M, 31, W - M, 31);

  // ── Job details ──────────────────────────────────────────────────
  let y = 38;
  const details = [
    ['Customer:', customerName],
    ['Email:', customerEmail],
    ['Job Reference:', jobRef],
  ];
  doc.setFontSize(9);
  for (const [label, val] of details) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(110, 110, 110);
    doc.text(label, M, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(String(val), M + 30, y);
    y += 5.5;
  }

  y += 2;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.2);
  doc.line(M, y, W - M, y);
  y += 7;

  // ── Per material breakdown ───────────────────────────────────────
  for (const b of breakdown) {
    const sub = b.matCost + b.cutCost + b.edgeCost;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    doc.text(b.mat.name, M, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `${b.sheets} sheet${b.sheets !== 1 ? 's' : ''}  ·  ${b.nPieces} panel${b.nPieces !== 1 ? 's' : ''}`,
      W - M, y, { align: 'right' }
    );
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['#', 'Length (mm)', 'Width (mm)', 'Qty', 'Grain', 'Edging', 'Notes']],
      body: b.pieces.map((p, i) => [
        i + 1,
        p.len, p.wid, p.qty,
        p.grain ? 'Yes' : 'No',
        p.edging,
        p.notes || '',
      ]),
      styles: { fontSize: 7.5, cellPadding: 1.8, textColor: 40 },
      headStyles: { fillColor: TEAL, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [240, 249, 245] },
      columnStyles: {
        0: { cellWidth: 8,  halign: 'center' },
        1: { cellWidth: 24, halign: 'right'  },
        2: { cellWidth: 24, halign: 'right'  },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 14, halign: 'center' },
        5: { cellWidth: 22, halign: 'center' },
        6: { cellWidth: 'auto' },
      },
      theme: 'grid',
    });

    y = doc.lastAutoTable.finalY + 2;

    autoTable(doc, {
      startY: y,
      margin: { left: W - M - 95, right: M },
      tableWidth: 95,
      body: [
        [`Material (${b.sheets} × ${fmt(b.mat.price)})`, fmt(b.matCost)],
        [`Cutting (${b.sheets} sheet${b.sheets !== 1 ? 's' : ''})`, fmt(b.cutCost)],
        [`Edging (${b.edgingM} m)`, fmt(b.edgeCost)],
        ['Subtotal', fmt(sub)],
      ],
      styles: { fontSize: 8, cellPadding: 1.8, textColor: 60 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 65 },
        1: { halign: 'right',   cellWidth: 30 },
      },
      theme: 'plain',
      didParseCell(data) {
        if (data.row.index === 3) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize  = 8.5;
          data.cell.styles.textColor = DARK;
        }
      },
    });

    y = doc.lastAutoTable.finalY + 8;

    if (y > 255 && breakdown.indexOf(b) < breakdown.length - 1) {
      doc.addPage();
      y = 20;
    }
  }

  // ── Grand total ──────────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20; }

  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.5);
  doc.line(W - M - 95, y, W - M, y);
  y += 4;

  const totalRows = [
    ['Materials', fmt(grandMat)],
    ['Cutting',   fmt(grandCut)],
    ['Edging',    fmt(grandEdge)],
  ];
  totalRows.push(['TOTAL', fmt(grandTotal)]);

  autoTable(doc, {
    startY: y,
    margin: { left: W - M - 95, right: M },
    tableWidth: 95,
    body: totalRows,
    styles: { fontSize: 9, cellPadding: 2.2, textColor: 60 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { halign: 'right',   cellWidth: 30 },
    },
    theme: 'plain',
    didParseCell(data) {
      if (data.row.index === totalRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize  = 11;
        data.cell.styles.textColor = TEAL;
      }
    },
  });

  // ── Footer on every page ─────────────────────────────────────────
  const pgCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pgCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Cutting Edge  ·  cuttingedgebespoke@gmail.com  ·  Page ${i} of ${pgCount}`,
      W / 2, 291, { align: 'center' }
    );
  }

  return doc;
}

export async function downloadQuotePDF(params) {
  const doc = await generateQuotePDF(params);
  doc.save(`Quote_${safeFilename(params.jobRef)}_${safeFilename(params.customerName)}.pdf`);
}

export async function getQuotePDFBase64(params) {
  const doc = await generateQuotePDF(params);
  return doc.output('datauristring').split(',')[1];
}

export async function generateInvoicePDF({
  customerName, customerEmail, jobRef,
  breakdown, grandMat, grandCut, grandEdge, fulfilment,
}) {
  const { jsPDF }              = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W    = 210;
  const M    = 14;
  const now  = new Date();
  const dateStr    = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const invoiceNum = `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;

  const fmt        = v  => `£${Number(v).toFixed(2)}`;
  const grandTotal = (grandMat ?? 0) + (grandCut ?? 0) + (grandEdge ?? 0);

  // ── Header ────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...TEAL);
  doc.text('Cutting Edge', M, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text('Bespoke Panel Processing', M, 27);

  // INVOICE badge (top right)
  doc.setFillColor(...TEAL);
  doc.roundedRect(W - M - 38, 12, 38, 11, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', W - M - 19, 19.5, { align: 'center' });

  // Invoice meta (below badge)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text(`Invoice No: ${invoiceNum}`, W - M, 28.5, { align: 'right' });
  doc.text(`Date: ${dateStr}`,           W - M, 33.5, { align: 'right' });
  doc.text(`Ref: ${jobRef}`,             W - M, 38.5, { align: 'right' });

  // Teal rule
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.8);
  doc.line(M, 32, W - M - 55, 32);

  // ── FROM / TO blocks ─────────────────────────────────────────────
  const colW = (W - M * 2 - 6) / 2;   // width of each block
  const fromX = M;
  const toX   = M + colW + 6;
  let y = 40;

  // Label bars
  doc.setFillColor(...TEAL);
  doc.rect(fromX, y, colW, 5.5, 'F');
  doc.rect(toX,   y, colW, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('FROM', fromX + 3, y + 3.8);
  doc.text('TO',   toX   + 3, y + 3.8);
  y += 5.5;

  // Content rows
  const fromLines = [
    { label: null, value: 'Cutting Edge', bold: true  },
    { label: null, value: 'cuttingedgebespoke@gmail.com' },
    { label: null, value: '07837 665918' },
  ];
  const toLines = [
    { label: null, value: customerName,  bold: true  },
    { label: null, value: customerEmail },
  ];
  const maxRows = Math.max(fromLines.length, toLines.length);

  doc.setFillColor(240, 249, 245);
  doc.rect(fromX, y, colW, maxRows * 6, 'F');
  doc.rect(toX,   y, colW, maxRows * 6, 'F');

  doc.setFontSize(8.5);
  for (let i = 0; i < maxRows; i++) {
    const ry = y + 4.5 + i * 6;
    if (fromLines[i]) {
      doc.setFont('helvetica', fromLines[i].bold ? 'bold' : 'normal');
      doc.setTextColor(...DARK);
      doc.text(fromLines[i].value, fromX + 3, ry);
    }
    if (toLines[i]) {
      doc.setFont('helvetica', toLines[i].bold ? 'bold' : 'normal');
      doc.setTextColor(...DARK);
      doc.text(toLines[i].value, toX + 3, ry);
    }
  }

  y += maxRows * 6 + 6;

  // ── Fulfilment row ────────────────────────────────────────────────
  if (fulfilment?.type) {
    const f = fulfilment;
    const label = f.type === 'delivery' ? 'Delivery' : 'Collection';
    const addrStr = f.type === 'delivery' && f.address
      ? [f.address.name, f.address.line1, f.address.line2, f.address.postcode].filter(Boolean).join(', ')
      : null;

    doc.setFillColor(232, 245, 241);
    doc.rect(M, y, W - M * 2, addrStr ? 15 : 9, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${label} Date:`, M + 3, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(`${f.date}  at  ${f.time}`, M + 35, y + 5.5);

    if (addrStr) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...MUTED);
      doc.text('Delivery Address:', M + 3, y + 11.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...DARK);
      doc.text(addrStr, M + 35, y + 11.5);
    }

    y += (addrStr ? 15 : 9) + 8;
  } else {
    y += 8;
  }

  // ── Compact line-item summary table ──────────────────────────────
  // One row per charge type per material — no panel dimensions
  const tableBody = [];
  for (const b of breakdown) {
    const matName = b.mat.name.split('—')[0].trim();
    tableBody.push([
      `${matName}`,
      `${b.sheets} sheet${b.sheets !== 1 ? 's' : ''} × ${fmt(b.mat.price)}`,
      fmt(b.matCost),
    ]);
    tableBody.push([
      `  Cutting`,
      `${b.sheets} sheet${b.sheets !== 1 ? 's' : ''} × ${fmt(b.mat.cutCost)}`,
      fmt(b.cutCost),
    ]);
    if (b.edgeCost > 0) {
      tableBody.push([
        `  Edging`,
        `${b.edgingM} m × £3.00/m`,
        fmt(b.edgeCost),
      ]);
    }
  }

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [['Description', 'Detail', 'Amount']],
    body: tableBody,
    styles:     { fontSize: 8.5, cellPadding: 2.5, textColor: 40 },
    headStyles: { fillColor: TEAL, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: [247, 252, 250] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 60, textColor: MUTED },
      2: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    theme: 'grid',
    didParseCell(data) {
      // Bold the material name rows (not the indented cutting/edging lines)
      if (data.section === 'body' && !String(data.cell.raw).startsWith('  ')) {
        if (data.column.index === 0) data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── Totals ────────────────────────────────────────────────────────
  const totalRows = [
    ['Materials', fmt(grandMat)],
    ['Cutting',   fmt(grandCut)],
    ['Edging',    fmt(grandEdge)],
    ['TOTAL',     fmt(grandTotal)],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: W - M - 80, right: M },
    tableWidth: 80,
    body: totalRows,
    styles: { fontSize: 9, cellPadding: 2.2, textColor: 60 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 52 },
      1: { halign: 'right',   cellWidth: 28 },
    },
    theme: 'plain',
    didParseCell(data) {
      if (data.row.index === totalRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize  = 11;
        data.cell.styles.textColor = TEAL;
      }
    },
  });

  y = doc.lastAutoTable.finalY + 5;

  // No VAT note
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...MUTED);
  doc.text('No VAT charged — Cutting Edge is not VAT registered.', W - M, y, { align: 'right' });
  y += 10;

  // ── Bank details ──────────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20; }

  doc.setFillColor(...TEAL);
  doc.rect(M, y, W - M * 2, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PAYMENT DETAILS', M + 3, y + 4);
  y += 6;

  const bankLines = [
    ['Account Name',      'Lucian Mindrila'],
    ['Sort Code',         '60-83-71'],
    ['Account Number',    '17848872'],
    ['Payment Reference', jobRef],
    ['Due',               'Upon collection / delivery'],
  ];

  doc.setFillColor(232, 245, 241);
  doc.rect(M, y, W - M * 2, bankLines.length * 5.8, 'F');

  doc.setFontSize(8.5);
  for (let i = 0; i < bankLines.length; i++) {
    const ry = y + 4.5 + i * 5.8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MUTED);
    doc.text(bankLines[i][0], M + 3, ry);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(bankLines[i][1], M + 52, ry);
  }

  // ── Footer on every page ──────────────────────────────────────────
  const pgCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pgCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Cutting Edge  ·  cuttingedgebespoke@gmail.com  ·  Page ${i} of ${pgCount}`,
      W / 2, 291, { align: 'center' }
    );
  }

  return doc;
}

export async function getInvoicePDFBase64(params) {
  const doc = await generateInvoicePDF(params);
  return doc.output('datauristring').split(',')[1];
}
