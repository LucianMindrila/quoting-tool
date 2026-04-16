'use client';

import { downloadSingleCSV, downloadAllZip } from '@/lib/csvExport';
import { MATERIALS, VAT } from '@/lib/constants';

export default function QuotePanel({
  breakdown, grandMat, grandCut, grandEdge,
  dimErrorCount, hasRows,
  showIncVat, customerName, jobRef,
  onShowToast,
}) {
  const grandTotal = (grandMat ?? 0) + (grandCut ?? 0) + (grandEdge ?? 0);
  const m        = showIncVat ? (1 + VAT) : 1;
  const vatLabel = showIncVat ? ' (inc. VAT)' : ' (ex. VAT)';
  const fmt      = v => `£${(v * m).toFixed(2)}`;

  const customer = customerName || 'Customer';
  const ref      = jobRef || 'Job';

  // Build material groups object for CSV export
  function getGroups() {
    if (!breakdown) return null;
    const groups = {};
    for (const b of breakdown) groups[b.matId] = b.pieces;
    return groups;
  }

  async function handleDownloadSingle(matId) {
    const groups = getGroups();
    downloadSingleCSV(matId, groups, customer, ref);
    onShowToast(`✓ Downloaded: ${MATERIALS[matId].name.split('—')[0].trim()}`);
  }

  async function handleDownloadAll(openEmail = false) {
    const groups = getGroups();
    if (!groups) return;
    const matIds = Object.keys(groups);
    await downloadAllZip(groups, customer, ref, openEmail);
    onShowToast(`✓ ZIP downloaded — ${matIds.length} CSV file${matIds.length !== 1 ? 's' : ''} inside`);
  }

  // Empty state
  if (!hasRows) {
    return (
      <div className="right-panel">
        <QuoteHeader subtitle="Enter your cutting list to see pricing" />
        <div className="empty-state">
          <div className="icon">📐</div>
          <p>Add rows to your cutting list and select a material to see a live price breakdown.</p>
        </div>
      </div>
    );
  }

  // Dim error state
  if (dimErrorCount > 0) {
    return (
      <div className="right-panel">
        <QuoteHeader subtitle={`${dimErrorCount} dimension error${dimErrorCount > 1 ? 's' : ''}`} />
        <div className="empty-state">
          <div className="icon">🚫</div>
          <p style={{ color:'var(--red)', fontWeight:600 }}>
            Cannot optimise: {dimErrorCount} panel{dimErrorCount > 1 ? 's exceed' : ' exceeds'} the sheet dimensions.
          </p>
          <p style={{ marginTop:8 }}>Correct the highlighted rows to see pricing.</p>
        </div>
      </div>
    );
  }

  // Loading state (breakdown not yet computed)
  if (!breakdown) {
    return (
      <div className="right-panel">
        <QuoteHeader subtitle="Calculating…" />
        <div className="empty-state">
          <p style={{ color:'var(--text-muted)' }}>Optimising sheet layout…</p>
        </div>
      </div>
    );
  }

  const totalPieces = breakdown.reduce((s, b) => s + b.nPieces, 0);
  const totalItems  = breakdown.reduce((s, b) => s + b.pieces.reduce((a, p) => a + p.qty, 0), 0);
  const algoBadge   = totalItems <= 7 ? 'B&B exact' : totalItems <= 100 ? 'SA + GA + GRASP' : 'SA + GRASP';
  const subtitle    = `${totalPieces} panel${totalPieces !== 1 ? 's' : ''} · ${breakdown.length} material${breakdown.length !== 1 ? 's' : ''}`;

  return (
    <div className="right-panel">
      <QuoteHeader subtitle={subtitle} />

      <div className="material-breakdown">
        {breakdown.map(b => {
          const sub = b.matCost + b.cutCost + b.edgeCost;
          return (
            <div key={b.matId} className="mat-card">
              <div className="mat-card-name">
                {b.mat.name.split('—')[0].trim()}
                <span className="badge">{b.sheets} sheet{b.sheets !== 1 ? 's' : ''}</span>
              </div>
              <div className="mat-card-rows">
                <MatRow label="Panels"         val={`${b.nPieces} pc${b.nPieces !== 1 ? 's' : ''}`} />
                <MatRow label="Sheets × unit"  val={`${b.sheets} × ${fmt(b.mat.price)}`} />
                <MatRow label="Material"       val={fmt(b.matCost)} />
                <MatRow label="Cutting"        val={fmt(b.cutCost)} />
                <MatRow label={`Edging (${b.edgingM}m)`} val={fmt(b.edgeCost)} />
                <MatRow label="Subtotal"       val={fmt(sub)} subtotal />
              </div>
            </div>
          );
        })}
      </div>

      <div className="total-box">
        <div className="total-rows">
          <TotalRow label="Materials" val={fmt(grandMat)} />
          <TotalRow label="Cutting"   val={fmt(grandCut)} />
          <TotalRow label="Edging"    val={fmt(grandEdge)} />
          {!showIncVat && (
            <TotalRow label="VAT (20%)" val={`£${(grandTotal * VAT).toFixed(2)}`} />
          )}
          <TotalRow label={`Total${vatLabel}`} val={fmt(grandTotal)} grand />
        </div>
        <div style={{ fontSize:11, color:'var(--text-dim)', textAlign:'right', marginTop:-6 }}>
          Optimised: <span className="algo-badge">{algoBadge}</span>
        </div>
      </div>

      <div className="csv-downloads-section">
        <div className="csv-downloads-label">Individual CSVs</div>
        {breakdown.map(b => (
          <div key={b.matId} className="csv-row">
            <span className="csv-row-name" title={b.mat.name}>{b.mat.name}</span>
            <button className="btn-csv" onClick={() => handleDownloadSingle(b.matId)}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v9M4 7l3 3 3-3M1 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              CSV
            </button>
          </div>
        ))}
      </div>

      <div className="submit-area">
        <button className="btn btn-accent" onClick={() => handleDownloadAll(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v10M4 8l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Download All &amp; Send Quote
        </button>
        <button className="btn btn-ghost" onClick={() => handleDownloadAll(false)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v9M4 7l3 3 3-3M1 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Download All CSVs (ZIP)
        </button>
      </div>
    </div>
  );
}

function QuoteHeader({ subtitle }) {
  return (
    <div className="quote-header">
      <div className="quote-title">Live Quote</div>
      <div className="quote-subtitle">{subtitle}</div>
    </div>
  );
}

function MatRow({ label, val, subtotal }) {
  return (
    <div className={`mat-card-row${subtotal ? ' subtotal' : ''}`}>
      <span className="label">{label}</span>
      <span className="val">{val}</span>
    </div>
  );
}

function TotalRow({ label, val, grand }) {
  return (
    <div className={`total-row${grand ? ' grand' : ''}`}>
      <span className="label">{label}</span>
      <span className="val">{val}</span>
    </div>
  );
}
