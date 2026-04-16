// Fuzzy column header matching
function matchCol(header) {
  const h = String(header).toLowerCase().replace(/[^a-z0-9]/g,'');
  if (/^(length|len|lmm|lengthmm|panellength|boardlength|sizel|diml)$/.test(h))  return 'len';
  if (/^(width|wid|wmm|widthmm|panelwidth|boardwidth|sizew|dimw)$/.test(h))       return 'wid';
  if (/^(qty|quantity|count|no|num|number|pcs|pieces|noofpieces|nopieces|amount|nos|qnty)$/.test(h)) return 'qty';
  if (/^(grain|graindirection|grainyesno|grainyn|graindir|hasgrain|grainy|grainrequired|grn)$/.test(h)) return 'grain';
  if (/^(edging|edge|edgingdetail|edgedetail|edgecode|edgingcode|edgebanding|edgedlength|edgelength|edgedwidth|edgewidth|edgedl|edgel|edgedw|edgew|edginginfo|edgingtype|edgereq|edgingrequired)$/.test(h)) return 'edging';
  if (/^(notes|note|other|otherinformation|info|description|comment|comments|remarks|desc)$/.test(h)) return 'notes';
  return null;
}

function normaliseGrain(v) {
  const s = String(v).trim().toLowerCase().replace(/[^a-z0-9]/g,'');
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

export function parseWorkbook(wb) {
  const ws  = wb.Sheets[wb.SheetNames[0]];
  const raw = wb.utils
    ? wb.utils.sheet_to_json(ws, { header:1, defval:'' })
    : (() => { throw new Error('XLSX utils not available'); })();

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

    let len, wid, qty, grain, edging, notes;

    if (hasHeader) {
      len    = parseFloat(row[colMap.len]);
      wid    = parseFloat(row[colMap.wid]);
      qty    = parseInt(row[colMap.qty])  || 1;
      grain  = colMap.grain   !== undefined ? normaliseGrain(row[colMap.grain])   : 'No';
      edging = colMap.edging  !== undefined ? normaliseEdging(row[colMap.edging]) : 'No Edge';
      notes  = colMap.notes   !== undefined ? String(row[colMap.notes]).trim()     : '';
    } else {
      len    = parseFloat(row[0]);
      wid    = parseFloat(row[1]);
      qty    = parseInt(row[2])  || 1;
      grain  = row[3] !== undefined ? normaliseGrain(row[3])   : 'No';
      edging = row[4] !== undefined ? normaliseEdging(row[4])  : 'No Edge';
      notes  = row[5] !== undefined ? String(row[5]).trim()     : '';
    }

    if (!len || !wid || isNaN(len) || isNaN(wid)) continue;

    results.push({
      matId: 'free-issued-2800',
      len: String(len), wid: String(wid),
      qty, grain, edging, notes,
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
      const XLSX = (await import('xlsx')).default;
      let wb;
      if (ext === 'csv') {
        wb = XLSX.read(e.target.result, { type:'string' });
      } else {
        wb = XLSX.read(new Uint8Array(e.target.result), { type:'array' });
      }
      // Attach utils so parseWorkbook can use them
      wb.utils = XLSX.utils;
      onRows(parseWorkbook(wb));
    } catch (err) {
      onError(err);
    }
  };

  if (ext === 'csv') reader.readAsText(file);
  else               reader.readAsArrayBuffer(file);
}
