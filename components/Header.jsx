'use client';

export default function Header({ showIncVat, onSetVat }) {
  return (
    <header className="site-header">
      <a href="https://dtsolutionsltd.co.uk" className="logo">
        DT <span>Solutions</span>
      </a>
      <span className="header-tag">Panel Sizing Quote</span>
      <div className="header-actions">
        <div className="vat-toggle">
          <button
            className={!showIncVat ? 'active' : ''}
            onClick={() => onSetVat(false)}
          >
            Ex VAT
          </button>
          <button
            className={showIncVat ? 'active' : ''}
            onClick={() => onSetVat(true)}
          >
            Inc VAT
          </button>
        </div>
      </div>
    </header>
  );
}
