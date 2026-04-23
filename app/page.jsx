'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import CuttingTable from '@/components/CuttingTable';
import QuotePanel from '@/components/QuotePanel';
import DimModal from '@/components/DimModal';
import MatPicker from '@/components/MatPicker';
import Toast from '@/components/Toast';
import { MATERIALS, EDGING_COST_PM, calcEdgingMm } from '@/lib/constants';
import { panelFits, optimiseSheets } from '@/lib/optimizer';

let _nextId = 1;
function newId() { return _nextId++; }

function makeRow(defaults = {}) {
  return {
    id:        newId(),
    matId:     defaults.matId  || '',
    len:       defaults.len    != null ? String(defaults.len) : '',
    wid:       defaults.wid    != null ? String(defaults.wid) : '',
    qty:       defaults.qty    || 1,
    grain:     defaults.grain === 'Yes' || defaults.grain === true,
    edging:    defaults.edging    || 'No Edge',
    edgeThick: defaults.edgeThick || '1mm',
    notes:     defaults.notes     || '',
  };
}

export default function Home() {
  const [rows,          setRows]          = useState(() => [makeRow(), makeRow(), makeRow()]);
  const [showIncVat,    setShowIncVat]    = useState(false);
  const [customerName,  setCustomerName]  = useState('');
  const [jobRef,        setJobRef]        = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [dimModal,     setDimModal]     = useState(null);
  const [toastMsg,     setToastMsg]     = useState(null);
  const [pickerOpen,   setPickerOpen]   = useState(false);
  const [pickerRowId,  setPickerRowId]  = useState(null);
  const toastTimer = useRef(null);

  // ── Toast ────────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3200);
  }, []);

  // ── Row mutations ────────────────────────────────────────────
  const addRows = useCallback((count = 1, defaults = {}) => {
    setRows(prev => {
      const newRows = [];
      for (let i = 0; i < count; i++) {
        const d = Array.isArray(defaults) ? (defaults[i] || {}) : defaults;
        newRows.push(makeRow(d));
      }
      return [...prev, ...newRows];
    });
  }, []);

  const removeRow = useCallback((id) => {
    setRows(prev => prev.filter(r => r.id !== id));
  }, []);

  const updateRow = useCallback((id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  const importRows = useCallback((imported) => {
    setRows(prev => {
      // Remove blank rows before appending
      const nonBlank = prev.filter(r => r.matId || r.len || r.wid);
      return [...nonBlank, ...imported.map(d => makeRow(d))];
    });
  }, []);

  const clearAll = useCallback(() => {
    if (!confirm('Clear all rows?')) return;
    setRows([]);
  }, []);

  const openPicker = useCallback((rowId) => {
    setPickerRowId(rowId);
    setPickerOpen(true);
  }, []);

  const handlePickerSelect = useCallback((matId) => {
    if (pickerRowId != null) updateRow(pickerRowId, 'matId', matId);
    setPickerOpen(false);
    setPickerRowId(null);
  }, [pickerRowId, updateRow]);

  // ── Dimension errors (fast, synchronous) ────────────────────
  const dimErrors = useMemo(() => {
    return rows.filter(r => {
      if (!r.matId || !r.len || !r.wid) return false;
      const len = parseFloat(r.len);
      const wid = parseFloat(r.wid);
      if (isNaN(len) || isNaN(wid)) return false;
      return !panelFits(len, wid, r.grain, MATERIALS[r.matId]);
    }).map(r => ({
      id:    r.id,
      len:   parseFloat(r.len),
      wid:   parseFloat(r.wid),
      grain: r.grain,
      matId: r.matId,
      mat:   MATERIALS[r.matId],
    }));
  }, [rows]);

  const dimErrorIds = useMemo(() => new Set(dimErrors.map(e => e.id)), [dimErrors]);

  // Show modal automatically when a new error appears
  const prevErrorIds = useRef(new Set());
  useEffect(() => {
    const newErrors = dimErrors.filter(e => !prevErrorIds.current.has(e.id));
    if (newErrors.length > 0) setDimModal(newErrors);
    prevErrorIds.current = dimErrorIds;
  }, [dimErrors, dimErrorIds]);

  // ── Quote calculation (debounced — optimizer can be slow) ────
  const [breakdown, setBreakdown] = useState(null);
  const [quoteGrand, setQuoteGrand] = useState({ mat: 0, cut: 0, edge: 0 });
  const calcTimer = useRef(null);

  const hasValidRows = rows.some(r => r.matId && r.len && r.wid);

  useEffect(() => {
    clearTimeout(calcTimer.current);

    if (!hasValidRows || dimErrors.length > 0) {
      setBreakdown(null);
      setQuoteGrand({ mat: 0, cut: 0, edge: 0 });
      return;
    }

    calcTimer.current = setTimeout(() => {
      const validRows = rows
        .filter(r => r.matId && r.len && r.wid)
        .map(r => ({ ...r, len: parseFloat(r.len), wid: parseFloat(r.wid) }))
        .filter(r => !isNaN(r.len) && !isNaN(r.wid));

      // Group by material
      const matGroups = {};
      for (const r of validRows) {
        if (!matGroups[r.matId]) matGroups[r.matId] = [];
        matGroups[r.matId].push(r);
      }

      let grandMat = 0, grandCut = 0, grandEdge = 0;
      const result = [];

      for (const [matId, pieces] of Object.entries(matGroups)) {
        const mat     = MATERIALS[matId];
        const nPieces = pieces.reduce((s, p) => s + p.qty, 0);
        const sheets  = optimiseSheets(pieces, mat);

        let totalEdgeMm = 0;
        for (const p of pieces) totalEdgeMm += calcEdgingMm(p.len, p.wid, p.qty, p.edging);
        const edgingM = Math.ceil(totalEdgeMm / 1000 * 1.1);

        const matCost  = sheets * mat.price;
        const cutCost  = sheets * mat.cutCost;
        const edgeCost = edgingM * EDGING_COST_PM;

        grandMat  += matCost;
        grandCut  += cutCost;
        grandEdge += edgeCost;

        result.push({ mat, matId, pieces, sheets, nPieces, edgingM, matCost, cutCost, edgeCost });
      }

      setBreakdown(result);
      setQuoteGrand({ mat: grandMat, cut: grandCut, edge: grandEdge });
    }, 150);

    return () => clearTimeout(calcTimer.current);
  }, [rows, dimErrors, hasValidRows]);

  return (
    <>
      <Header showIncVat={showIncVat} onSetVat={setShowIncVat} />

      <div className="main-wrap">
        <CuttingTable
          rows={rows}
          dimErrorIds={dimErrorIds}
          customerName={customerName}
          jobRef={jobRef}
          customerEmail={customerEmail}
          onCustomerChange={setCustomerName}
          onJobRefChange={setJobRef}
          onCustomerEmailChange={setCustomerEmail}
          onAddRows={addRows}
          onRemoveRow={removeRow}
          onUpdateRow={updateRow}
          onImportRows={importRows}
          onClearAll={clearAll}
          onShowToast={showToast}
          onOpenPicker={openPicker}
        />

        <QuotePanel
          breakdown={breakdown}
          grandMat={quoteGrand.mat}
          grandCut={quoteGrand.cut}
          grandEdge={quoteGrand.edge}
          dimErrorCount={dimErrors.length}
          hasRows={hasValidRows}
          showIncVat={showIncVat}
          customerName={customerName || 'Customer'}
          customerEmail={customerEmail}
          jobRef={jobRef || 'Job'}
          onShowToast={showToast}
        />
      </div>

      <DimModal errors={dimModal} onClose={() => setDimModal(null)} />
      <MatPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handlePickerSelect} />
      <Toast message={toastMsg} />
    </>
  );
}
