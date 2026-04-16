'use client';

export default function DimModal({ errors, onClose }) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-icon">⚠️</div>
        <div className="modal-title">Panel Larger Than Board</div>
        <p className="modal-msg">
          One or more panels exceed the sheet dimensions for the selected material.
          Please correct the dimensions or choose a different material.
        </p>
        <div className="modal-detail">
          {errors.map((e, i) => {
            const mat   = e.mat;
            const lenOk = e.len <= mat.sheetW;
            const widOk = e.wid <= mat.sheetH;
            return (
              <div key={i} style={{ marginBottom: i < errors.length - 1 ? 0 : undefined }}>
                <span className="lbl">Material:</span> {mat.name}<br />
                <span className="lbl">Panel: </span>
                <span className={lenOk ? 'ok' : 'bad'}>{e.len}mm</span> (L) ×{' '}
                <span className={widOk ? 'ok' : 'bad'}>{e.wid}mm</span> (W)
                {e.grain && <span style={{ color:'var(--accent)' }}> (grain locked)</span>}
                <br />
                <span className="lbl">Sheet limit: </span>
                <span className="ok">{mat.sheetW}mm</span> × <span className="ok">{mat.sheetH}mm</span>
                {i < errors.length - 1 && <hr style={{ borderColor:'var(--border)', margin:'8px 0' }} />}
              </div>
            );
          })}
        </div>
        <button
          className="btn btn-accent"
          style={{ width:'100%', justifyContent:'center' }}
          onClick={onClose}
        >
          OK — I&apos;ll Correct It
        </button>
      </div>
    </div>
  );
}
