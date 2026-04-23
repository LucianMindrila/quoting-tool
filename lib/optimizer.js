import { KERF } from './constants.js';

// Returns true if the panel can physically fit in the sheet.
// grain=true: Length MUST align with sheetW (no rotation).
export function panelFits(len, wid, grain, mat) {
  const normal  = len <= mat.sheetW && wid <= mat.sheetH;
  const rotated = !grain && wid <= mat.sheetW && len <= mat.sheetH;
  return normal || rotated;
}

// ── 1. GUILLOTINE PLACER ─────────────────────────────────────────
const SPLIT_RULES = ['short','long','area'];

function guillotinePack(orderedItems, AW, AH) {
  if (!orderedItems.length) return 0;
  let remaining = [...orderedItems];
  let sheets    = 0;

  // Only run no-rotation passes when at least one item can rotate —
  // otherwise the pass produces identical results and wastes cycles.
  const anyRotatable = remaining.some(i => i.canRotate);

  while (remaining.length > 0) {
    sheets++;
    let bestUnplaced = remaining;

    for (const noRotate of (anyRotatable ? [false, true] : [false])) {
      for (const rule of SPLIT_RULES) {
        const freeRects = [{ x:0, y:0, w:AW, h:AH }];
        const unplaced  = [];
        for (const item of remaining) {
          if (!gpPlace(item, freeRects, rule, noRotate)) unplaced.push(item);
        }
        if (unplaced.length < bestUnplaced.length) bestUnplaced = unplaced;
        if (bestUnplaced.length === 0) break;
      }
      if (bestUnplaced.length === 0) break;
    }

    if (bestUnplaced.length >= remaining.length) { sheets += remaining.length - 1; break; }
    remaining = bestUnplaced;
  }

  return sheets;
}

// noRotate=true: ignore canRotate and always place in natural orientation.
// This prevents greedy rotation choices (e.g. short-side scoring preferring
// a rotated fit) from creating strips that are too thin for remaining pieces.
function gpPlace(item, freeRects, rule, noRotate = false) {
  let bestIdx = -1, bestScore = Infinity, bestRot = false;

  for (let i = 0; i < freeRects.length; i++) {
    const r = freeRects[i];
    if (item.w <= r.w && item.h <= r.h) {
      const s = gpScore(item.w, item.h, r.w, r.h, rule);
      if (s < bestScore) { bestScore = s; bestIdx = i; bestRot = false; }
    }
    if (!noRotate && item.canRotate && item.h <= r.w && item.w <= r.h) {
      const s = gpScore(item.h, item.w, r.w, r.h, rule);
      if (s < bestScore) { bestScore = s; bestIdx = i; bestRot = true; }
    }
  }

  if (bestIdx === -1) return false;

  const r  = freeRects[bestIdx];
  const iw = bestRot ? item.h : item.w;
  const ih = bestRot ? item.w : item.h;
  freeRects.splice(bestIdx, 1);

  const rw = r.w - iw - KERF;
  const bh = r.h - ih - KERF;

  if (gpSplit(rw, bh, r.w, r.h, rule)) {
    if (rw > 0) freeRects.push({ x: r.x+iw+KERF, y: r.y,         w: rw, h: r.h });
    if (bh > 0) freeRects.push({ x: r.x,          y: r.y+ih+KERF, w: iw, h: bh  });
  } else {
    if (bh > 0) freeRects.push({ x: r.x,          y: r.y+ih+KERF, w: r.w, h: bh });
    if (rw > 0) freeRects.push({ x: r.x+iw+KERF,  y: r.y,         w: rw,  h: ih  });
  }

  return true;
}

function gpScore(iw, ih, rw, rh, rule) {
  if (rule === 'short') return Math.min(rw - iw, rh - ih);
  if (rule === 'long')  return Math.max(rw - iw, rh - ih);
  return (rw - iw) * rh + (rh - ih) * rw;
}

function gpSplit(remW, remH, rw, rh, rule) {
  if (rule === 'short') return remW < remH;
  if (rule === 'long')  return remW > remH;
  return remW * rh > remH * rw;
}

// ── 2. SIMULATED ANNEALING ───────────────────────────────────────
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

// ── 3. GENETIC ALGORITHM ────────────────────────────────────────
function geneticAlgorithm(items, AW, AH, popSize, generations) {
  const n = items.length;
  if (n <= 1) return guillotinePack(items, AW, AH);

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

    const ranked = scores.map((s,i) => ({s,i})).sort((a,b) => a.s-b.s);
    const newPop = [pop[ranked[0].i], pop[ranked[1].i]];

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

// ── 4. BRANCH & BOUND ───────────────────────────────────────────
function branchAndBound(items, AW, AH) {
  const n         = items.length;
  const sheetArea = AW * AH;
  const totalArea = items.reduce((s,i) => s + i.w * i.h, 0);
  const lowerBound = Math.ceil(totalArea / sheetArea);

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

// ── LAYOUT RECORDER ─────────────────────────────────────────────
// Mirrors gpPlace but records x/y/w/h of every placed piece.
function gpPlaceRecord(item, freeRects, rule, noRotate = false) {
  let bestIdx = -1, bestScore = Infinity, bestRot = false;
  for (let i = 0; i < freeRects.length; i++) {
    const r = freeRects[i];
    if (item.w <= r.w && item.h <= r.h) {
      const s = gpScore(item.w, item.h, r.w, r.h, rule);
      if (s < bestScore) { bestScore = s; bestIdx = i; bestRot = false; }
    }
    if (!noRotate && item.canRotate && item.h <= r.w && item.w <= r.h) {
      const s = gpScore(item.h, item.w, r.w, r.h, rule);
      if (s < bestScore) { bestScore = s; bestIdx = i; bestRot = true; }
    }
  }
  if (bestIdx === -1) return null;

  const r  = freeRects[bestIdx];
  const iw = bestRot ? item.h : item.w;
  const ih = bestRot ? item.w : item.h;
  freeRects.splice(bestIdx, 1);

  const rw = r.w - iw - KERF;
  const bh = r.h - ih - KERF;
  if (gpSplit(rw, bh, r.w, r.h, rule)) {
    if (rw > 0) freeRects.push({ x: r.x+iw+KERF, y: r.y,         w: rw, h: r.h });
    if (bh > 0) freeRects.push({ x: r.x,          y: r.y+ih+KERF, w: iw, h: bh  });
  } else {
    if (bh > 0) freeRects.push({ x: r.x,          y: r.y+ih+KERF, w: r.w, h: bh });
    if (rw > 0) freeRects.push({ x: r.x+iw+KERF,  y: r.y,         w: rw,  h: ih  });
  }
  return { x: r.x, y: r.y, w: iw, h: ih, rotated: bestRot, pieceIdx: item.pieceIdx };
}

function gpPackLayout(orderedItems, AW, AH) {
  const anyRotatable = orderedItems.some(i => i.canRotate);
  let remaining = [...orderedItems];
  const sheets  = [];

  while (remaining.length > 0) {
    let bestUnplaced = remaining, bestPlaced = [];

    for (const noRotate of (anyRotatable ? [false, true] : [false])) {
      for (const rule of SPLIT_RULES) {
        const freeRects = [{ x:0, y:0, w:AW, h:AH }];
        const thisPlaced = [], thisUnplaced = [];
        for (const item of remaining) {
          const r = gpPlaceRecord(item, freeRects, rule, noRotate);
          if (r) thisPlaced.push(r); else thisUnplaced.push(item);
        }
        if (thisUnplaced.length < bestUnplaced.length) {
          bestUnplaced = thisUnplaced; bestPlaced = thisPlaced;
        }
        if (bestUnplaced.length === 0) break;
      }
      if (bestUnplaced.length === 0) break;
    }

    if (bestUnplaced.length >= remaining.length) {
      for (const item of remaining)
        sheets.push([{ x:0, y:0, w:item.w, h:item.h, rotated:false, pieceIdx:item.pieceIdx }]);
      break;
    }
    sheets.push(bestPlaced);
    remaining = bestUnplaced;
  }
  return sheets;
}

// Returns per-sheet placement data for visualisation.
// Uses area-desc guillotine (fast, good enough for display).
export function layoutSheets(pieces, mat) {
  const AW = mat.sheetW, AH = mat.sheetH;
  const items = [];
  for (let pi = 0; pi < pieces.length; pi++) {
    const p = pieces[pi];
    for (let i = 0; i < p.qty; i++)
      items.push({ w: p.len, h: p.wid, canRotate: !p.grain, area: p.len * p.wid, pieceIdx: pi });
  }
  if (!items.length) return [];
  return gpPackLayout([...items].sort((a, b) => b.area - a.area), AW, AH);
}

// ── MASTER OPTIMIZER ────────────────────────────────────────────
export function optimiseSheets(pieces, mat) {
  const AW = mat.sheetW;
  const AH = mat.sheetH;

  const items = [];
  for (const p of pieces) {
    for (let i=0; i<p.qty; i++) {
      items.push({ w: p.len, h: p.wid, canRotate: !p.grain, area: p.len * p.wid });
    }
  }

  if (!items.length) return 0;
  const n = items.length;

  if (n <= 7) return branchAndBound(items, AW, AH);

  let best = guillotinePack([...items].sort((a,b) => b.area - a.area), AW, AH);
  if (best === 1) return 1;

  const saRes = simulatedAnnealing(items, AW, AH);
  if (saRes.sheets < best) best = saRes.sheets;
  if (best === 1) return 1;

  if (n <= 100) {
    const gaRes = geneticAlgorithm(items, AW, AH, 12, 40);
    if (gaRes < best) best = gaRes;
    if (best === 1) return 1;
  }

  const graspRuns = Math.min(35, Math.max(8, Math.floor(1400 / n)));
  for (let r=0; r<graspRuns; r++) {
    const alpha = 0.15 + Math.random() * 0.3;
    const rand  = [...items].sort((a,b) => {
      const rel = b.area / (AW*AH) - a.area / (AW*AH);
      return rel + (Math.random() - 0.5) * alpha;
    });
    const s = guillotinePack(rand, AW, AH);
    if (s < best) best = s;
    if (best === 1) break;
  }

  return best;
}
