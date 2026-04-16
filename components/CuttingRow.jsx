'use client';

import { MATERIALS, MATERIAL_GROUPS, EDGING_OPTS } from '@/lib/constants';

export default function CuttingRow({ row, rowNum, onChange, onRemove, hasError }) {
  const update = (field, value) => onChange(row.id, field, value);

  return (
    <tr className={hasError ? 'dim-error' : ''}>
      <td><span className="row-num">{rowNum}</span></td>

      <td className="col-mat">
        <select value={row.matId} onChange={e => update('matId', e.target.value)}>
          <option value="">— Select Material —</option>
          {MATERIAL_GROUPS.map(group => (
            <optgroup key={group.label} label={group.label}>
              {group.keys.map(key => (
                <option key={key} value={key}>{MATERIALS[key].name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {hasError && <span className="dim-error-badge">&gt; board</span>}
      </td>

      <td className="col-len">
        <input
          type="number" min="1" max="10000" placeholder="—"
          value={row.len}
          onChange={e => update('len', e.target.value)}
        />
      </td>

      <td className="col-wid">
        <input
          type="number" min="1" max="10000" placeholder="—"
          value={row.wid}
          onChange={e => update('wid', e.target.value)}
        />
      </td>

      <td className="col-qty">
        <input
          type="number" min="1" max="999"
          value={row.qty}
          onChange={e => update('qty', Math.max(1, parseInt(e.target.value) || 1))}
        />
      </td>

      <td className="col-grain">
        <select value={row.grain ? 'Yes' : 'No'} onChange={e => update('grain', e.target.value === 'Yes')}>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </td>

      <td className="col-edge">
        <select value={row.edging} onChange={e => update('edging', e.target.value)}>
          {EDGING_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </td>

      <td className="col-notes">
        <input
          type="text" placeholder="Optional"
          value={row.notes}
          onChange={e => update('notes', e.target.value)}
        />
      </td>

      <td className="col-del">
        <button className="btn-del" onClick={() => onRemove(row.id)} title="Remove">✕</button>
      </td>
    </tr>
  );
}
