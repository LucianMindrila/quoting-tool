import { MATERIALS } from './constants.js';

export function generateXLSBase64(breakdown, customerName, jobRef) {
  const XLSX = require('xlsx');

  const wb = XLSX.utils.book_new();

  for (const b of breakdown) {
    const mat = MATERIALS[b.matId];

    const rows = [
      ['Customer', 'Material / Thickness', 'Length (mm)', 'Width (mm)', 'Qty', 'Grain', 'Edging', 'Notes'],
      ...b.pieces.map(p => [
        customerName,
        mat.name,
        p.len,
        p.wid,
        p.qty,
        p.grain ? 'Yes' : 'No',
        p.edging,
        p.notes || '',
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws['!cols'] = [
      { wch: 20 }, { wch: 32 }, { wch: 14 }, { wch: 14 },
      { wch: 8  }, { wch: 10 }, { wch: 18 }, { wch: 28 },
    ];

    const baseName = mat.display.substring(0, 31).replace(/[:\\/?*[\]]/g, '');
    let sheetName = baseName;
    let counter = 2;
    while (wb.SheetNames.includes(sheetName)) {
      const suffix = `_${counter}`;
      sheetName = baseName.substring(0, 31 - suffix.length) + suffix;
      counter++;
    }
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(buffer).toString('base64');
}

export function getXLSFilename(customerName, jobRef) {
  const safe = s => String(s).replace(/[^a-z0-9]/gi, '_');
  return `CuttingList_${safe(jobRef)}_${safe(customerName)}.xlsx`;
}
