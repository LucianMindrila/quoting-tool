/**
 * Generates the downloadable cutting list Excel template.
 * Run with: node scripts/generate-template.mjs
 */

import ExcelJS from 'exceljs';
import {
  MATERIALS,
  MFC_DECORS, PS_GLOSS_DECORS, PS_MATT_DECORS, TM_DECORS,
} from '../lib/constants.js';

// ── Build ordered material name list ─────────────────────────
// Order: MDF → MR MDF → Free Issued → Egger MFC 18mm → 8mm → PS Gloss → PS Matt → TM
const MAT_LIST = [];

const push = (id) => { if (MATERIALS[id]) MAT_LIST.push(MATERIALS[id].name); };

// Plain MDF
['mdf-6','mdf-9','mdf-12','mdf-18-2440','mdf-18-3050'].forEach(push);

// Moisture-Resistant MDF
['mrmdf-6','mrmdf-9','mrmdf-12','mrmdf-18-2440','mrmdf-18-3050'].forEach(push);

// Free Issued
['free-issued-2440','free-issued-2800','free-issued-3050'].forEach(push);

// Egger MFC 18mm (grouped)
MFC_DECORS.forEach(d => push('eg18-' + d.id));

// Egger MFC 8mm (grouped)
MFC_DECORS.forEach(d => push('eg8-' + d.id));

// Egger PS Gloss / PS Matt / TM
PS_GLOSS_DECORS.forEach(d => push('eg-' + d.id));
PS_MATT_DECORS.forEach(d => push('eg-' + d.id));
TM_DECORS.forEach(d => push('eg-' + d.id));

// ── Column definitions ────────────────────────────────────────
const HEADERS = [
  'Customer',
  'Material / Thickness',
  'Length (mm)',
  'Width (mm)',
  'Quantity',
  'Grain (Yes/No)',
  'Edging Detail',
  'Edging Thickness (1mm / 2mm)',
  'Other Information / Notes',
];

const COL_WIDTHS = [22, 38, 14, 14, 10, 14, 20, 28, 30];

const EXAMPLES = [
  ['Smith Joinery', 'Egger MFC 18mm — W980 ST7 Platinum White', 800,  600, 2, 'Yes', 'E1L',     '1mm', 'Kitchen carcass door'],
  ['Smith Joinery', 'Egger MFC 18mm — W980 ST7 Platinum White', 400,  350, 4, 'No',  'EAR',     '2mm', ''],
  ['Smith Joinery', 'MDF 18mm (2440×1220)',                     1200,  400, 1, 'No',  'No Edge', '1mm', 'Shelf — paint grade'],
];

const EDGING_OPTS = ['No Edge','E1L','E2L','E1W','E2W','E1L1W','E1L2W','E2L1W','EAR'];
const GRAIN_OPTS  = ['Yes','No'];
const THICK_OPTS  = ['1mm','2mm'];
const TOTAL_ROWS  = 100;

// ── Workbook ──────────────────────────────────────────────────
const wb = new ExcelJS.Workbook();
wb.creator = 'DT Solutions Ltd';
wb.created = new Date();

// ── Cutting List sheet (MUST be first so the importer reads it) ─
const ws = wb.addWorksheet('Cutting List', {
  views: [{ state: 'frozen', ySplit: 1 }],
});

ws.columns = HEADERS.map((h, i) => ({
  header: h,
  key:    `col${i}`,
  width:  COL_WIDTHS[i],
}));

// Style header row
const headerRow = ws.getRow(1);
headerRow.eachCell(cell => {
  cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
  cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF232323' } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border    = { bottom: { style: 'thin', color: { argb: 'FFF59E0B' } } };
  cell.protection = { locked: true };
});
headerRow.height = 30;

// Example rows — locked, highlighted, marked with hidden EXAMPLE flag in col 10
for (const ex of EXAMPLES) {
  const row = ws.addRow([...ex, 'EXAMPLE']);
  row.eachCell(cell => {
    cell.fill       = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8E7' } };
    cell.font       = { size: 9, italic: true, color: { argb: 'FF92400E' } };
    cell.alignment  = { vertical: 'middle' };
    cell.protection = { locked: true };
  });
}

// Blank editable rows
for (let i = EXAMPLES.length; i < TOTAL_ROWS; i++) {
  const row = ws.addRow(new Array(HEADERS.length).fill(''));
  row.eachCell({ includeEmpty: true }, cell => {
    cell.protection = { locked: false };
  });
}

// Style all data rows (borders + alternating)
for (let r = 2; r <= TOTAL_ROWS + 1; r++) {
  ws.getRow(r).height = 18;
  ws.getRow(r).eachCell({ includeEmpty: true }, (cell, colNum) => {
    if (colNum > HEADERS.length) return;
    cell.border = {
      top:    { style: 'hair', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
      left:   { style: 'hair', color: { argb: 'FFE5E7EB' } },
      right:  { style: 'hair', color: { argb: 'FFE5E7EB' } },
    };
    if (r > EXAMPLES.length + 1 && r % 2 === 0) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } };
    }
  });
}

// ── Hide the EXAMPLE marker column (col 10) ───────────────────
ws.getColumn(10).hidden = true;
ws.getColumn(10).width  = 8;

// ── Sheet protection: example rows locked, data rows open ─────
ws.protect('', {
  selectLockedCells:   true,
  selectUnlockedCells: true,
  insertRows:          true,
  deleteRows:          false,
  sort:                false,
  autoFilter:          false,
  formatCells:         false,
});

// ── Data validations ──────────────────────────────────────────
// Material / Thickness — col B: dropdown from hidden sheet
ws.dataValidations.add(`B2:B${TOTAL_ROWS + 1}`, {
  type:             'list',
  allowBlank:       true,
  showDropDown:     false,
  formulae:         [`'Material List'!$A$1:$A$${MAT_LIST.length}`],
  showErrorMessage: false, // allow free-text too (importer will fuzzy-match)
});

// Grain — col F
ws.dataValidations.add(`F2:F${TOTAL_ROWS + 1}`, {
  type:             'list',
  allowBlank:       true,
  showDropDown:     false,
  formulae:         [`"${GRAIN_OPTS.join(',')}"`],
  showErrorMessage: true,
  errorTitle:       'Invalid value',
  error:            `Please select: ${GRAIN_OPTS.join(', ')}`,
});

// Edging Detail — col G
ws.dataValidations.add(`G2:G${TOTAL_ROWS + 1}`, {
  type:             'list',
  allowBlank:       true,
  showDropDown:     false,
  formulae:         [`"${EDGING_OPTS.join(',')}"`],
  showErrorMessage: true,
  errorTitle:       'Invalid value',
  error:            `Please select: ${EDGING_OPTS.join(', ')}`,
});

// Edging Thickness — col H
ws.dataValidations.add(`H2:H${TOTAL_ROWS + 1}`, {
  type:             'list',
  allowBlank:       true,
  showDropDown:     false,
  formulae:         [`"${THICK_OPTS.join(',')}"`],
  showErrorMessage: true,
  errorTitle:       'Invalid value',
  error:            `Please select: ${THICK_OPTS.join(', ')}`,
});

// Quantity — col E
ws.dataValidations.add(`E2:E${TOTAL_ROWS + 1}`, {
  type:             'whole',
  operator:         'greaterThan',
  allowBlank:       true,
  formulae:         [0],
  showErrorMessage: true,
  errorTitle:       'Invalid quantity',
  error:            'Quantity must be a whole number of 1 or more.',
});

// ── Hidden "Material List" reference sheet (after Cutting List) ─
const wsMat = wb.addWorksheet('Material List');
MAT_LIST.forEach((name, i) => {
  wsMat.getRow(i + 1).getCell(1).value = name;
});
wsMat.state = 'veryHidden';

// ── Instructions sheet ────────────────────────────────────────
const wsI = wb.addWorksheet('Instructions');
wsI.columns = [{ width: 32 }, { width: 52 }, { width: 30 }, { width: 14 }];

const instrData = [
  ['DT Solutions Ltd — Cutting List Template Instructions'],
  [''],
  ['Column', 'Description', 'Example', 'Required?'],
  ['Customer', 'Your company or customer name', 'Smith Joinery', 'Optional'],
  ['Material / Thickness', 'Select from the dropdown — all available boards are listed', 'MDF 18mm (2440×1220)', 'Optional — defaults to Free Issued if blank'],
  ['Length (mm)', 'Panel length in millimetres', '800', 'Yes'],
  ['Width (mm)', 'Panel width in millimetres', '600', 'Yes'],
  ['Quantity', 'Number of identical panels', '4', 'Yes (defaults to 1)'],
  ['Grain (Yes/No)', 'Yes = panel cannot be rotated. Grain runs along the Length axis.', 'Yes', 'Optional'],
  ['Edging Detail', 'Edge profile code. See key below.', 'E1L', 'Optional'],
  ['Edging Thickness (1mm / 2mm)', 'Preferred edge banding thickness', '2mm', 'Optional (defaults to 1mm)'],
  ['Other Information / Notes', 'Any special instructions or decor codes for edging', 'Match decor H3368', 'Optional'],
  [''],
  ['Edging Key'],
  ['No Edge', 'No edging applied'],
  ['E1L', '1 Long edge'],
  ['E2L', '2 Long edges'],
  ['E1W', '1 Width edge'],
  ['E2W', '2 Width edges'],
  ['E1L1W', '1 Long + 1 Width edge'],
  ['E1L2W', '1 Long + 2 Width edges'],
  ['E2L1W', '2 Long + 1 Width edge'],
  ['EAR', 'Edge All Round (all 4 edges)'],
  [''],
  ['Tips'],
  ['• Use the Material dropdown in column B to select your board — this ensures correct pricing'],
  ['• The 3 highlighted rows at the top are examples — they are ignored when you upload'],
  ['• Leave the header row in place — the importer uses it to identify columns'],
  ['• Columns can be in any order — headers are matched automatically'],
  ['• Rows with no Length or Width are ignored'],
];

for (const rowData of instrData) wsI.addRow(rowData);
wsI.getRow(1).getCell(1).font = { bold: true, size: 12 };
wsI.getRow(3).eachCell(c  => { c.font = { bold: true }; });
wsI.getRow(14).getCell(1).font = { bold: true };
wsI.getRow(25).getCell(1).font = { bold: true };

// ── Write file ────────────────────────────────────────────────
const outPath = './public/Template-Master.xlsx';
await wb.xlsx.writeFile(outPath);

console.log(`✓ Template written to ${outPath}`);
console.log(`  Material list: ${MAT_LIST.length} options`);
console.log(`  Data rows: ${TOTAL_ROWS} (${EXAMPLES.length} example + ${TOTAL_ROWS - EXAMPLES.length} blank)`);
console.log(`  Dropdowns: B (Material), F (Grain), G (Edging Detail), H (Edging Thickness)`);
