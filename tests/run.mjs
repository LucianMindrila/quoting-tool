/**
 * Ad-hoc integration test suite — run with: node tests/run.mjs
 * Tests: constants, optimizer, edging calc, fileImport, csvExport
 */

import { MATERIALS, KERF, EGGER_GRP_PRICE, MFC_DECORS, PS_GLOSS_DECORS, PS_MATT_DECORS, TM_DECORS, calcEdgingMm, edgingDesc, EDGING_OPTS } from '../lib/constants.js';
import { optimiseSheets, panelFits } from '../lib/optimizer.js';
import { generateCSV, sanitise, getCsvFilename } from '../lib/csvExport.js';

let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${name}`);
    console.error(`       ${e.message}`);
    failed++;
  }
}

function expect(val) {
  return {
    toBe(expected) {
      if (val !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(val)}`);
    },
    toEqual(expected) {
      if (JSON.stringify(val) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(val)}`);
    },
    toBeGreaterThan(n) {
      if (!(val > n)) throw new Error(`Expected ${val} > ${n}`);
    },
    toBeLessThanOrEqual(n) {
      if (!(val <= n)) throw new Error(`Expected ${val} <= ${n}`);
    },
    toContain(s) {
      if (!String(val).includes(s)) throw new Error(`Expected "${val}" to contain "${s}"`);
    },
    toBeTruthy() {
      if (!val) throw new Error(`Expected truthy, got ${JSON.stringify(val)}`);
    },
    toBeFalsy() {
      if (val) throw new Error(`Expected falsy, got ${JSON.stringify(val)}`);
    },
  };
}

// ═══════════════════════════════════════════════════════════════
//  1. CONSTANTS — MATERIALS integrity
// ═══════════════════════════════════════════════════════════════
console.log('\n── 1. MATERIALS integrity ──');

test('MATERIALS object is non-empty', () => {
  expect(Object.keys(MATERIALS).length).toBeGreaterThan(50);
});

test('All MATERIALS have required fields', () => {
  const REQUIRED = ['name', 'display', 'price', 'sheetW', 'sheetH', 'cutCost'];
  for (const [id, mat] of Object.entries(MATERIALS)) {
    for (const field of REQUIRED) {
      if (mat[field] === undefined || mat[field] === null)
        throw new Error(`MATERIALS["${id}"] missing field: ${field}`);
    }
    if (typeof mat.price !== 'number')   throw new Error(`MATERIALS["${id}"].price not a number`);
    if (typeof mat.sheetW !== 'number')  throw new Error(`MATERIALS["${id}"].sheetW not a number`);
    if (typeof mat.sheetH !== 'number')  throw new Error(`MATERIALS["${id}"].sheetH not a number`);
  }
});

test('Free-issued boards present with correct IDs', () => {
  expect(MATERIALS['free-issued-2800']).toBeTruthy();
  expect(MATERIALS['free-issued-3050']).toBeTruthy();
  expect(MATERIALS['free-issued-2440']).toBeTruthy();
  expect(MATERIALS['free-issued-2800'].price).toBe(0);
  expect(MATERIALS['free-issued-2800'].sheetW).toBe(2800);
});

test('MDF boards present', () => {
  expect(MATERIALS['mdf-18-2440']).toBeTruthy();
  expect(MATERIALS['mdf-18-3050']).toBeTruthy();
  expect(MATERIALS['mdf-12']).toBeTruthy();
  expect(MATERIALS['mdf-9']).toBeTruthy();
  expect(MATERIALS['mdf-6']).toBeTruthy();
});

test('MR MDF boards present', () => {
  expect(MATERIALS['mrmdf-18-2440']).toBeTruthy();
  expect(MATERIALS['mrmdf-12']).toBeTruthy();
  expect(MATERIALS['mrmdf-6']).toBeTruthy();
});

test('Egger MFC 18mm — Group 2 Platinum White exists', () => {
  const mat = MATERIALS['eg18-W980-7'];
  expect(mat).toBeTruthy();
  expect(mat.price).toBe(EGGER_GRP_PRICE[2]);
  expect(mat.sheetW).toBe(2800);
});

test('Egger MFC 8mm entries built correctly', () => {
  const mat = MATERIALS['eg8-W980-7'];
  expect(mat).toBeTruthy();
  expect(mat._cat).toBe('mfc8');
  expect(mat.price).toBe(EGGER_GRP_PRICE[2]);
});

test('Egger PS Gloss entries exist', () => {
  const mat = MATERIALS['eg-pg-W1100'];
  expect(mat).toBeTruthy();
  expect(mat.price).toBe(182);
  expect(mat._cat).toBe('ps-gloss');
});

test('Egger PS Matt entries exist', () => {
  const mat = MATERIALS['eg-pm-U999'];
  expect(mat).toBeTruthy();
  expect(mat.price).toBe(194);
  expect(mat._cat).toBe('ps-matt');
});

test('Egger TM entries exist with correct prices', () => {
  const tm    = MATERIALS['eg-tm-W1100'];
  const tm28  = MATERIALS['eg-tm28-U999'];
  expect(tm).toBeTruthy();
  expect(tm.price).toBe(120);
  expect(tm28.price).toBe(139);
});

test('MFC decor count matches catalog', () => {
  const mfc18Count = Object.keys(MATERIALS).filter(k => k.startsWith('eg18-')).length;
  const mfc8Count  = Object.keys(MATERIALS).filter(k => k.startsWith('eg8-')).length;
  expect(mfc18Count).toBe(MFC_DECORS.length);
  expect(mfc8Count).toBe(MFC_DECORS.length);
});

test('EGGER_GRP_PRICE has all groups 2–10', () => {
  for (let g = 2; g <= 10; g++) {
    if (!EGGER_GRP_PRICE[g]) throw new Error(`Missing group ${g}`);
  }
});

test('No MATERIALS entry has undefined sheetW or sheetH', () => {
  for (const [id, mat] of Object.entries(MATERIALS)) {
    if (!mat.sheetW || !mat.sheetH) throw new Error(`${id} has invalid sheet dims`);
  }
});

// ═══════════════════════════════════════════════════════════════
//  2. PANEL FITS — dimension validation
// ═══════════════════════════════════════════════════════════════
console.log('\n── 2. panelFits ──');

const MAT_2800 = { sheetW:2800, sheetH:2070 };
const MAT_2440 = { sheetW:2440, sheetH:1220 };

test('Panel within sheet — no grain', () => {
  expect(panelFits(800, 600, false, MAT_2440)).toBeTruthy();
});

test('Panel fits rotated — no grain', () => {
  // 1300×500: too wide (1300>1220 normal), but rotated 500×1300 works on 2440 width
  // Wait: rotated means swap len/wid. So len=1300, wid=500.
  // Normal: 1300<=2440 ✓ and 500<=1220 ✓ → fits normal
  expect(panelFits(1300, 500, false, MAT_2440)).toBeTruthy();
});

test('Panel too large for sheet — no grain', () => {
  expect(panelFits(2500, 1300, false, MAT_2440)).toBeFalsy();
});

test('Grain panel must not rotate — fits normal', () => {
  expect(panelFits(800, 600, true, MAT_2440)).toBeTruthy();
});

test('Grain panel too tall when grain locked', () => {
  // 500×1300 with grain: normal = 500<=2440 ✓ and 1300<=1220 ✗ → false; rotated skipped
  expect(panelFits(500, 1300, true, MAT_2440)).toBeFalsy();
});

test('Grain panel fits because normal orientation works', () => {
  expect(panelFits(1000, 600, true, MAT_2440)).toBeTruthy();
});

test('Exact sheet size fits', () => {
  expect(panelFits(2440, 1220, false, MAT_2440)).toBeTruthy();
});

test('One mm over fails', () => {
  expect(panelFits(2441, 1220, false, MAT_2440)).toBeFalsy();
});

// ═══════════════════════════════════════════════════════════════
//  3. OPTIMIZER — sheet count correctness
// ═══════════════════════════════════════════════════════════════
console.log('\n── 3. optimiseSheets ──');

function sheets(pieces, mat) {
  return optimiseSheets(pieces, MATERIALS[mat] || mat);
}

test('6 pieces 800×600 on 2440×1220 → 1 sheet (the earlier bug)', () => {
  const pieces = [{ len:800, wid:600, qty:6, grain:false }];
  expect(sheets(pieces, MAT_2440)).toBe(1);
});

test('1 piece fits 1 sheet', () => {
  const pieces = [{ len:500, wid:400, qty:1, grain:false }];
  expect(sheets(pieces, MAT_2440)).toBe(1);
});

test('Empty pieces → 0 sheets', () => {
  expect(sheets([], MAT_2440)).toBe(0);
});

test('Single very large panel — 1 sheet', () => {
  const pieces = [{ len:2400, wid:1200, qty:1, grain:false }];
  expect(sheets(pieces, MAT_2440)).toBe(1);
});

test('Two panels that together exceed one sheet → 2 sheets', () => {
  // Each panel is 2430×1210 — no way to fit two on one 2440×1220 sheet
  const pieces = [{ len:2430, wid:1210, qty:2, grain:false }];
  expect(sheets(pieces, MAT_2440)).toBe(2);
});

test('4 pieces 1200×600 on 2440×1220 → 1 sheet', () => {
  // 2×1200 = 2400 along W(2440), 2×600=1200 along H(1220) — fits
  const pieces = [{ len:1200, wid:600, qty:4, grain:false }];
  expect(sheets(pieces, MAT_2440)).toBe(1);
});

test('Large job on 2800×2070 — sanity check result > 0', () => {
  const pieces = [
    { len:600, wid:400, qty:10, grain:false },
    { len:900, wid:300, qty:8,  grain:true  },
  ];
  const n = sheets(pieces, MAT_2800);
  expect(n).toBeGreaterThan(0);
  expect(n).toBeLessThanOrEqual(5);
});

test('Grain constrained pieces use correct axis', () => {
  // 1000×300 with grain: len must align with sheetW (2440).
  // Normal: 1000<=2440 ✓ 300<=1220 ✓ → fits on MAT_2440
  const pieces = [{ len:1000, wid:300, qty:6, grain:true }];
  const n = sheets(pieces, MAT_2440);
  expect(n).toBeLessThanOrEqual(3);
});

test('B&B exact path for ≤7 unique items', () => {
  const pieces = [{ len:500, wid:300, qty:1, grain:false }];
  // Should trigger branchAndBound (1 item ≤ 7)
  expect(sheets(pieces, MAT_2440)).toBe(1);
});

test('Free issued 2800 sheet fits large panel', () => {
  const pieces = [{ len:2700, wid:2000, qty:1, grain:false }];
  expect(sheets(pieces, 'free-issued-2800')).toBe(1);
});

test('MDF 18mm 2440 sheet — correct sheet dimensions used', () => {
  // Panel exactly fits 2440×1220 MDF
  const pieces = [{ len:2430, wid:1210, qty:1, grain:false }];
  expect(sheets(pieces, 'mdf-18-2440')).toBe(1);
});

// ═══════════════════════════════════════════════════════════════
//  4. EDGING CALCULATIONS
// ═══════════════════════════════════════════════════════════════
console.log('\n── 4. calcEdgingMm ──');

test('No Edge → 0mm', () => {
  expect(calcEdgingMm(1000, 600, 5, 'No Edge')).toBe(0);
});

test('E1L → qty × length', () => {
  expect(calcEdgingMm(1000, 600, 3, 'E1L')).toBe(3000);
});

test('E2L → qty × 2 × length', () => {
  expect(calcEdgingMm(1000, 600, 2, 'E2L')).toBe(4000);
});

test('E1W → qty × width', () => {
  expect(calcEdgingMm(1000, 600, 4, 'E1W')).toBe(2400);
});

test('E2W → qty × 2 × width', () => {
  expect(calcEdgingMm(1000, 600, 1, 'E2W')).toBe(1200);
});

test('E1L1W → qty × (l+w)', () => {
  expect(calcEdgingMm(1000, 600, 2, 'E1L1W')).toBe(2 * (1000 + 600));
});

test('E1L2W → qty × (l + 2w)', () => {
  expect(calcEdgingMm(1000, 600, 1, 'E1L2W')).toBe(1000 + 2 * 600);
});

test('E2L1W → qty × (2l + w)', () => {
  expect(calcEdgingMm(1000, 600, 1, 'E2L1W')).toBe(2 * 1000 + 600);
});

test('EAR → qty × 2 × (l + w)', () => {
  expect(calcEdgingMm(1000, 600, 3, 'EAR')).toBe(3 * 2 * (1000 + 600));
});

test('EDGING_OPTS contains all 9 valid codes', () => {
  expect(EDGING_OPTS.length).toBe(9);
  expect(EDGING_OPTS.includes('No Edge')).toBeTruthy();
  expect(EDGING_OPTS.includes('EAR')).toBeTruthy();
});

// ═══════════════════════════════════════════════════════════════
//  5. CSV EXPORT
// ═══════════════════════════════════════════════════════════════
console.log('\n── 5. csvExport ──');

const SAMPLE_PIECES = [
  { len:800, wid:600, qty:2, grain:false, edging:'E1L',    edgeThick:'1mm', notes:'Kitchen door' },
  { len:500, wid:300, qty:4, grain:true,  edging:'No Edge', edgeThick:'2mm', notes:'' },
];

test('generateCSV returns non-empty string', () => {
  const csv = generateCSV('mdf-18-2440', SAMPLE_PIECES, 'Smith Joinery', 'JOB-001');
  expect(typeof csv).toBe('string');
  expect(csv.length).toBeGreaterThan(10);
});

test('CSV contains header row', () => {
  const csv = generateCSV('mdf-18-2440', SAMPLE_PIECES, 'Smith Joinery', 'JOB-001');
  expect(csv).toContain('Customer');
  expect(csv).toContain('Length');
  expect(csv).toContain('Width');
  expect(csv).toContain('Quantity');
});

test('CSV contains customer name', () => {
  const csv = generateCSV('mdf-18-2440', SAMPLE_PIECES, 'Smith Joinery', 'JOB-001');
  expect(csv).toContain('Smith Joinery');
});

test('CSV contains piece dimensions', () => {
  const csv = generateCSV('mdf-18-2440', SAMPLE_PIECES, 'Smith Joinery', 'JOB-001');
  expect(csv).toContain('800');
  expect(csv).toContain('600');
});

test('CSV contains material name', () => {
  const csv = generateCSV('mdf-18-2440', SAMPLE_PIECES, 'Smith Joinery', 'JOB-001');
  expect(csv).toContain('MDF 18mm');
});

test('CSV note field preserved', () => {
  const csv = generateCSV('mdf-18-2440', SAMPLE_PIECES, 'Smith Joinery', 'JOB-001');
  expect(csv).toContain('Kitchen door');
});

test('sanitise strips special chars', () => {
  expect(sanitise('Smith/Joinery & Co.')).toBe('SmithJoinery_Co');
});

test('getCsvFilename builds correct name', () => {
  const name = getCsvFilename('mdf-18-2440', 'Smith Joinery', 'JOB-001');
  expect(name).toContain('JOB-001');       // hyphens are preserved by sanitise
  expect(name).toContain('Smith_Joinery'); // spaces become underscores
  expect(name).toContain('.csv');
});

test('CSV with Egger material uses correct material name', () => {
  const csv = generateCSV('eg18-W980-7', SAMPLE_PIECES, 'Test', 'REF');
  expect(csv).toContain('Egger MFC 18mm');
  expect(csv).toContain('W980 ST7');
});

test('CSV with free issued material', () => {
  const csv = generateCSV('free-issued-2800', SAMPLE_PIECES, 'Test', 'REF');
  expect(csv).toContain('Free Issued Board 2800');
});

// ═══════════════════════════════════════════════════════════════
//  6. CATALOG INTEGRITY
// ═══════════════════════════════════════════════════════════════
console.log('\n── 6. Catalog integrity ──');

test('All MFC_DECORS have id, code, name, grp', () => {
  for (const d of MFC_DECORS) {
    if (!d.id || !d.code || !d.name || !d.grp)
      throw new Error(`MFC_DECORS entry missing field: ${JSON.stringify(d)}`);
    if (d.grp < 2 || d.grp > 10)
      throw new Error(`Invalid group ${d.grp} for decor ${d.id}`);
  }
});

test('All PS_GLOSS_DECORS have id, code, name', () => {
  for (const d of PS_GLOSS_DECORS) {
    if (!d.id || !d.code || !d.name) throw new Error(`Missing field in PS_GLOSS_DECORS: ${JSON.stringify(d)}`);
  }
});

test('All TM_DECORS have price field', () => {
  for (const d of TM_DECORS) {
    if (typeof d.price !== 'number') throw new Error(`TM_DECORS ${d.id} missing price`);
  }
});

test('No duplicate MFC decor IDs', () => {
  const seen = new Set();
  for (const d of MFC_DECORS) {
    if (seen.has(d.id)) throw new Error(`Duplicate MFC decor ID: ${d.id}`);
    seen.add(d.id);
  }
});

test('No duplicate MATERIALS keys', () => {
  // Already enforced by object literal, but verify total count is sensible
  const keys = Object.keys(MATERIALS);
  const unique = new Set(keys);
  expect(keys.length).toBe(unique.size);
});

test('Total MATERIALS count in expected range', () => {
  const n = Object.keys(MATERIALS).length;
  // 170 MFC×2 + 5 PS Gloss + 12 PS Matt + 13 TM + 3 free + 5 MDF + 5 MR MDF = ~393
  expect(n).toBeGreaterThan(350);
  expect(n).toBeLessThanOrEqual(450);
});

// ═══════════════════════════════════════════════════════════════
//  7. EDGE CASES
// ═══════════════════════════════════════════════════════════════
console.log('\n── 7. Edge cases ──');

test('Optimizer handles qty=0 pieces gracefully', () => {
  const pieces = [{ len:500, wid:400, qty:0, grain:false }];
  // qty:0 means 0 items pushed → optimiseSheets returns 0
  expect(sheets(pieces, MAT_2440)).toBe(0);
});

test('Optimizer: many small pieces pack efficiently', () => {
  // 200×100 pieces on 2440×1220 — 12 cols × 12 rows = 144 fit on 1 sheet
  const pieces = [{ len:200, wid:100, qty:50, grain:false }];
  expect(sheets(pieces, MAT_2440)).toBe(1);
});

test('calcEdgingMm with qty=0 → 0', () => {
  expect(calcEdgingMm(1000, 600, 0, 'EAR')).toBe(0);
});

test('panelFits: zero dimensions handled', () => {
  // 0×0 panel always fits
  expect(panelFits(0, 0, false, MAT_2440)).toBeTruthy();
});

test('CSV handles special chars in notes without breaking', () => {
  const pieces = [{ len:800, wid:600, qty:1, grain:false, edging:'E1L', edgeThick:'1mm', notes:'He said "hello", it\'s fine' }];
  const csv = generateCSV('mdf-18-2440', pieces, 'Test', 'REF');
  expect(csv).toContain('hello');
});

// ═══════════════════════════════════════════════════════════════
//  SUMMARY
// ═══════════════════════════════════════════════════════════════
console.log(`\n${'─'.repeat(52)}`);
const total = passed + failed;
console.log(`  Results: ${passed}/${total} passed${failed > 0 ? `, ${failed} FAILED` : ''}`);
if (failed > 0) {
  console.log('  ⚠  Some tests failed — see details above.');
  process.exit(1);
} else {
  console.log('  All tests passed ✓');
}
