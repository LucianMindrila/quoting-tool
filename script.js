// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const KERF           = 5;
const EDGE_DIST      = 2;
const EDGING_COST_PM = 2.5;
const VAT            = 0.20;

const MATERIALS = {
  'free-issued-2800':      { name:'Free Issued Board 2800×2070mm',   price:0,   sheetW:2800, sheetH:2070, cutCost:15 },
  'free-issued-3050':      { name:'Free Issued Board 3050×1220mm',   price:0,   sheetW:3050, sheetH:1220, cutCost:7  },
  'free-issued-2440':      { name:'Free Issued Board 2440×1220mm',   price:0,   sheetW:2440, sheetH:1220, cutCost:7  },
  'egger-mfc-18-white':    { name:'Egger MFC 18mm — White (W980)',   price:55,  sheetW:2800, sheetH:2070, cutCost:15 },
  'egger-mfc-18-plain':    { name:'Egger MFC 18mm — Plain Colour',   price:80,  sheetW:2800, sheetH:2070, cutCost:15 },
  'egger-mfc-18-woodgrain':{ name:'Egger MFC 18mm — Woodgrain',      price:95,  sheetW:2800, sheetH:2070, cutCost:15 },
  'egger-mfmdf-19':        { name:'Egger MFMDF 19mm PM Range',       price:150, sheetW:2800, sheetH:2070, cutCost:15 },
  'egger-mfc-8':           { name:'Egger MFC 8mm',                   price:60,  sheetW:2800, sheetH:2070, cutCost:15 },
  'mdf-18-2440':           { name:'MDF 18mm (2440×1220)',             price:23,  sheetW:2440, sheetH:1220, cutCost:7  },
  'mdf-18-3050':           { name:'MDF 18mm (3050×1220)',             price:28,  sheetW:3050, sheetH:1220, cutCost:7  },
  'mdf-12':                { name:'MDF 12mm (2440×1220)',             price:20,  sheetW:2440, sheetH:1220, cutCost:7  },
  'mdf-9':                 { name:'MDF 9mm (2440×1220)',              price:18,  sheetW:2440, sheetH:1220, cutCost:7  },
  'mdf-6':                 { name:'MDF 6mm (2440×1220)',              price:15,  sheetW:2440, sheetH:1220, cutCost:7  },
  'mrmdf-18-2440':         { name:'MR MDF 18mm (2440×1220)',          price:30,  sheetW:2440, sheetH:1220, cutCost:7  },
  'mrmdf-18-3050':         { name:'MR MDF 18mm (3050×1220)',          price:36,  sheetW:3050, sheetH:1220, cutCost:7  },
  'mrmdf-12':              { name:'MR MDF 12mm (2440×1220)',          price:22,  sheetW:2440, sheetH:1220, cutCost:7  },
  'mrmdf-9':               { name:'MR MDF 9mm (2440×1220)',           price:20,  sheetW:2440, sheetH:1220, cutCost:7  },
  'mrmdf-6':               { name:'MR MDF 6mm (2440×1220)',           price:15,  sheetW:2440, sheetH:1220, cutCost:7  },
};

const EDGING_OPTS = ['No Edge','E1L','E2L','E1W','E2W','E1L1W','E1L2W','E2L1W','EAR'];

let showIncVat = false;
let rowCount   = 0;

// ═══════════════════════════════════════════════════════════════
//  DIMENSION VALIDATION
// ═══════════════════════════════════════════════════════════════

// Returns true if the panel can physically fit in the sheet
// grain=true: Length MUST align with sheetW (no rotation)
// grain=false: either orientation is acceptable
function panelFits(len, wid, grain, mat) {
  const normal  = len <= mat.sheetW && wid <= mat.sheetH;
  const rotated = !grain && wid <= mat.sheetW && len <= mat.sheetH;
  return normal || rotated;
}

// Scans all parsed rows, marks error rows in DOM, returns array of errors
function validateDimensions(rows) {
  // Clear all previous error marks
  document.querySelectorAll('#tableBody tr').forEach(tr => {
    tr.classList.remove('dim-error');
    tr.querySelectorAll('.dim-error-badge').forEach(b => b.remove());
  });

  const errors = [];
  const trs    = document.querySelectorAll('#tableBody tr');
  let  trIdx   = 0;   // index into visible rows (only complete rows add to rows[])

  document.querySelectorAll('#tableBody tr').forEach(tr => {
    const cells = tr.querySelectorAll('td');
    const matId = cells[1].querySelector('select').value;
    const len   = parseFloat(cells[2].querySelector('input').value);
    const wid   = parseFloat(cells[3].querySelector('input').value);
    const grain = cells[5].querySelector('select').value === 'Yes';

    if (!matId || !len || !wid) return;   // incomplete row — skip

    const mat = MATERIALS[matId];
    if (!panelFits(len, wid, grain, mat)) {
      errors.push({ tr, len, wid, grain, matId, mat });
      tr.classList.add('dim-error');
      const badge = document.createElement('span');
      badge.className = 'dim-error-badge';
      badge.textContent = '> board';
      cells[1].appendChild(badge);
    }
  });

  return errors;
}

function showDimModal(errors) {
  const detail = document.getElementById('dimModalDetail');
  detail.innerHTML = errors.map(e => {
    const mat = e.mat;
    const lenOk = e.len <= mat.sheetW;
    const widOk = e.wid <= mat.sheetH;
    const grainNote = e.grain ? ' <span style="color:var(--accent)">(grain locked)</span>' : '';
    return `<div style="margin-bottom:6px">
      <span class="lbl">Material:</span> ${mat.name}<br>
      <span class="lbl">Panel: </span>
        <span class="${lenOk?'ok':'bad'}">${e.len}mm</span> (L)
        × <span class="${widOk?'ok':'bad'}">${e.wid}mm</span> (W)${grainNote}<br>
      <span class="lbl">Sheet limit: </span>
        <span class="ok">${mat.sheetW}mm</span> × <span class="ok">${mat.sheetH}mm</span>
    </div>`;
  }).join('<hr style="border-color:var(--border);margin:8px 0">');
  document.getElementById('dimModal').style.display = 'flex';
}

function closeDimModal() {
  document.getElementById('dimModal').style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════
//  ADVANCED 2D GUILLOTINE CUTTING STOCK OPTIMIZER
//
//  Algorithms combined (literature basis):
//  1. Guillotine Placer  — 3 split rules (Short-Side, Long-Side, Area-Max)
//     Every cut traverses the full current piece → beamsaw-compatible
//     [Aryanezhad et al. 2012; Wang 1983]
//  2. GRASP              — Greedy Randomized Adaptive Search
//     [Alvarez-Valdes, Parajon & Tamarit 2002]
//  3. Simulated Annealing— swap + segment-reversal moves on item ordering
//     [Leung, Zhang, Zhou & Wu 2012]
//  4. Genetic Algorithm  — Order Crossover (OX), tournament selection
//     [Whitwell 2004; Oliveira Alves et al. 2026]
//  5. Branch & Bound     — exact permutation search for n ≤ 7
//     [Cung, Hifi & Le Cun 2000; Young-Gun & Kang 2003]
// ═══════════════════════════════════════════════════════════════

// ── 1. GUILLOTINE PLACER ────────────────────────────────────────
const SPLIT_RULES = ['short','long','area'];

function guillotinePack(orderedItems, AW, AH) {
  if (!orderedItems.length) return 0;
  let remaining = [...orderedItems];
  let sheets    = 0;

  while (remaining.length > 0) {
    sheets++;
    let bestUnplaced = remaining;

    for (const rule of SPLIT_RULES) {
      const freeRects = [{ x:0, y:0, w:AW, h:AH }];
      const unplaced  = [];
      for (const item of remaining) {
        if (!gpPlace(item, freeRects, rule)) unplaced.push(item);
      }
      if (unplaced.length < bestUnplaced.length) bestUnplaced = unplaced;
      if (bestUnplaced.length === 0) break;
    }

    // Safety: if nothing was placed (should never happen post-validation)
    if (bestUnplaced.length >= remaining.length) { sheets += remaining.length - 1; break; }
    remaining = bestUnplaced;
  }

  return sheets;
}

function gpPlace(item, freeRects, rule) {
  let bestIdx = -1, bestScore = Infinity, bestRot = false;

  for (let i = 0; i < freeRects.length; i++) {
    const r = freeRects[i];
    // Normal: Length (w) along X, Width (h) along Y
    if (item.w <= r.w && item.h <= r.h) {
      const s = gpScore(item.w, item.h, r.w, r.h, rule);
      if (s < bestScore) { bestScore = s; bestIdx = i; bestRot = false; }
    }
    // Rotated (only if canRotate)
    if (item.canRotate && item.h <= r.w && item.w <= r.h) {
      const s = gpScore(item.h, item.w, r.w, r.h, rule);
      if (s < bestScore) { bestScore = s; bestIdx = i; bestRot = true; }
    }
  }

  if (bestIdx === -1) return false;

  const r  = freeRects[bestIdx];
  const iw = bestRot ? item.h : item.w;
  const ih = bestRot ? item.w : item.h;
  freeRects.splice(bestIdx, 1);

  const rw = r.w - iw - KERF;   // right sub-rect width
  const bh = r.h - ih - KERF;   // bottom sub-rect height

  if (gpSplit(rw, bh, r.w, r.h, rule)) {
    // Horizontal split: right spans full height
    if (rw > 0) freeRects.push({ x: r.x+iw+KERF, y: r.y,       w: rw,  h: r.h });
    if (bh > 0) freeRects.push({ x: r.x,          y: r.y+ih+KERF, w: iw, h: bh  });
  } else {
    // Vertical split: bottom spans full width
    if (bh > 0) freeRects.push({ x: r.x,          y: r.y+ih+KERF, w: r.w, h: bh });
    if (rw > 0) freeRects.push({ x: r.x+iw+KERF,  y: r.y,        w: rw,  h: ih  });
  }

  return true;
}

// Best-Short-Side-Fit scoring (lower = tighter fit)
function gpScore(iw, ih, rw, rh, rule) {
  if (rule === 'short') return Math.min(rw - iw, rh - ih);
  if (rule === 'long')  return Math.max(rw - iw, rh - ih);
  return (rw - iw) * rh + (rh - ih) * rw; // area waste score
}

// true → horizontal split (right sub-rect gets full parent height)
function gpSplit(remW, remH, rw, rh, rule) {
  if (rule === 'short') return remW < remH;
  if (rule === 'long')  return remW > remH;
  return remW * rh > remH * rw; // maximize larger of the two sub-rects
}

// ── 2. SIMULATED ANNEALING ──────────────────────────────────────
function simulatedAnnealing(items, AW, AH) {
  const n = items.length;
  if (n <= 1) return { sheets: guillotinePack(items, AW, AH), order: [...items] };

  let order     = [...items];
  let curSheets = guillotinePack(order, AW, AH);
  let best      = curSheets;
  let bestOrder = [...order];

  const maxIter = Math.min(5000, Math.max(600, n * 90));
  let T         = 3.0;
  const Tmin    = 0.04;
  const alpha   = Math.pow(Tmin / T, 1 / maxIter);

  for (let it = 0; it < maxIter; it++) {
    const a = Math.floor(Math.random() * n);
    const b = Math.floor(Math.random() * n);
    if (a === b) { T *= alpha; continue; }

    const isSwap = Math.random() < 0.6;
    if (isSwap) {
      [order[a], order[b]] = [order[b], order[a]];
    } else {
      const lo = Math.min(a,b), hi = Math.max(a,b);
      const seg = order.slice(lo, hi+1).reverse();
      order.splice(lo, hi-lo+1, ...seg);
    }

    const ns    = guillotinePack(order, AW, AH);
    const delta = ns - curSheets;

    if (delta <= 0 || Math.random() < Math.exp(-delta / T)) {
      curSheets = ns;
      if (ns < best) { best = ns; bestOrder = [...order]; }
    } else {
      // Revert
      if (isSwap) {
        [order[a], order[b]] = [order[b], order[a]];
      } else {
        const lo = Math.min(a,b), hi = Math.max(a,b);
        const seg = order.slice(lo, hi+1).reverse();
        order.splice(lo, hi-lo+1, ...seg);
      }
    }

    T *= alpha;
  }

  return { sheets: best, order: bestOrder };
}

// ── 3. GENETIC ALGORITHM (OX crossover) ─────────────────────────
function geneticAlgorithm(items, AW, AH, popSize, generations) {
  const n = items.length;
  if (n <= 1) return guillotinePack(items, AW, AH);

  // Diverse initial population
  let pop = [
    [...items].sort((a,b) => b.area - a.area),
    [...items].sort((a,b) => a.area - b.area),
    [...items].sort((a,b) => b.w - a.w),
    [...items].sort((a,b) => b.h - a.h),
    [...items].sort((a,b) => Math.max(b.w,b.h) - Math.max(a.w,a.h)),
  ];
  while (pop.length < popSize) pop.push([...items].sort(() => Math.random() - 0.5));

  let best = Math.min(...pop.map(p => guillotinePack(p, AW, AH)));
  if (best === 1) return 1;

  for (let gen = 0; gen < generations; gen++) {
    const scores = pop.map(p => guillotinePack(p, AW, AH));
    const curMin = Math.min(...scores);
    if (curMin < best) best = curMin;
    if (best === 1) break;

    const ranked = scores.map((s,i)=>({s,i})).sort((a,b)=>a.s-b.s);
    const newPop = [pop[ranked[0].i], pop[ranked[1].i]]; // elites

    while (newPop.length < popSize) {
      const pa    = gaTournament(pop, scores);
      const pb    = gaTournament(pop, scores);
      let   child = oxCrossover(pa, pb);
      if (Math.random() < 0.3) {
        const x = Math.floor(Math.random() * n);
        const y = Math.floor(Math.random() * n);
        [child[x], child[y]] = [child[y], child[x]];
      }
      newPop.push(child);
    }
    pop = newPop;
  }

  return best;
}

function gaTournament(pop, scores, k=3) {
  let best=null, bestS=Infinity;
  for (let i=0; i<k; i++) {
    const idx = Math.floor(Math.random() * pop.length);
    if (scores[idx] < bestS) { bestS = scores[idx]; best = pop[idx]; }
  }
  return best;
}

function oxCrossover(pa, pb) {
  const n      = pa.length;
  const start  = Math.floor(Math.random() * n);
  const segLen = 1 + Math.floor(Math.random() * (n - 1));
  const child  = new Array(n);
  const inSeg  = new Set();

  for (let k=0; k<segLen; k++) {
    const pos = (start + k) % n;
    child[pos] = pa[pos];
    inSeg.add(pa[pos]);
  }
  let pbPtr = 0;
  for (let ci=0; ci<n; ci++) {
    const pos = (start + segLen + ci) % n;
    if (child[pos] !== undefined) continue;
    while (inSeg.has(pb[pbPtr])) pbPtr++;
    child[pos] = pb[pbPtr++];
  }
  return child;
}

// ── 4. BRANCH & BOUND ──────────────────────────────────────────
// Exact permutation search for small instances (n ≤ 7)
// Lower bound: ⌈total_area / sheet_area⌉
// Upper bound: heuristic (area-desc). Prunes when partial solution ≥ best.
function branchAndBound(items, AW, AH) {
  const n = items.length;
  const sheetArea  = AW * AH;
  const totalArea  = items.reduce((s,i) => s + i.w * i.h, 0);
  const lowerBound = Math.ceil(totalArea / sheetArea);

  // Heuristic upper bound
  const baseline = [...items].sort((a,b) => b.area - a.area);
  let best = guillotinePack(baseline, AW, AH);
  if (best === lowerBound) return best;

  const idxs = [...Array(n).keys()];

  function permute(arr, l) {
    if (best === lowerBound) return;
    if (l === arr.length) {
      const s = guillotinePack(arr.map(i => items[i]), AW, AH);
      if (s < best) best = s;
      return;
    }
    for (let i=l; i<arr.length; i++) {
      [arr[l], arr[i]] = [arr[i], arr[l]];
      permute(arr, l+1);
      [arr[l], arr[i]] = [arr[i], arr[l]];
    }
  }

  permute(idxs, 0);
  return best;
}

// ── MASTER OPTIMIZER ────────────────────────────────────────────
// Length (p.len) → sheet's X axis (long axis / grain direction)
// Width  (p.wid) → sheet's Y axis
function optimiseSheets(pieces, mat) {
  const AW = mat.sheetW;
  const AH = mat.sheetH;

  const items = [];
  for (const p of pieces) {
    for (let i=0; i<p.qty; i++) {
      items.push({
        w: p.len, h: p.wid,
        canRotate: !p.grain,
        area: p.len * p.wid,
      });
    }
  }

  if (!items.length) return 0;
  const n = items.length;

  // Exact for tiny jobs
  if (n <= 7) return branchAndBound(items, AW, AH);

  // Heuristic baseline
  let best = guillotinePack([...items].sort((a,b) => b.area - a.area), AW, AH);
  if (best === 1) return 1;

  // Simulated Annealing
  const saRes = simulatedAnnealing(items, AW, AH);
  if (saRes.sheets < best) best = saRes.sheets;
  if (best === 1) return 1;

  // Genetic Algorithm
  if (n <= 100) {
    const gaRes = geneticAlgorithm(items, AW, AH, 12, 40);
    if (gaRes < best) best = gaRes;
    if (best === 1) return 1;
  }

  // GRASP: randomised greedy multi-start
  const graspRuns = Math.min(35, Math.max(8, Math.floor(1400 / n)));
  for (let r=0; r<graspRuns; r++) {
    const alpha = 0.15 + Math.random() * 0.3;
    const rand  = [...items].sort((a,b) => {
      const rel  = b.area / (AW*AH) - a.area / (AW*AH);
      return rel + (Math.random() - 0.5) * alpha;
    });
    const s = guillotinePack(rand, AW, AH);
    if (s < best) best = s;
    if (best === 1) break;
  }

  return best;
}

// ═══════════════════════════════════════════════════════════════
//  MATERIAL DROPDOWN HTML
// ═══════════════════════════════════════════════════════════════
function matOptions(selected='') {
  const groups = [
    { label:'Customer Supplied',  keys:['free-issued-2800','free-issued-3050','free-issued-2440'] },
    { label:'Egger MFC / MFMDF', keys:['egger-mfc-18-white','egger-mfc-18-plain','egger-mfc-18-woodgrain','egger-mfmdf-19','egger-mfc-8'] },
    { label:'MDF',               keys:['mdf-18-2440','mdf-18-3050','mdf-12','mdf-9','mdf-6'] },
    { label:'MR MDF',            keys:['mrmdf-18-2440','mrmdf-18-3050','mrmdf-12','mrmdf-9','mrmdf-6'] },
  ];
  let h = `<option value="">— Select Material —</option>`;
  for (const g of groups) {
    h += `<optgroup label="${g.label}">`;
    for (const k of g.keys) h += `<option value="${k}"${selected===k?' selected':''}>${MATERIALS[k].name}</option>`;
    h += '</optgroup>';
  }
  return h;
}

// ═══════════════════════════════════════════════════════════════
//  EXCEL / CSV IMPORT
// ═══════════════════════════════════════════════════════════════

// Fuzzy column header matching
function matchCol(header) {
  const h = String(header).toLowerCase().replace(/[^a-z0-9]/g,'');
  if (/^(length|len|lmm|lengthmm|lengthmm|panellength|boardlength|sizel|diml)$/.test(h)) return 'len';
  if (/^(width|wid|wmm|widthmm|panelwidth|boardwidth|sizew|dimw)$/.test(h))              return 'wid';
  if (/^(qty|quantity|count|no|num|number|pcs|pieces|noofpieces|nopieces|amount|nos|qnty)$/.test(h)) return 'qty';
  if (/^(grain|graindirection|grainyesno|grainyn|graindir|hasgrain|grainy|grainrequired|grn)$/.test(h)) return 'grain';
  // Edging column — including "Edged Length", "Edge Length", "Edging", etc.
  if (/^(edging|edge|edgingdetail|edgedetail|edgecode|edgingcode|edgebanding|edgedlength|edgelength|edgedwidth|edgewidth|edgedl|edgel|edgedw|edgew|edginginfo|edgingtype|edgereq|edgingrequired)$/.test(h)) return 'edging';
  if (/^(notes|note|other|otherinformation|info|description|comment|comments|remarks|desc)$/.test(h)) return 'notes';
  return null;
}

// Normalise grain value to 'Yes' or 'No'
function normaliseGrain(v) {
  const s = String(v).trim().toLowerCase().replace(/[^a-z0-9]/g,'');
  if (['yes','y','1','true','grain','x','yg','gr','grainyes','required'].includes(s)) return 'Yes';
  return 'No';
}

// Normalise edging value to one of our codes
function normaliseEdging(v) {
  const raw = String(v).trim();
  if (!raw || raw === '-') return 'No Edge';

  // Normalised for direct matching
  const s = raw.toUpperCase().replace(/\s+/g,'').replace(/[^A-Z0-9]/g,'');

  const valid = ['No Edge','E1L','E2L','E1W','E2W','E1L1W','E1L2W','E2L1W','EAR'];
  // Direct match (with and without spaces)
  for (const opt of valid) {
    if (opt.replace(/\s+/g,'').toUpperCase() === s) return opt;
  }

  // Verbose / natural language mappings
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

  return 'No Edge'; // fallback
}

function parseWorkbook(wb) {
  const sheetName = wb.SheetNames[0];
  const ws        = wb.Sheets[sheetName];
  // Get all rows as arrays (raw values)
  const raw = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' });
  if (raw.length < 2) { showToast('⚠ File appears empty or has only headers'); return []; }

  // Detect header row — scan first 5 rows for one that has recognisable column names
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

  // If no header found, try positional fallback:
  // assume columns: Length, Width, Qty, [Grain], [Edging], [Notes]
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
      // Positional: col 0=len, 1=wid, 2=qty, 3=grain, 4=edging, 5=notes
      len    = parseFloat(row[0]);
      wid    = parseFloat(row[1]);
      qty    = parseInt(row[2])  || 1;
      grain  = row[3] !== undefined ? normaliseGrain(row[3])   : 'No';
      edging = row[4] !== undefined ? normaliseEdging(row[4])  : 'No Edge';
      notes  = row[5] !== undefined ? String(row[5]).trim()     : '';
    }

    if (!len || !wid || isNaN(len) || isNaN(wid)) continue;

    results.push({ matId:'free-issued-2800', len, wid, qty, grain, edging, notes });
  }

  return results;
}

function importRows(rows) {
  if (!rows.length) { showToast('⚠ No valid rows found in file'); return; }

  const tbody = document.getElementById('tableBody');

  // Remove any existing rows that are completely blank (no material, no len, no wid)
  // so imported data starts at position 1 rather than appending below empty rows
  tbody.querySelectorAll('tr').forEach(tr => {
    const cells  = tr.querySelectorAll('td');
    const matId  = cells[1].querySelector('select').value;
    const len    = cells[2].querySelector('input').value.trim();
    const wid    = cells[3].querySelector('input').value.trim();
    if (!matId && !len && !wid) tr.remove();
  });

  // Append imported rows
  rows.forEach(d => {
    rowCount++;
    const id = rowCount;
    const tr = document.createElement('tr');
    tr.id = `row-${id}`;
    tr.innerHTML = `
      <td><span class="row-num">${id}</span></td>
      <td class="col-mat"><select onchange="onDimChange(this)">${matOptions(d.matId)}</select></td>
      <td class="col-len"><input type="number" min="1" max="10000" value="${d.len}" oninput="onDimChange(this)" onchange="onDimChange(this)"></td>
      <td class="col-wid"><input type="number" min="1" max="10000" value="${d.wid}" oninput="onDimChange(this)" onchange="onDimChange(this)"></td>
      <td class="col-qty"><input type="number" min="1" max="999" value="${d.qty}" oninput="recalc()" onchange="recalc()"></td>
      <td class="col-grain"><select onchange="onDimChange(this)"><option value="No"${d.grain==='Yes'?'':' selected'}>No</option><option value="Yes"${d.grain==='Yes'?' selected':''}>Yes</option></select></td>
      <td class="col-edge"><select onchange="recalc()">${EDGING_OPTS.map(o=>`<option value="${o}"${d.edging===o?' selected':''}>${o}</option>`).join('')}</select></td>
      <td class="col-notes"><input type="text" placeholder="Optional" value="${d.notes}"></td>
      <td class="col-del"><button class="btn-del" onclick="removeRow(${id})" title="Remove">✕</button></td>
    `;
    tbody.appendChild(tr);
  });

  // Flash the upload button green
  const btn = document.getElementById('uploadBtn');
  btn.classList.add('flash');
  setTimeout(() => btn.classList.remove('flash'), 600);

  showToast(`✓ Imported ${rows.length} row${rows.length!==1?'s':''} — material set to Free Issued`);
  recalc();
}

function processFile(file) {
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  reader.onload = e => {
    try {
      let wb;
      if (ext === 'csv') {
        wb = XLSX.read(e.target.result, { type:'string' });
      } else {
        wb = XLSX.read(new Uint8Array(e.target.result), { type:'array' });
      }
      const rows = parseWorkbook(wb);
      importRows(rows);
    } catch(err) {
      showToast('⚠ Could not read file — check it is a valid Excel or CSV');
      console.error(err);
    }
  };

  if (ext === 'csv') {
    reader.readAsText(file);
  } else {
    reader.readAsArrayBuffer(file);
  }
}

function handleFileUpload(input) {
  processFile(input.files[0]);
  input.value = ''; // reset so same file can be re-uploaded
}

function handleFileDrop(event) {
  const file = event.dataTransfer.files[0];
  if (file) processFile(file);
}

// ═══════════════════════════════════════════════════════════════
//  ROW MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function addRow(n=1, defaults={}) {
  const tbody = document.getElementById('tableBody');
  for (let i=0; i<n; i++) {
    rowCount++;
    const id  = rowCount;
    const d   = Array.isArray(defaults) ? (defaults[i] || {}) : defaults;
    const tr  = document.createElement('tr');
    tr.id = `row-${id}`;
    tr.innerHTML = `
      <td><span class="row-num">${id}</span></td>
      <td class="col-mat"><select onchange="onDimChange(this)">${matOptions(d.matId||'')}</select></td>
      <td class="col-len"><input type="number" min="1" max="10000" placeholder="—" value="${d.len||''}" oninput="onDimChange(this)" onchange="onDimChange(this)"></td>
      <td class="col-wid"><input type="number" min="1" max="10000" placeholder="—" value="${d.wid||''}" oninput="onDimChange(this)" onchange="onDimChange(this)"></td>
      <td class="col-qty"><input type="number" min="1" max="999" value="${d.qty||1}" oninput="recalc()" onchange="recalc()"></td>
      <td class="col-grain"><select onchange="onDimChange(this)"><option value="No"${d.grain==='Yes'?'':' selected'}>No</option><option value="Yes"${d.grain==='Yes'?' selected':''}>Yes</option></select></td>
      <td class="col-edge"><select onchange="recalc()">${EDGING_OPTS.map(o=>`<option value="${o}"${d.edging===o?' selected':''}>${o}</option>`).join('')}</select></td>
      <td class="col-notes"><input type="text" placeholder="Optional" value="${d.notes||''}"></td>
      <td class="col-del"><button class="btn-del" onclick="removeRow(${id})" title="Remove">✕</button></td>
    `;
    tbody.appendChild(tr);
  }
  recalc();
}

function removeRow(id) {
  const el = document.getElementById(`row-${id}`);
  if (el) el.remove();
  recalc();
}

function clearAll() {
  if (!confirm('Clear all rows?')) return;
  document.getElementById('tableBody').innerHTML = '';
  rowCount = 0;
  recalc();
}

// Called whenever any dimension-relevant cell changes.
// Immediately shows the modal if this row now violates a limit.
function onDimChange(el) {
  const tr    = el.closest('tr');
  const cells = tr.querySelectorAll('td');
  const matId = cells[1].querySelector('select').value;
  const len   = parseFloat(cells[2].querySelector('input').value);
  const wid   = parseFloat(cells[3].querySelector('input').value);
  const grain = cells[5].querySelector('select').value === 'Yes';

  // Clear this row's error state
  tr.classList.remove('dim-error');
  tr.querySelectorAll('.dim-error-badge').forEach(b => b.remove());

  if (matId && len && wid) {
    const mat = MATERIALS[matId];
    if (!panelFits(len, wid, grain, mat)) {
      showDimModal([{ tr, len, wid, grain, matId, mat }]);
    }
  }

  recalc();
}

// ═══════════════════════════════════════════════════════════════
//  PARSE TABLE ROWS
// ═══════════════════════════════════════════════════════════════
function getRows() {
  const rows = [];
  document.querySelectorAll('#tableBody tr').forEach(tr => {
    const cells = tr.querySelectorAll('td');
    const matId = cells[1].querySelector('select').value;
    const len   = parseFloat(cells[2].querySelector('input').value);
    const wid   = parseFloat(cells[3].querySelector('input').value);
    const qty   = parseInt(cells[4].querySelector('input').value) || 1;
    const grain = cells[5].querySelector('select').value === 'Yes';
    const edging = cells[6].querySelector('select').value;
    const notes  = cells[7].querySelector('input').value.trim();
    if (!matId || !len || !wid) return;
    rows.push({ matId, len, wid, qty, grain, edging, notes });
  });
  return rows;
}

// ═══════════════════════════════════════════════════════════════
//  EDGING CALCULATION
// ═══════════════════════════════════════════════════════════════
function calcEdgingMm(l, w, qty, code) {
  const map = {
    'No Edge':0,'E1L':l,'E2L':2*l,'E1W':w,'E2W':2*w,
    'E1L1W':l+w,'E1L2W':l+2*w,'E2L1W':2*l+w,'EAR':2*(l+w),
  };
  return (map[code] || 0) * qty;
}

function edgingDesc(l, w, qty, code) {
  const descs = {
    'No Edge': 'No edging',
    'E1L':   `QTY ${qty} × 1 Long Edge = ${qty}×${l}mm`,
    'E2L':   `QTY ${qty} × 2 Long Edges = ${qty}×${2*l}mm`,
    'E1W':   `QTY ${qty} × 1 Width Edge = ${qty}×${w}mm`,
    'E2W':   `QTY ${qty} × 2 Width Edges = ${qty}×${2*w}mm`,
    'E1L1W': `QTY ${qty} × 1L+1W = ${qty}×(${l}+${w})mm`,
    'E1L2W': `QTY ${qty} × 1L+2W = ${qty}×(${l}+${2*w})mm`,
    'E2L1W': `QTY ${qty} × 2L+1W = ${qty}×(${2*l}+${w})mm`,
    'EAR':   `QTY ${qty} × All Round = ${qty}×2×(${l}+${w})mm`,
  };
  return descs[code] || '';
}

// ═══════════════════════════════════════════════════════════════
//  MAIN CALCULATION + RENDER
// ═══════════════════════════════════════════════════════════════
function recalc() {
  const rows = getRows();

  if (!rows.length) {
    document.getElementById('quoteBody').innerHTML = `
      <div class="empty-state"><div class="icon">📐</div>
      <p>Add rows to your cutting list and select a material to see a live price breakdown.</p></div>`;
    document.getElementById('quoteSubtitle').textContent = 'Enter your cutting list to see pricing';
    return;
  }

  // Validate — block optimisation on any dimension error
  const dimErrors = validateDimensions(rows);
  if (dimErrors.length) {
    document.getElementById('quoteBody').innerHTML = `
      <div class="empty-state"><div class="icon">🚫</div>
      <p style="color:var(--red);font-weight:600">Cannot optimise: ${dimErrors.length} panel${dimErrors.length>1?'s exceed':'exceeds'} the sheet dimensions.</p>
      <p style="margin-top:8px">Correct the highlighted rows to see pricing.</p></div>`;
    document.getElementById('quoteSubtitle').textContent = `${dimErrors.length} dimension error${dimErrors.length>1?'s':''}`;
    return;
  }

  // Group by material
  const matGroups = {};
  for (const r of rows) {
    if (!matGroups[r.matId]) matGroups[r.matId] = [];
    matGroups[r.matId].push(r);
  }

  const breakdown = [];
  let grandMat=0, grandCut=0, grandEdge=0;

  for (const [matId, pieces] of Object.entries(matGroups)) {
    const mat    = MATERIALS[matId];
    const nPieces = pieces.reduce((s,p) => s+p.qty, 0);
    const sheets  = optimiseSheets(pieces, mat);

    // Edging: mm → m, +10% wastage, round up to nearest metre
    let totalEdgeMm = 0;
    for (const p of pieces) totalEdgeMm += calcEdgingMm(p.len, p.wid, p.qty, p.edging);
    const edgingM = Math.ceil(totalEdgeMm / 1000 * 1.1);

    const matCost  = sheets * mat.price;
    const cutCost  = sheets * mat.cutCost;
    const edgeCost = edgingM * EDGING_COST_PM;

    grandMat  += matCost;
    grandCut  += cutCost;
    grandEdge += edgeCost;

    breakdown.push({ mat, matId, pieces, sheets, nPieces, edgingM, matCost, cutCost, edgeCost });
  }

  const grandTotal = grandMat + grandCut + grandEdge;
  const m = showIncVat ? (1+VAT) : 1;
  const vatLabel = showIncVat ? ' (inc. VAT)' : ' (ex. VAT)';
  const fmt = v => `£${(v*m).toFixed(2)}`;

  const totalItems = rows.reduce((s,r) => s+r.qty, 0);
  const algoBadge  = totalItems <= 7 ? 'B&B exact' : totalItems <= 100 ? 'SA + GA + GRASP' : 'SA + GRASP';

  let html = `<div class="material-breakdown">`;
  for (const b of breakdown) {
    const sub = b.matCost + b.cutCost + b.edgeCost;
    html += `
    <div class="mat-card">
      <div class="mat-card-name">
        ${b.mat.name.split('—')[0].trim()}
        <span class="badge">${b.sheets} sheet${b.sheets!==1?'s':''}</span>
      </div>
      <div class="mat-card-rows">
        <div class="mat-card-row"><span class="label">Panels</span><span class="val">${b.nPieces} pc${b.nPieces!==1?'s':''}</span></div>
        <div class="mat-card-row"><span class="label">Sheets × unit</span><span class="val">${b.sheets} × ${fmt(b.mat.price)}</span></div>
        <div class="mat-card-row"><span class="label">Material</span><span class="val">${fmt(b.matCost)}</span></div>
        <div class="mat-card-row"><span class="label">Cutting</span><span class="val">${fmt(b.cutCost)}</span></div>
        <div class="mat-card-row"><span class="label">Edging (${b.edgingM}m)</span><span class="val">${fmt(b.edgeCost)}</span></div>
        <div class="mat-card-row subtotal"><span class="label">Subtotal</span><span class="val">${fmt(sub)}</span></div>
      </div>
    </div>`;
  }
  html += `</div>`;

  html += `
  <div class="total-box">
    <div class="total-rows">
      <div class="total-row"><span class="label">Materials</span><span class="val">${fmt(grandMat)}</span></div>
      <div class="total-row"><span class="label">Cutting</span><span class="val">${fmt(grandCut)}</span></div>
      <div class="total-row"><span class="label">Edging</span><span class="val">${fmt(grandEdge)}</span></div>
      ${!showIncVat ? `<div class="total-row"><span class="label">VAT (20%)</span><span class="val">£${(grandTotal*VAT).toFixed(2)}</span></div>` : ''}
      <div class="total-row grand">
        <span class="label">Total${vatLabel}</span>
        <span class="val">${fmt(grandTotal)}</span>
      </div>
    </div>
    <div style="font-size:11px;color:var(--text-dim);text-align:right;margin-top:-6px">
      Optimised: <span class="algo-badge">${algoBadge}</span>
    </div>
  </div>

  <div class="csv-downloads-section">
    <div class="csv-downloads-label">Individual CSVs</div>
    ${breakdown.map(b => {
      const fname = getCsvFilename(b.matId);
      return `<div class="csv-row">
        <span class="csv-row-name" title="${b.mat.name}">${b.mat.name}</span>
        <button class="btn-csv" onclick="downloadSingleCSV('${b.matId}')">
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M7 1v9M4 7l3 3 3-3M1 13h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          CSV
        </button>
      </div>`;
    }).join('')}
  </div>

  <div class="submit-area">
    <button class="btn btn-accent" onclick="downloadAndEmail()">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v10M4 8l4 4 4-4M2 13h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Download All &amp; Send Quote
    </button>
    <button class="btn btn-ghost" onclick="downloadAllZip()">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v9M4 7l3 3 3-3M1 13h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Download All CSVs (ZIP)
    </button>
  </div>`;

  document.getElementById('quoteBody').innerHTML = html;
  const totalPieces = rows.reduce((s,r) => s+r.qty, 0);
  document.getElementById('quoteSubtitle').textContent =
    `${totalPieces} panel${totalPieces!==1?'s':''} · ${Object.keys(matGroups).length} material${Object.keys(matGroups).length!==1?'s':''}`;
}

// ═══════════════════════════════════════════════════════════════
//  VAT TOGGLE
// ═══════════════════════════════════════════════════════════════
function setVat(inc) {
  showIncVat = inc;
  document.getElementById('btnExVat').classList.toggle('active', !inc);
  document.getElementById('btnIncVat').classList.toggle('active', inc);
  recalc();
}

// ═══════════════════════════════════════════════════════════════
//  CSV GENERATION & EXPORT
// ═══════════════════════════════════════════════════════════════

function generateCSV(matId, pieces, customer, jobRef) {
  const headers = ['Customer','Material/thickness','Length(mm)','Width(mm)','Quantity','Grain(Yes/No)','Edging detail','Other information'];
  const mat = MATERIALS[matId];
  const csvRows = pieces.map(p => [
    customer || 'Customer',
    mat.name,
    p.len, p.wid, p.qty,
    p.grain ? 'Yes' : 'No',
    p.edging,
    p.notes || edgingDesc(p.len, p.wid, p.qty, p.edging),
  ]);
  return [headers, ...csvRows]
    .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
    .join('\r\n');
}

function sanitise(s) {
  return String(s).replace(/[^a-zA-Z0-9_\-\s]/g,'').replace(/\s+/g,'_').substring(0, 40);
}

function getJobMeta() {
  return {
    customer: document.getElementById('customerName').value.trim() || 'Customer',
    jobRef:   document.getElementById('jobRef').value.trim()       || 'Job',
  };
}

function getCsvFilename(matId) {
  const { customer, jobRef } = getJobMeta();
  return `${sanitise(jobRef)}_${sanitise(customer)}_${sanitise(MATERIALS[matId].name)}.csv`;
}

// Validate and build material groups from current table
function buildMatGroups() {
  const rows = getRows();
  if (!rows.length) { showToast('⚠ No complete rows to export'); return null; }
  const dimErrors = validateDimensions(rows);
  if (dimErrors.length) { showDimModal(dimErrors); return null; }
  const groups = {};
  for (const r of rows) {
    if (!groups[r.matId]) groups[r.matId] = [];
    groups[r.matId].push(r);
  }
  return groups;
}

// Reliable single-file download (one programmatic click — always works)
function downloadBlob(content, filename, type = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Individual per-material CSV download
function downloadSingleCSV(matId) {
  const groups = buildMatGroups();
  if (!groups || !groups[matId]) return;
  const { customer, jobRef } = getJobMeta();
  const csv = generateCSV(matId, groups[matId], customer, jobRef);
  downloadBlob(csv, getCsvFilename(matId));
  showToast(`✓ Downloaded: ${MATERIALS[matId].name.split('—')[0].trim()}`);
}

// Download all CSVs as a single ZIP (avoids browser multi-download blocking)
async function downloadAllZip(openEmail = false) {
  const groups = buildMatGroups();
  if (!groups) return;

  const { customer, jobRef } = getJobMeta();
  const zip    = new JSZip();
  const matIds = Object.keys(groups);

  for (const matId of matIds) {
    const csv = generateCSV(matId, groups[matId], customer, jobRef);
    zip.file(getCsvFilename(matId), csv);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipName = `${sanitise(jobRef)}_${sanitise(customer)}_CuttingLists.zip`;
  downloadBlob(zipBlob, zipName, 'application/zip');
  showToast(`✓ ZIP downloaded — ${matIds.length} CSV file${matIds.length !== 1 ? 's' : ''} inside`);

  if (openEmail) {
    const pieces  = getRows().reduce((s, r) => s + r.qty, 0);
    const matList = matIds.map(id => MATERIALS[id].name).join(', ');
    const subject = encodeURIComponent(`Quote Request — ${customer} — ${jobRef}`);
    const body    = encodeURIComponent(
`Hi Lucian,

Please find attached the ZIP file containing ${matIds.length} CSV cutting list${matIds.length!==1?'s':''} for the following job:

Customer:      ${customer}
Job Reference: ${jobRef}
Total Panels:  ${pieces}
Materials:     ${matList}

Please attach the ZIP before sending.

Thank you.`);
    setTimeout(() => {
      window.location.href = `mailto:lucian@dtsolutionsltd.co.uk?subject=${subject}&body=${body}`;
    }, 800);
  }
}

function downloadAndEmail() { downloadAllZip(true); }

// ═══════════════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════════════
function showToast(msg) {
  document.getElementById('toastMsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════
addRow(3);
