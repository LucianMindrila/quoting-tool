import { VAT } from './constants.js';

function safeFilename(s) {
  return String(s).replace(/[^a-z0-9]/gi, '_');
}

export async function generateQuotePDF({
  customerName, customerEmail, jobRef,
  breakdown, grandMat, grandCut, grandEdge,
  showIncVat,
}) {
  const { jsPDF }          = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W    = 210;
  const M    = 14;
  const now  = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const vatMult   = showIncVat ? (1 + VAT) : 1;
  const vatLabel  = showIncVat ? 'inc. VAT' : 'ex. VAT';
  const fmt       = v => `£${(v * vatMult).toFixed(2)}`;
  const grandTotal = (grandMat ?? 0) + (grandCut ?? 0) + (grandEdge ?? 0);

  // ── Header ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(245, 158, 11);
  doc.text('DT Solutions Ltd', M, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(130, 130, 130);
  doc.text('Panel Cutting & Edging Quote', M, 27);

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.text(dateStr, W - M, 20, { align: 'right' });
  doc.text(`Ref: ${jobRef}`, W - M, 26, { align: 'right' });

  // Accent rule
  doc.setDrawColor(245, 158, 11);
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
    doc.setTextColor(10, 10, 10);
    doc.text(b.mat.name, M, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `${b.sheets} sheet${b.sheets !== 1 ? 's' : ''}  ·  ${b.nPieces} panel${b.nPieces !== 1 ? 's' : ''}`,
      W - M, y, { align: 'right' }
    );
    y += 4;

    // Cutting list table
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
      headStyles: { fillColor: [35, 35, 35], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [249, 249, 249] },
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

    // Mini pricing table (right-aligned)
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
          data.cell.styles.fontStyle   = 'bold';
          data.cell.styles.fontSize    = 8.5;
          data.cell.styles.textColor   = [10, 10, 10];
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

  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.line(W - M - 95, y, W - M, y);
  y += 4;

  const totalRows = [
    ['Materials', fmt(grandMat)],
    ['Cutting',   fmt(grandCut)],
    ['Edging',    fmt(grandEdge)],
  ];
  if (!showIncVat) totalRows.push(['VAT (20%)', `£${(grandTotal * VAT).toFixed(2)}`]);
  totalRows.push([`TOTAL (${vatLabel.toUpperCase()})`, fmt(grandTotal)]);

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
        data.cell.styles.textColor = [245, 158, 11];
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
      `DT Solutions Ltd  ·  lucian@dtsolutionsltd.co.uk  ·  Page ${i} of ${pgCount}`,
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
