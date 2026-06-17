'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MFC_DECORS, PS_GLOSS_DECORS, PS_MATT_DECORS, TM_DECORS,
  EGGER_GRP_PRICE, MATERIALS,
} from '@/lib/constants';

const fmt = v => Number(v).toFixed(2);

const MDF_IDS   = ['mdf-6','mdf-9','mdf-12','mdf-15','mdf-18-2440','mdf-22','mdf-25'];
const MRMDF_IDS = ['mrmdf-6','mrmdf-9','mrmdf-12','mrmdf-18-2440','mrmdf-25'];
const FREE_IDS = ['free-issued-2800','free-issued-3050','free-issued-2440'];

const MFC_GROUPS = [2,3,4,5,6,7,8,9,10];

export default function MatPicker({ open, onClose, onSelect }) {
  const [tab,      setTab]      = useState('egger');
  const [subTab,   setSubTab]   = useState('mfc18');
  const [grpFilter, setGrpFilter] = useState('all');
  const [search,   setSearch]   = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSearch('');
      setTimeout(() => searchRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => { setSearch(''); setGrpFilter('all'); }, [tab, subTab]);

  if (!open) return null;

  function pick(matId) { onSelect(matId); onClose(); }

  // ── Egger MFC items (18mm or 8mm) ─────────────────────────────
  function getMfcItems(prefix) {
    const q = search.toLowerCase().trim();
    let items = MFC_DECORS
      .filter(d => grpFilter === 'all' || d.grp === Number(grpFilter))
      .filter(d => !q || d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q));
    return items.map(d => ({ matId: `${prefix}-${d.id}`, code: d.code, name: d.name, grp: d.grp }));
  }

  // Group items by Egger group number
  function groupByGrp(items) {
    const groups = {};
    for (const item of items) {
      if (!groups[item.grp]) groups[item.grp] = [];
      groups[item.grp].push(item);
    }
    return groups;
  }

  const eggerSubTabs = [
    { id:'mfc18',    label:'MFC 18mm' },
    { id:'mfc8',     label:'MFC 8mm'  },
    { id:'ps-gloss', label:'PS Gloss' },
    { id:'ps-matt',  label:'PS Matt'  },
    { id:'tm',       label:'TM'       },
  ];

  // ── Render Egger body ──────────────────────────────────────────
  function renderEgger() {
    const isMfc = subTab === 'mfc18' || subTab === 'mfc8';
    const prefix = subTab === 'mfc18' ? 'eg18' : 'eg8';

    if (isMfc) {
      const items = getMfcItems(prefix);
      const grouped = grpFilter === 'all' ? groupByGrp(items) : { [grpFilter]: items };
      return (
        <>
          {/* Group filter pills */}
          <div className="picker-sub-tabs">
            <button className={`picker-sub-tab ${grpFilter === 'all' ? 'active' : ''}`} onClick={() => setGrpFilter('all')}>All</button>
            {MFC_GROUPS.map(g => (
              <button key={g} className={`picker-sub-tab ${grpFilter == g ? 'active' : ''}`} onClick={() => setGrpFilter(g)}>
                Grp {g} — £{fmt(EGGER_GRP_PRICE[g])}
              </button>
            ))}
          </div>
          <input
            ref={searchRef}
            className="picker-search"
            placeholder="Search by code or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {items.length === 0 && <div className="picker-no-results">No decors match your search.</div>}
          {Object.entries(grouped).map(([grp, grpItems]) => (
            <div key={grp}>
              <div className="picker-group-label">
                Group {grp}
                <span className="grp-price">£{fmt(EGGER_GRP_PRICE[grp])}/sht</span>
              </div>
              {grpItems.map(item => (
                <div key={item.matId} className="picker-item" onClick={() => pick(item.matId)}>
                  <span className="picker-item-code">{item.code}</span>
                  <span className="picker-item-name">{item.name}</span>
                </div>
              ))}
            </div>
          ))}
        </>
      );
    }

    if (subTab === 'ps-gloss') return renderSimpleList(PS_GLOSS_DECORS.map(d => ({ matId:'eg-'+d.id, code:d.code, name:d.name, price:`£${fmt(182)}/sht` })));
    if (subTab === 'ps-matt')  return renderSimpleList(PS_MATT_DECORS.map(d => ({ matId:'eg-'+d.id, code:d.code, name:d.name, price:`£${fmt(194)}/sht` })));
    if (subTab === 'tm') {
      const byType = {};
      TM_DECORS.forEach(d => {
        if (!byType[d.tmtype]) byType[d.tmtype] = [];
        byType[d.tmtype].push({ matId:'eg-'+d.id, code:d.code, name:d.name, price:`£${fmt(d.price)}/sht` });
      });
      return (
        <>
          {Object.entries(byType).map(([type, items]) => (
            <div key={type}>
              <div className="picker-group-label">{type}</div>
              {renderSimpleList(items, true)}
            </div>
          ))}
        </>
      );
    }
  }

  function renderSimpleList(items, noWrap = false) {
    const content = (
      <div className="picker-simple-list">
        {items.map(item => (
          <div key={item.matId} className="picker-simple-item" onClick={() => pick(item.matId)}>
            <span className="picker-item-code" style={{ minWidth:110 }}>{item.code}</span>
            <span className="picker-simple-name">{item.name}</span>
            {item.price && <span className="picker-simple-price">{item.price}</span>}
            {item.free  && <span className="picker-simple-free">{item.free}</span>}
            {item.cut   && <span className="picker-simple-cut">{item.cut}</span>}
          </div>
        ))}
      </div>
    );
    return noWrap ? content : <>{content}</>;
  }

  function renderMdf() {
    return renderSimpleList(MDF_IDS.map(id => ({
      matId: id,
      code:  MATERIALS[id].display,
      name:  '',
      price: MATERIALS[id].price ? `£${fmt(MATERIALS[id].price)}/sht` : undefined,
    })));
  }

  function renderMrMdf() {
    return renderSimpleList(MRMDF_IDS.map(id => ({
      matId: id,
      code:  MATERIALS[id].display,
      name:  '',
      price: `£${fmt(MATERIALS[id].price)}/sht`,
    })));
  }

  function renderFree() {
    return renderSimpleList(FREE_IDS.map(id => ({
      matId: id,
      code:  MATERIALS[id].display,
      name:  '',
      free:  'Free — your board',
      cut:   `Cut: £${fmt(MATERIALS[id].cutCost)}/sht`,
    })));
  }

  return (
    <div className="modal-overlay picker-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="picker-box">
        {/* Header */}
        <div className="picker-header">
          <div className="picker-title">
            <span>Select Material</span>
            <button className="picker-close" onClick={onClose}>✕</button>
          </div>
          <div className="picker-top-tabs">
            {[
              { id:'egger', label:'Egger'       },
              { id:'mdf',   label:'MDF'          },
              { id:'mrmdf', label:'MR MDF'       },
              { id:'free',  label:'Free Issued'  },
            ].map(t => (
              <button
                key={t.id}
                className={`picker-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => { setTab(t.id); if (t.id === 'egger') setSubTab('mfc18'); }}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'egger' && (
            <div className="picker-egger-subtabs">
              {eggerSubTabs.map(s => (
                <button
                  key={s.id}
                  className={`picker-sub-tab ${subTab === s.id ? 'active' : ''}`}
                  onClick={() => setSubTab(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="picker-body">
          {tab === 'egger' && renderEgger()}
          {tab === 'mdf'   && renderMdf()}
          {tab === 'mrmdf' && renderMrMdf()}
          {tab === 'free'  && renderFree()}
        </div>
      </div>
    </div>
  );
}
