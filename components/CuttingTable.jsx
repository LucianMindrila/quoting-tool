'use client';

import { useRef } from 'react';
import CuttingRow from './CuttingRow';
import { EDGING_LABELS } from '@/lib/constants';
import { processFile } from '@/lib/fileImport';

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim());
}

export default function CuttingTable({
  rows, dimErrorIds,
  customerName, jobRef, customerEmail,
  onCustomerChange, onJobRefChange, onCustomerEmailChange,
  onAddRows, onRemoveRow, onUpdateRow, onImportRows,
  onClearAll, onShowToast, onOpenPicker,
}) {
  const fileInputRef = useRef(null);
  const uploadBtnRef = useRef(null);

  const jobDetailsValid =
    customerName.trim().length > 0 &&
    jobRef.trim().length > 0 &&
    isValidEmail(customerEmail);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    processFile(
      file,
      (importedRows) => {
        if (!importedRows.length) { onShowToast('⚠ No valid rows found in file'); return; }
        onImportRows(importedRows);
        uploadBtnRef.current?.classList.add('flash');
        setTimeout(() => uploadBtnRef.current?.classList.remove('flash'), 600);
        onShowToast(`✓ Imported ${importedRows.length} row${importedRows.length !== 1 ? 's' : ''}`);
        e.target.value = '';
      },
      () => {
        onShowToast('⚠ Could not read file — check it is a valid Excel or CSV');
        e.target.value = '';
      },
    );
  }

  function handleDrop(e) {
    e.preventDefault();
    uploadBtnRef.current?.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    processFile(
      file,
      (importedRows) => {
        if (!importedRows.length) { onShowToast('⚠ No valid rows found in file'); return; }
        onImportRows(importedRows);
        onShowToast(`✓ Imported ${importedRows.length} row${importedRows.length !== 1 ? 's' : ''}`);
      },
      () => onShowToast('⚠ Could not read file — check it is a valid Excel or CSV'),
    );
  }

  return (
    <div className="left-panel">

      <div className="section-title">Job Details</div>
      <div className="job-info job-info-3">
        <div className="field-group">
          <label className="field-label">Customer Name *</label>
          <input
            type="text" placeholder="e.g. Smith Joinery"
            value={customerName} onChange={e => onCustomerChange(e.target.value)}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Job Reference *</label>
          <input
            type="text" placeholder="e.g. JOB-2024-001"
            value={jobRef} onChange={e => onJobRefChange(e.target.value)}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Customer Email *</label>
          <input
            type="email" placeholder="e.g. client@example.com"
            value={customerEmail}
            onChange={e => onCustomerEmailChange(e.target.value)}
            className={customerEmail && !isValidEmail(customerEmail) ? 'field-invalid' : ''}
          />
        </div>
      </div>

      <div className="section-title">Cutting List</div>

      <div className="notice">
        <strong>Edging:</strong> Unless stated otherwise in the Notes column, all edging is assumed
        to match the board decor. Please select your preferred edging thickness (1mm or 2mm) and
        specify the edge profile required. If a different decor is needed for the edging, kindly note
        the decor code in the Notes column and our team will be in touch to confirm availability and
        any price adjustments.
      </div>
      <div className="cutting-list-section" style={{ position: 'relative' }}>
        {!jobDetailsValid && (
          <div className="table-lock-overlay">
            <div className="table-lock-msg">
              🔒 Complete all Job Details above to unlock the cutting list
            </div>
          </div>
        )}

        <div className="table-wrap" style={!jobDetailsValid ? { pointerEvents: 'none', opacity: 0.35 } : {}}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th className="col-mat">Material / Thickness</th>
                <th className="col-len">Length&nbsp;(mm)</th>
                <th className="col-wid">Width&nbsp;(mm)</th>
                <th className="col-qty">Qty</th>
                <th className="col-grain">
                  Grain&nbsp;
                  <span className="help" data-tip="YES = cannot rotate. Grain runs along Length (sheet's long axis).">?</span>
                </th>
                <th className="col-edge">
                  Edge Profile&nbsp;
                  <span className="help" data-tip="L=Length edge, W=Width edge. E1L=1 long edge. EAR=all round.">?</span>
                </th>
                <th className="col-thick">Thickness</th>
                <th className="col-notes">Notes</th>
                <th className="col-del">✕</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <CuttingRow
                  key={row.id}
                  row={row}
                  rowNum={idx + 1}
                  onChange={onUpdateRow}
                  onRemove={onRemoveRow}
                  onOpenPicker={onOpenPicker}
                  hasError={dimErrorIds.has(row.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-actions" style={{ marginBottom: 28, ...(jobDetailsValid ? {} : { pointerEvents: 'none', opacity: 0.35 }) }}>
          <button className="btn btn-outline" onClick={() => onAddRows(1)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Row
          </button>
          <button className="btn btn-outline" onClick={() => onAddRows(5)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add 5 Rows
          </button>

          <div style={{ width:1, background:'var(--border2)', margin:'0 4px', alignSelf:'stretch' }} />

          <input
            ref={fileInputRef}
            type="file" accept=".xlsx,.xls,.csv"
            style={{ display:'none' }}
            onChange={handleFileSelect}
          />
          <button
            ref={uploadBtnRef}
            className="btn btn-upload"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); uploadBtnRef.current?.classList.add('drag-over'); }}
            onDragLeave={() => uploadBtnRef.current?.classList.remove('drag-over')}
            onDrop={handleDrop}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2M8 2v8M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Import Excel / CSV
          </button>

          <a
            className="btn btn-template"
            href="/Template-Master.xlsx"
            download
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 2v4h4M6 9h4M6 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Download Template
          </a>

          <button className="btn btn-ghost" onClick={onClearAll} style={{ marginLeft:'auto' }}>
            Clear All
          </button>
        </div>
      </div>

      <div className="section-title">Edging Key</div>
      <div className="edge-legend">
        {Object.entries(EDGING_LABELS).map(([code, desc]) => (
          <div key={code} className="edge-item">
            <span className="edge-code">{code}</span>
            <span className="edge-desc">{desc}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
