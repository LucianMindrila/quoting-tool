'use client';

export default function Header() {
  return (
    <header className="site-header">
      <div className="logo-lockup">
        <svg viewBox="0 0 56 64" width="42" height="48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs><clipPath id="ce-hdr"><rect x="0" y="0" width="50" height="64" rx="5"/></clipPath></defs>
          <rect x="0" y="0" width="50" height="64" rx="5" fill="#ffffff" fillOpacity="0.2"/>
          <g clipPath="url(#ce-hdr)">
            <line x1="40" y1="0" x2="8" y2="64" stroke="#ffffff" strokeWidth="14" strokeOpacity="0.15" strokeLinecap="round"/>
            <line x1="40" y1="0" x2="8" y2="64" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
          </g>
          <circle cx="40" cy="0" r="2.5" fill="#ffffff"/>
          <circle cx="8" cy="64" r="2.5" fill="#ffffff"/>
        </svg>
        <div className="logo-text">
          <span className="logo-cutting">Cutting</span>
          <span className="logo-edge">EDGE</span>
        </div>
      </div>
      <span className="header-tag">One stop shop for all your panel processing</span>
    </header>
  );
}
