export const KERF           = 5;
export const EDGE_DIST      = 2;
export const EDGING_COST_PM = 2.5;
export const VAT            = 0.20;

export const MATERIALS = {
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

export const MATERIAL_GROUPS = [
  { label:'Customer Supplied',  keys:['free-issued-2800','free-issued-3050','free-issued-2440'] },
  { label:'Egger MFC / MFMDF', keys:['egger-mfc-18-white','egger-mfc-18-plain','egger-mfc-18-woodgrain','egger-mfmdf-19','egger-mfc-8'] },
  { label:'MDF',               keys:['mdf-18-2440','mdf-18-3050','mdf-12','mdf-9','mdf-6'] },
  { label:'MR MDF',            keys:['mrmdf-18-2440','mrmdf-18-3050','mrmdf-12','mrmdf-9','mrmdf-6'] },
];

export const EDGING_OPTS = ['No Edge','E1L','E2L','E1W','E2W','E1L1W','E1L2W','E2L1W','EAR'];

export const EDGING_LABELS = {
  'No Edge': 'No edging',
  'E1L':    '1 Long edge',
  'E2L':    '2 Long edges',
  'E1W':    '1 Width edge',
  'E2W':    '2 Width edges',
  'E1L1W':  '1 Long + 1 Width',
  'E1L2W':  '1 Long + 2 Width',
  'E2L1W':  '2 Long + 1 Width',
  'EAR':    'Edge All Round',
};

export function calcEdgingMm(l, w, qty, code) {
  const map = {
    'No Edge':0,'E1L':l,'E2L':2*l,'E1W':w,'E2W':2*w,
    'E1L1W':l+w,'E1L2W':l+2*w,'E2L1W':2*l+w,'EAR':2*(l+w),
  };
  return (map[code] || 0) * qty;
}

export function edgingDesc(l, w, qty, code) {
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
