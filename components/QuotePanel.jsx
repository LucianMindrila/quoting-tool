'use client';

import { useState } from 'react';
import { downloadQuotePDF } from '@/lib/pdfExport';
import { MATERIALS, VAT } from '@/lib/constants';
import NestingDiagram from './NestingDiagram';

export default function QuotePanel({
  breakdown, grandMat, grandCut, grandEdge,
  dimErrorCount, hasRows,
  showIncVat, customerName, customerEmail, jobRef,
  onShowToast,
}) {
  const [ordering, setOrdering] = useState(false);

  const grandTotal = (grandMat ?? 0) + (grandCut ?? 0) + (grandEdge ?? 0);
  const m        = 1 + VAT;
  const vatLabel = ' (inc. VAT)';
  const fmt      = v => `£${(v * m).toFixed(2)}`;

  const customer = customerName || 'Customer';
  const ref      = jobRef       || 'Job';

  async function handleDownloadQuote() {
    if (!breakdown) return;
    try {
      await downloadQuotePDF({
        customerName: customer,
        customerEmail,
        jobRef: ref,
        breakdown,
        grandMat, grandCut, grandEdge,
        showIncVat,
      });
      onShowToast('✓ Quote PDF downloaded');
    } catch (err) {
      console.error('[QuotePanel] PDF error', err);
      onShowToast('⚠ Failed to generate PDF');
    }
  }

  async function handlePlaceOrder() {
    if (!customerEmail) {
      onShowToast('⚠ Add a customer email in Job Details to place an order');
      return;
    }
    if (!breakdown) return;

    setOrdering(true);
    try {
      const res  = await fetch('/api/send-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer,
          customerEmail,
          jobRef: ref,
          breakdown,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        onShowToast(`✓ Order placed — confirmation sent to ${customerEmail}`);
      } else {
        onShowToast(`⚠ Email failed: ${data.error || 'unknown error'}`);
      }
    } catch (err) {
      console.error('[QuotePanel] place-order error', err);
      onShowToast(`⚠ Error: ${err.message}`);
    } finally {
      setOrdering(false);
    }
  }

  // ── Empty state ──────────────────────────────────────────────────
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

  // ── Dim error state ──────────────────────────────────────────────
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

  // ── Loading state ────────────────────────────────────────────────
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
              <NestingDiagram
                layout={b.layout}
                sheetW={b.mat.sheetW}
                sheetH={b.mat.sheetH}
                pieces={b.pieces}
              />
            </div>
          );
        })}
      </div>

      <div className="total-box">
        <div className="total-rows">
          <TotalRow label="Materials" val={fmt(grandMat)} />
          <TotalRow label="Cutting"   val={fmt(grandCut)} />
          <TotalRow label="Edging"    val={fmt(grandEdge)} />
          <TotalRow label="Total (inc. VAT)" val={fmt(grandTotal)} grand />
        </div>
        <div style={{ fontSize:11, color:'var(--text-dim)', textAlign:'right', marginTop:4 }}>
          All prices include VAT (20%)
        </div>
        <div style={{ fontSize:11, color:'var(--text-dim)', textAlign:'right', marginTop:2 }}>
          Optimised: <span className="algo-badge">{algoBadge}</span>
        </div>
      </div>

      <div className="submit-area">
        <button className="btn btn-outline" onClick={handleDownloadQuote}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 2v4h4M8 8v5M6 11l2 2 2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Download Quote
        </button>
        <button
          className="btn btn-accent"
          onClick={handlePlaceOrder}
          disabled={ordering}
        >
          {ordering ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation:'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" strokeLinecap="round"/>
              </svg>
              Sending…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 3l12 5-12 5V9.5l8-1.5-8-1.5V3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Place Order
            </>
          )}
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
