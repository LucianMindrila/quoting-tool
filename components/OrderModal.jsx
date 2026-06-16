'use client';

import { useState, useEffect } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const TIME_SLOTS_WEEKDAY = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
const TIME_SLOTS_FRIDAY  = ['08:00','09:00','10:00','11:00','12:00','13:00'];

const FALLBACK_HOLIDAYS = [
  '2025-01-01','2025-04-18','2025-04-21','2025-05-05','2025-05-26','2025-08-25','2025-12-25','2025-12-26',
  '2026-01-01','2026-04-03','2026-04-06','2026-05-04','2026-05-25','2026-08-31','2026-12-25','2026-12-28',
  '2027-01-01','2027-03-26','2027-03-29','2027-05-03','2027-05-31','2027-08-30','2027-12-27','2027-12-28',
];

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function isWeekend(d) { const w = d.getDay(); return w === 0 || w === 6; }

function addWorkingDays(from, n, holidays) {
  let count = 0;
  const d = new Date(from);
  while (count < n) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d) && !holidays.includes(toISO(d))) count++;
  }
  return d;
}

function workingDaysBetween(from, to, holidays) {
  let count = 0;
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  while (d <= to) {
    if (!isWeekend(d) && !holidays.includes(toISO(d))) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

export default function OrderModal({ open, jobRef, onClose, onConfirm }) {
  const [type,            setType]            = useState('collection');
  const [selectedDate,    setSelectedDate]    = useState(null);
  const [selectedTime,    setSelectedTime]    = useState('');
  const [address,         setAddress]         = useState({ name:'', line1:'', line2:'', postcode:'' });
  const [calMonth,        setCalMonth]        = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [bankHolidays,    setBankHolidays]    = useState(FALLBACK_HOLIDAYS);
  const [showWarning,     setShowWarning]     = useState(false);

  useEffect(() => {
    fetch('https://www.gov.uk/bank-holidays.json')
      .then(r => r.json())
      .then(data => setBankHolidays(data['england-and-wales'].events.map(e => e.date)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) { setSelectedDate(null); setSelectedTime(''); setShowWarning(false); setType('collection'); }
  }, [open]);

  if (!open) return null;

  const today = new Date(); today.setHours(0,0,0,0);
  const earliest = addWorkingDays(today, 5, bankHolidays);

  function handleDateSelect(date) {
    setSelectedDate(date);
    setSelectedTime('');
    setShowWarning(workingDaysBetween(today, date, bankHolidays) < 5);
  }

  function getTimeSlots(date) {
    return date?.getDay() === 5 ? TIME_SLOTS_FRIDAY : TIME_SLOTS_WEEKDAY;
  }

  function canSubmit() {
    if (!selectedDate || !selectedTime) return false;
    if (type === 'delivery' && (!address.line1.trim() || !address.postcode.trim())) return false;
    return true;
  }

  function handleConfirm() {
    const dateStr = selectedDate.toLocaleDateString('en-GB', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
    const isoDate = toISO(selectedDate);
    onConfirm({ type, date: dateStr, isoDate, time: selectedTime, address: type === 'delivery' ? address : null, earlyDate: showWarning });
  }

  // ── Calendar ──────────────────────────────────────────────────────
  function renderCalendar() {
    const { year, month } = calMonth;
    const firstDow = new Date(year, month, 1).getDay();
    const offset   = firstDow === 0 ? 6 : firstDow - 1; // Mon-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    function prevMonth() {
      setCalMonth(prev => { const d = new Date(prev.year, prev.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; });
    }
    function nextMonth() {
      setCalMonth(prev => { const d = new Date(prev.year, prev.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; });
    }

    return (
      <div>
        {/* Month nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <button onClick={prevMonth} style={s.navBtn}>‹</button>
          <span style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} style={s.navBtn}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
          {DAY_LABELS.map(d => (
            <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'var(--text-muted)', padding:'2px 0' }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
          {cells.map((date, i) => {
            if (!date) return <div key={`e${i}`} />;
            const iso      = toISO(date);
            const isPast   = date < today;
            const isWknd   = isWeekend(date);
            const isBH     = bankHolidays.includes(iso);
            const disabled = isPast || isWknd || isBH;
            const tooSoon  = !disabled && workingDaysBetween(today, date, bankHolidays) < 5;
            const isEarly  = toISO(date) === toISO(earliest);
            const isSel    = selectedDate && toISO(date) === toISO(selectedDate);
            const isToday  = toISO(date) === toISO(today);

            let bg = 'transparent', color = 'var(--text)', border = '1px solid transparent';
            if (disabled)  { color = 'var(--text-dim)'; }
            if (tooSoon)   { color = '#b45309'; }
            if (isEarly && !isSel) { border = '1.5px solid var(--accent)'; color = 'var(--accent)'; }
            if (isToday && !isSel) { border = '1px solid var(--border2)'; }
            if (isSel)     { bg = 'var(--accent)'; color = '#fff'; border = '1px solid var(--accent)'; }

            return (
              <button
                key={iso}
                disabled={disabled}
                onClick={() => !disabled && handleDateSelect(date)}
                title={isBH ? 'Bank holiday' : isWknd ? 'Weekend — closed' : tooSoon ? 'Within 5 working days — may need confirmation' : ''}
                style={{
                  background: bg, color, border, borderRadius: 5,
                  padding: '5px 2px', fontSize: 12, textAlign: 'center',
                  cursor: disabled ? 'default' : 'pointer',
                  opacity: disabled ? 0.28 : 1,
                  fontWeight: isSel || isEarly ? 600 : 400,
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display:'flex', gap:14, marginTop:10, fontSize:10, color:'var(--text-muted)', flexWrap:'wrap' }}>
          <span><span style={{ color:'var(--accent)', fontWeight:700 }}>[ ]</span> Earliest available (5 days)</span>
          <span><span style={{ color:'#b45309' }}>■</span> &lt;5 days — needs confirmation</span>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}
      style={{ zIndex: 1000 }}>
      <div style={s.modal}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:17, color:'var(--text)' }}>Complete Your Order</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Ref: {jobRef}</div>
          </div>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {/* Toggle */}
        <div style={{ marginBottom:20 }}>
          <div style={s.sectionLabel}>Fulfilment Method</div>
          <div style={{ display:'flex', background:'var(--surface2)', borderRadius:8, padding:3, gap:3 }}>
            {[['collection','Collection'],['delivery','Delivery (within 30 miles)']].map(([val, label]) => (
              <button key={val} onClick={() => setType(val)} style={{
                flex:1, padding:'9px 0', borderRadius:6, border:'none', cursor:'pointer',
                fontWeight:600, fontSize:13, transition:'all 0.15s',
                background: type === val ? 'var(--accent)' : 'transparent',
                color: type === val ? '#fff' : 'var(--text-muted)',
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Delivery address */}
        {type === 'delivery' && (
          <div style={{ marginBottom:20 }}>
            <div style={{ background:'#EFF6FF', border:'1.5px solid #93C5FD', borderRadius:8, padding:'11px 14px', marginBottom:14, fontSize:13, color:'#1E40AF', lineHeight:1.5 }}>
              ℹ️ <strong>Delivery is available within a 30-mile radius.</strong> An additional delivery charge will apply — we will contact you to confirm the delivery date, time and cost before processing your order.
            </div>
            <div style={s.sectionLabel}>Delivery Address</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { key:'name',     ph:'Contact name'               },
                { key:'line1',    ph:'Address line 1 *'           },
                { key:'line2',    ph:'Address line 2 (optional)'  },
                { key:'postcode', ph:'Postcode *'                 },
              ].map(({ key, ph }) => (
                <input key={key} type="text" placeholder={ph} value={address[key]}
                  onChange={e => setAddress(p => ({ ...p, [key]: e.target.value }))}
                  style={s.input} />
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        <div style={{ marginBottom:20 }}>
          <div style={s.sectionLabel}>Requested {type === 'collection' ? 'Collection' : 'Delivery'} Date</div>
          {renderCalendar()}
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div style={{ marginBottom:20 }}>
            <div style={s.sectionLabel}>Preferred Time</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {getTimeSlots(selectedDate).map(slot => (
                <button key={slot} onClick={() => setSelectedTime(slot)} style={{
                  padding:'7px 14px', borderRadius:6, fontSize:13, cursor:'pointer',
                  border: selectedTime === slot ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                  background: selectedTime === slot ? 'var(--accent-glow)' : 'var(--surface2)',
                  color: selectedTime === slot ? 'var(--accent)' : 'var(--text)',
                  fontWeight: selectedTime === slot ? 600 : 400,
                }}>{slot}</button>
              ))}
            </div>
          </div>
        )}

        {/* Early date warning */}
        {showWarning && selectedDate && (
          <div style={s.warning}>
            ⚠️ <strong>Our standard lead time is 5 working days.</strong> We will contact you directly to confirm we can achieve your required completion date.
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex:1 }}>Cancel</button>
          <button onClick={handleConfirm} disabled={!canSubmit()} className="btn btn-accent"
            style={{ flex:2, opacity: canSubmit() ? 1 : 0.45, cursor: canSubmit() ? 'pointer' : 'not-allowed' }}>
            Confirm &amp; Place Order
          </button>
        </div>

      </div>
    </div>
  );
}

const s = {
  modal: {
    background:'var(--surface)', borderRadius:12, width:'100%', maxWidth:500,
    maxHeight:'90vh', overflowY:'auto', padding:28,
    boxShadow:'0 8px 40px rgba(0,0,0,0.18)',
  },
  sectionLabel: {
    fontSize:10, fontWeight:700, textTransform:'uppercase',
    letterSpacing:'0.09em', color:'var(--text-muted)', marginBottom:8,
  },
  navBtn: {
    background:'none', border:'none', fontSize:20, cursor:'pointer',
    color:'var(--text-muted)', padding:'0 10px', lineHeight:1,
  },
  closeBtn: {
    background:'none', border:'none', fontSize:20, cursor:'pointer',
    color:'var(--text-muted)', lineHeight:1, padding:0,
  },
  input: {
    padding:'8px 10px', borderRadius:6, border:'1px solid var(--border)',
    background:'var(--bg)', color:'var(--text)', fontSize:13, width:'100%',
  },
  warning: {
    background:'#FFFBEB', border:'1.5px solid #F59E0B', borderRadius:8,
    padding:'12px 14px', marginBottom:16, fontSize:13, color:'#78350F', lineHeight:1.5,
  },
};
