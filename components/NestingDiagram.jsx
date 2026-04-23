'use client';

import { useState } from 'react';

// Colour palette — one colour per unique piece (row) in the cutting list
const PALETTE = [
  '#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6',
  '#06B6D4','#F97316','#EC4899','#14B8A6','#6366F1',
  '#84CC16','#E11D48','#0EA5E9','#A855F7','#22C55E',
];

function pieceColor(idx) {
  return PALETTE[idx % PALETTE.length];
}

// Single sheet SVG — viewBox uses real mm coords, SVG scales to fill container
function SheetSVG({ sheetIdx, placements, sheetW, sheetH, pieces }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="nest-sheet">
      <div className="nest-sheet-label">Sheet {sheetIdx + 1}</div>
      <div className="nest-svg-wrap">
        <svg
          viewBox={`0 0 ${sheetW} ${sheetH}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          className="nest-svg"
        >
          {/* Sheet background */}
          <rect x={0} y={0} width={sheetW} height={sheetH}
            fill="#f3f4f6" stroke="#9ca3af" strokeWidth={8} />

          {/* Placed pieces */}
          {placements.map((p, i) => {
            const col    = pieceColor(p.pieceIdx);
            const isHov  = hovered === i;
            const piece  = pieces[p.pieceIdx];
            const dimW   = p.w;
            const dimH   = p.h;
            const fs     = Math.min(dimW, dimH) * 0.13;
            const showLbl = dimW > sheetW * 0.05 && dimH > sheetH * 0.05;

            return (
              <g key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'default' }}
              >
                <rect
                  x={p.x} y={p.y} width={p.w} height={p.h}
                  fill={col}
                  fillOpacity={isHov ? 0.9 : 0.65}
                  stroke={col}
                  strokeWidth={isHov ? 14 : 6}
                />
                {showLbl && (
                  <text
                    x={p.x + p.w / 2}
                    y={p.y + p.h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={fs}
                    fontFamily="system-ui, sans-serif"
                    fontWeight="600"
                    fill="#fff"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {dimW}×{dimH}
                    {p.rotated ? ' ↺' : ''}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hovered !== null && (() => {
          const p     = placements[hovered];
          const piece = pieces[p.pieceIdx];
          return (
            <div className="nest-tooltip">
              <strong>{p.w} × {p.h} mm</strong>
              {piece?.edging && piece.edging !== 'No Edge' && (
                <span> · Edge: {piece.edging}</span>
              )}
              {p.rotated && <span> · Rotated</span>}
              {piece?.notes && <div style={{ fontSize: 10, opacity: 0.8 }}>{piece.notes}</div>}
            </div>
          );
        })()}
      </div>
      <div className="nest-sheet-dims">{sheetW} × {sheetH} mm</div>
    </div>
  );
}

export default function NestingDiagram({ layout, sheetW, sheetH, pieces }) {
  const [open, setOpen] = useState(false);

  if (!layout || layout.length === 0) return null;

  // Build legend: unique piece indices actually used
  const usedIdx = [...new Set(layout.flat().map(p => p.pieceIdx))].sort((a, b) => a - b);

  return (
    <div className="nest-root">
      <button className="nest-toggle" onClick={() => setOpen(o => !o)}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.6"/>
          <rect x="9" y="1" width="6" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/>
          <rect x="1" y="7" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.6"/>
          <rect x="9" y="10" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.6"/>
        </svg>
        {open ? 'Hide nesting layout' : 'View nesting layout'}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2 3l3 4 3-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="nest-body">
          {/* Colour legend */}
          <div className="nest-legend">
            {usedIdx.map(pi => {
              const p = pieces[pi];
              return (
                <div key={pi} className="nest-legend-item">
                  <span className="nest-swatch" style={{ background: pieceColor(pi) }} />
                  <span>{p.len}×{p.wid} mm</span>
                  {p.grain && <span className="nest-grain-tag">grain</span>}
                </div>
              );
            })}
          </div>

          {/* Sheet grid */}
          <div className="nest-grid">
            {layout.map((placements, si) => (
              <SheetSVG
                key={si}
                sheetIdx={si}
                placements={placements}
                sheetW={sheetW}
                sheetH={sheetH}
                pieces={pieces}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
