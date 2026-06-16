import XLSX from 'xlsx';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Inline the pricing data from constants.js ─────────────────────
const EGGER_GRP_PRICE = { 2:54, 3:64, 4:68, 5:75, 6:80, 7:82, 8:84, 9:91, 10:96 };
const EDGING_COST_PM  = 2.5;
const VAT             = 0.20;
const CUT_EGGER       = 15;
const CUT_MDF         = 7;

const wb = XLSX.utils.book_new();

// ────────────────────────────────────────────────────────────────────
// Helper: write sheet with styled header row
function addSheet(name, headers, rows) {
  const data = [headers, ...rows];
  const ws   = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = headers.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws, name);
}

// ────────────────────────────────────────────────────────────────────
// Sheet 1: Egger MFC Groups & Pricing
addSheet('Egger MFC Pricing',
  ['Price Group', 'Sheet Price (ex VAT)', 'Sheet Price (inc VAT)', 'Sheet Size', 'Cutting Cost (ex VAT)', 'Cutting Cost (inc VAT)'],
  Object.entries(EGGER_GRP_PRICE).map(([grp, price]) => [
    `Group ${grp}`,
    `£${price.toFixed(2)}`,
    `£${(price * (1 + VAT)).toFixed(2)}`,
    '2800 × 2070 mm',
    `£${CUT_EGGER.toFixed(2)}`,
    `£${(CUT_EGGER * (1 + VAT)).toFixed(2)}`,
  ])
);

// ────────────────────────────────────────────────────────────────────
// Sheet 2: Egger PS Gloss & PS Matt & TM
const psRows = [
  ['PS Gloss MDF 19mm', 'W1100 PG', 'Alpine White',   182, (182*(1+VAT)).toFixed(2)],
  ['PS Gloss MDF 19mm', 'U702 PG',  'Cashmere Grey',  182, (182*(1+VAT)).toFixed(2)],
  ['PS Gloss MDF 19mm', 'U708 PG',  'Light Grey',     182, (182*(1+VAT)).toFixed(2)],
  ['PS Gloss MDF 19mm', 'U732 PG',  'Dust Grey',      182, (182*(1+VAT)).toFixed(2)],
  ['PS Gloss MDF 19mm', 'U999 PG',  'Black',          182, (182*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'W1000 PM', 'Premium White',  194, (194*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'W1100 PM', 'Alpine White',   194, (194*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'U399 PM',  'Garnet Red',     194, (194*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'U599 PM',  'Indigo Blue',    194, (194*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'U665 PM',  'Stone Green',    194, (194*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'U702 PM',  'Cashmere Grey',  194, (194*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'U705 PM',  'Angora Grey',    194, (194*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'U708 PM',  'Light Grey',     194, (194*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'U732 PM',  'Dust Grey',      194, (194*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'U767 PM',  'Cubanit Grey',   194, (194*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'U961 PM',  'Graphite Grey',  194, (194*(1+VAT)).toFixed(2)],
  ['PS Matt MDF 19mm',  'U999 PM',  'Black',          194, (194*(1+VAT)).toFixed(2)],
  ['TM MFC (TM/TM12)', 'Various',   'Various',        120, (120*(1+VAT)).toFixed(2)],
  ['TM MFC (TM28)',     'U999 TM28','Black',           139, (139*(1+VAT)).toFixed(2)],
];

addSheet('Egger PS & TM Pricing',
  ['Product', 'Code', 'Colour', 'Sheet Price (ex VAT)', 'Sheet Price (inc VAT)'],
  psRows.map(r => [r[0], r[1], r[2], `£${Number(r[3]).toFixed(2)}`, `£${r[4]}`])
);

// ────────────────────────────────────────────────────────────────────
// Sheet 3: MDF & MR MDF
addSheet('MDF & MR MDF Pricing',
  ['Product', 'Sheet Size', 'Sheet Price (ex VAT)', 'Sheet Price (inc VAT)', 'Cutting Cost (ex VAT)', 'Cutting Cost (inc VAT)'],
  [
    ['MDF 18mm',    '2440×1220mm', 23, (23*(1+VAT)).toFixed(2), CUT_MDF, (CUT_MDF*(1+VAT)).toFixed(2)],
    ['MDF 18mm',    '3050×1220mm', 28, (28*(1+VAT)).toFixed(2), CUT_MDF, (CUT_MDF*(1+VAT)).toFixed(2)],
    ['MDF 12mm',    '2440×1220mm', 20, (20*(1+VAT)).toFixed(2), CUT_MDF, (CUT_MDF*(1+VAT)).toFixed(2)],
    ['MDF 9mm',     '2440×1220mm', 18, (18*(1+VAT)).toFixed(2), CUT_MDF, (CUT_MDF*(1+VAT)).toFixed(2)],
    ['MDF 6mm',     '2440×1220mm', 15, (15*(1+VAT)).toFixed(2), CUT_MDF, (CUT_MDF*(1+VAT)).toFixed(2)],
    ['MR MDF 18mm', '2440×1220mm', 30, (30*(1+VAT)).toFixed(2), CUT_MDF, (CUT_MDF*(1+VAT)).toFixed(2)],
    ['MR MDF 18mm', '3050×1220mm', 36, (36*(1+VAT)).toFixed(2), CUT_MDF, (CUT_MDF*(1+VAT)).toFixed(2)],
    ['MR MDF 12mm', '2440×1220mm', 22, (22*(1+VAT)).toFixed(2), CUT_MDF, (CUT_MDF*(1+VAT)).toFixed(2)],
    ['MR MDF 9mm',  '2440×1220mm', 20, (20*(1+VAT)).toFixed(2), CUT_MDF, (CUT_MDF*(1+VAT)).toFixed(2)],
    ['MR MDF 6mm',  '2440×1220mm', 15, (15*(1+VAT)).toFixed(2), CUT_MDF, (CUT_MDF*(1+VAT)).toFixed(2)],
  ].map(r => [r[0], r[1], `£${Number(r[2]).toFixed(2)}`, `£${r[3]}`, `£${Number(r[4]).toFixed(2)}`, `£${r[5]}`])
);

// ────────────────────────────────────────────────────────────────────
// Sheet 4: Edging & Summary
addSheet('Edging & Service Rates',
  ['Item', 'Rate (ex VAT)', 'Rate (inc VAT)', 'Notes'],
  [
    ['Edgebanding', `£${EDGING_COST_PM.toFixed(2)}/m`, `£${(EDGING_COST_PM*(1+VAT)).toFixed(2)}/m`, '1.1× run applied to estimated length'],
    ['Cutting — Egger MFC (2800×2070)', `£${CUT_EGGER.toFixed(2)}/sheet`, `£${(CUT_EGGER*(1+VAT)).toFixed(2)}/sheet`, 'Per sheet processed'],
    ['Cutting — MDF/MR MDF (any size)', `£${CUT_MDF.toFixed(2)}/sheet`,   `£${(CUT_MDF*(1+VAT)).toFixed(2)}/sheet`,   'Per sheet processed'],
    ['VAT rate', '20%', '', 'All customer prices shown inc VAT'],
  ]
);

// ────────────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, '..', 'public', 'Cutting-Edge-Pricing-Sheet.xlsx');
XLSX.writeFile(wb, outPath);
console.log('Generated:', outPath);
