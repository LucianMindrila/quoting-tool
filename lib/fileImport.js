import { MATERIALS } from './constants.js';

// ── Normalise helpers ─────────────────────────────────────────
function norm(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ── Fuzzy column header matching ─────────────────────────────
function matchCol(header) {
  const h = norm(String(header));
  if (/^(length|len|lmm|lengthmm|panellength|boardlength|sizel|diml)$/.test(h))  return 'len';
  if (/^(width|wid|wmm|widthmm|panelwidth|boardwidth|sizew|dimw)$/.test(h))       return 'wid';
  if (/^(qty|quantity|count|no|num|number|pcs|pieces|noofpieces|nopieces|amount|nos|qnty)$/.test(h)) return 'qty';
  if (/^(grain|graindirection|grainyesno|grainyn|graindir|hasgrain|grainy|grainrequired|grn)$/.test(h)) return 'grain';
  // edgeThick must come before edging to avoid "edgethickness" matching edging
  if (/^(edgingthickness|edgethickness|edgebandthickness|edgingthickness1mm2mm|edgethick)$/.test(h)) return 'edgeThick';
  if (/^(edging|edge|edgingdetail|edgedetail|edgecode|edgingcode|edgebanding|edgedlength|edgelength|edgedwidth|edgewidth|edgedl|edgel|edgedw|edgew|edginginfo|edgingtype|edgereq|edgingrequired)$/.test(h)) return 'edging';
  if (/^(material|materialthickness|mat|board|boardtype|materialtype|boardname|materialname|product)$/.test(h)) return 'mat';
  if (/^(notes|note|other|otherinformation|info|description|comment|comments|remarks|desc)$/.test(h)) return 'notes';
  return null;
}

// ── Material fuzzy matching ───────────────────────────────────
function resolveMatId(rawName) {
  if (!rawName || String(rawName).trim() === '') return 'free-issued-2800';
  const n = norm(rawName);
  if (!n) return 'free-issued-2800';

  const entries = Object.entries(MATERIALS);

  // 1. Exact normalized name match
  for (const [id, mat] of entries) {
    if (norm(mat.name) === n) return id;
  }

  // 2. Input is a prefix of the material name
  //    e.g. "Egger MFC 18mm W980 ST7" matches "Egger MFC 18mm — W980 ST7 Platinum White"
  for (const [id, mat] of entries) {
    if (norm(mat.name).startsWith(n)) return id;
  }

  // 3. Material name is a prefix of the input (user added extra text)
  for (const [id, mat] of entries) {
    if (n.startsWith(norm(mat.name))) return id;
  }

  // 4. Input contains the full normalized material name
  for (const [id, mat] of entries) {
    const mn = norm(mat.name);
    if (n.includes(mn)) return id;
  }

  // 5. Material name contains the input — pick the longest match to avoid false positives
  let bestId = null;
  let bestLen = 3; // require at least 4 chars matched
  for (const [id, mat] of entries) {
    const mn = norm(mat.name);
    if (mn.includes(n) && n.length > bestLen) {
      bestId = id;
      bestLen = n.length;
    }
  }
  if (bestId) return bestId;

  // 6. Egger decor code match (e.g. user typed "W980 ST7")
  for (const [id, mat] of entries) {
    if (mat._code) {
      const c = norm(mat._code);
      if (n === c || n.includes(c)) return id;
    }
  }

  return 'free-issued-2800';
}

// ── Value normalisers ─────────────────────────────────────────
function normaliseGrain(v) {
  const s = norm(String(v));
  return ['yes','y','1','true','grain','x','yg','gr','grainyes','required'].includes(s) ? 'Yes' : 'No';
}

function normaliseEdging(v) {
  const raw = String(v).trim();
  if (!raw || raw === '-') return 'No Edge';

  const s = raw.toUpperCase().replace(/\s+/g,'').replace(/[^A-Z0-9]/g,'');

  const valid = ['No Edge','E1L','E2L','E1W','E2W','E1L1W','E1L2W','E2L1W','EAR'];
  for (const opt of valid) {
    if (opt.replace(/\s+/g,'').toUpperCase() === s) return opt;
  }

  const map = [
    [/^(NOEDGE|NONE|NO|N|NOEDGING|UNEDGED|-)$/,        'No Edge'],
    [/^(1LONG|ONELONG|1L|1LONGEDGE|E1L|1LE)$/,          'E1L'],
    [/^(2LONG|TWOLONG|2L|2LONGEDGE|E2L|2LE)$/,          'E2L'],
    [/^(1WIDE|ONEWIDE|1W|1WIDTH|1WIDTHEDGE|E1W|1WE)$/,  'E1W'],
    [/^(2WIDE|TWOWIDE|2W|2WIDTH|2WIDTHEDGE|E2W|2WE)$/,  'E2W'],
    [/^(1LONG1WIDE|1L1W|E1L1W|ONELONGONESWIDE)$/,       'E1L1W'],
    [/^(1LONG2WIDE|1L2W|E1L2W)$/,                       'E1L2W'],
    [/^(2LONG1WIDE|2L1W|E2L1W)$/,                       'E2L1W'],
    [/^(EAR|ALLROUND|ALL|ALLEDGES|ALLSIDES|4SIDES|4S|ALLROUND4|AROUND)$/, 'EAR'],
  ];

  for (const [re, code] of map) {
    if (re.test(s)) return code;
  }

  return 'No Edge';
}

function normaliseEdgeThick(v) {
  const s = norm(String(v));
  return s === '2' || s === '2mm' ? '2mm' : '1mm';
}

// ── Workbook parser ───────────────────────────────────────────
function parseWorkbook(wb, XLSX) {
  const ws  = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  if (raw.length < 2) return [];

  let headerRowIdx = 0;
  let colMap = {};

  for (let ri = 0; ri < Math.min(5, raw.length); ri++) {
    const map = {};
    let hits = 0;
    raw[ri].forEach((cell, ci) => {
      const key = matchCol(cell);
      if (key && !map[key]) { map[key] = ci; hits++; }
    });
    if (hits >= 2) { colMap = map; headerRowIdx = ri; break; }
  }

  const hasHeader = Object.keys(colMap).length >= 2;
  const dataStart = hasHeader ? headerRowIdx + 1 : 0;

  const results = [];
  for (let ri = dataStart; ri < raw.length; ri++) {
    const row = raw[ri];
    if (row.every(c => c === '' || c === null || c === undefined)) continue;

    // Skip template example rows (marked with 'EXAMPLE' in a hidden column)
    if (row.some(cell => String(cell).trim() === 'EXAMPLE')) continue;

    let len, wid, qty, grain, edging, edgeThick, notes, matRaw;

    if (hasHeader) {
      len       = parseFloat(row[colMap.len]);
      wid       = parseFloat(row[colMap.wid]);
      qty       = parseInt(row[colMap.qty])    || 1;
      grain     = colMap.grain     !== undefined ? normaliseGrain(row[colMap.grain])       : 'No';
      edging    = colMap.edging    !== undefined ? normaliseEdging(row[colMap.edging])     : 'No Edge';
      edgeThick = colMap.edgeThick !== undefined ? normaliseEdgeThick(row[colMap.edgeThick]) : '1mm';
      notes     = colMap.notes     !== undefined ? String(row[colMap.notes]).trim()        : '';
      matRaw    = colMap.mat       !== undefined ? String(row[colMap.mat]).trim()          : '';
    } else {
      // Positional fallback: Length, Width, Qty, Grain, Edging, Notes
      len       = parseFloat(row[0]);
      wid       = parseFloat(row[1]);
      qty       = parseInt(row[2])    || 1;
      grain     = row[3] !== undefined ? normaliseGrain(row[3])   : 'No';
      edging    = row[4] !== undefined ? normaliseEdging(row[4])  : 'No Edge';
      edgeThick = '1mm';
      notes     = row[5] !== undefined ? String(row[5]).trim()    : '';
      matRaw    = '';
    }

    if (!len || !wid || isNaN(len) || isNaN(wid)) continue;

    results.push({
      matId: resolveMatId(matRaw),
      len: String(len), wid: String(wid),
      qty, grain, edging, edgeThick, notes,
    });
  }

  return results;
}

export function processFile(file, onRows, onError) {
  if (!file) return;
  const ext    = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const xlsxMod = await import('xlsx');
      const XLSX    = xlsxMod.default ?? xlsxMod;

      const wb = XLSX.read(
        ext === 'csv' ? e.target.result : new Uint8Array(e.target.result),
        { type: ext === 'csv' ? 'string' : 'array' },
      );

      onRows(parseWorkbook(wb, XLSX));
    } catch (err) {
      console.error('[fileImport] failed to parse file:', err);
      onError(err);
    }
  };

  if (ext === 'csv') reader.readAsText(file);
  else               reader.readAsArrayBuffer(file);
}
