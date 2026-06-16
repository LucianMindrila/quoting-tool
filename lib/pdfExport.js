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
  breakdown, grandMat, grandCut, grandEdge,
}) {
  const { jsPDF }           = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W    = 210;
  const M    = 14;
  const now  = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const invoiceNum = `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;

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

  // INVOICE badge
  doc.setFillColor(...TEAL);
  doc.roundedRect(W - M - 36, 13, 36, 10, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', W - M - 18, 19.5, { align: 'center' });

  doc.setTextColor(...DARK);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${invoiceNum}`, W - M, 28, { align: 'right' });
  doc.text(`Date: ${dateStr}`, W - M, 33.5, { align: 'right' });
  doc.text(`Ref: ${jobRef}`, W - M, 39, { align: 'right' });

  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.8);
  doc.line(M, 33, W - M - 55, 33);

  // ── FROM / TO ────────────────────────────────────────────────────
  let y = 40;

  // FROM label
  doc.setFillColor(...TEAL);
  doc.rect(M, y, 85, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('FROM', M + 2, y + 3.5);

  // TO label
  doc.rect(M + 95, y, 85, 5, 'F');
  doc.text('TO', M + 97, y + 3.5);

  y += 7;
  const fromLines = ['Cutting Edge', 'cuttingedgebespoke@gmail.com', '07837 665918'];
  const toLines   = [customerName, customerEmail, ''];

  doc.setFontSize(8.5);
  for (let i = 0; i < fromLines.length; i++) {
    doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
    doc.setTextColor(...DARK);
    doc.text(fromLines[i], M, y + i * 5);
    doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
    doc.text(toLines[i] || '', M + 95, y + i * 5);
  }

  y += 20;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.2);
  doc.line(M, y, W - M, y);
  y += 7;

  // ── Per material breakdown ────────────────────────────────────────
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
        i + 1, p.len, p.wid, p.qty,
        p.grain ? 'Yes' : 'No', p.edging, p.notes || '',
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
      doc.addPage(); y = 20;
    }
  }

  // ── Grand total ───────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }

  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.5);
  doc.line(W - M - 95, y, W - M, y);
  y += 4;

  const totalRows = [
    ['Materials', fmt(grandMat)],
    ['Cutting',   fmt(grandCut)],
    ['Edging',    fmt(grandEdge)],
    ['TOTAL',     fmt(grandTotal)],
  ];

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

  y = doc.lastAutoTable.finalY + 6;

  // ── No VAT note ───────────────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...MUTED);
  doc.text('No VAT charged — Cutting Edge is not VAT registered.', W - M, y, { align: 'right' });
  y += 10;

  // ── Bank details box ──────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20; }

  doc.setFillColor(...TEAL);
  doc.rect(M, y, W - M * 2, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PAYMENT DETAILS', M + 3, y + 4);
  y += 6;

  const bankLines = [
    ['Account Name',     'Lucian Mindrila'],
    ['Sort Code',        '60-83-71'],
    ['Account Number',   '17848872'],
    ['Payment Reference', jobRef],
    ['Due',              'Upon collection / delivery'],
  ];

  doc.setFillColor(232, 245, 241);
  doc.rect(M, y, W - M * 2, bankLines.length * 5.5, 'F');

  doc.setFontSize(8);
  for (let i = 0; i < bankLines.length; i++) {
    const ry = y + 4 + i * 5.5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MUTED);
    doc.text(bankLines[i][0], M + 3, ry);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(bankLines[i][1], M + 55, ry);
  }

  y += bankLines.length * 5.5 + 8;

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
