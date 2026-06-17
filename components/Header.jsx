'use client';

export default function Header() {
  return (
    <header className="site-header">
      <svg viewBox="0 0 200 64" width="140" height="45" xmlns="http://www.w3.org/2000/svg" aria-label="Cutting Edge">
        <defs>
          <clipPath id="ce-hdr"><rect x="6" y="4" width="44" height="56" rx="5"/></clipPath>
        </defs>
        <rect x="6" y="4" width="44" height="56" rx="5" fill="#0F6E56"/>
        <polygon points="6,4 42,4 10,60 6,60" fill="#1D9E75" clipPath="url(#ce-hdr)"/>
        <g clipPath="url(#ce-hdr)">
          <line x1="42" y1="4" x2="10" y2="60" stroke="#A8EDD6" strokeWidth="10" strokeOpacity="0.18" strokeLinecap="round"/>
          <line x1="42" y1="4" x2="10" y2="60" stroke="#FFFFFF" strokeWidth="5" strokeOpacity="0.22" strokeLinecap="round"/>
          <line x1="42" y1="4" x2="10" y2="60" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round"/>
        </g>
        <circle cx="42" cy="4" r="2.2" fill="#FFFFFF"/>
        <circle cx="10" cy="60" r="2.2" fill="#FFFFFF"/>
        <text x="62" y="20" fontFamily="system-ui,sans-serif" fontSize="16" fontWeight="700" fill="#ffffff">Cutting</text>
        <text x="60" y="50" fontFamily="system-ui,sans-serif" fontSize="27" fontWeight="700" fill="#9FE1CB">EDGE</text>
      </svg>
      <span className="header-tag">One stop shop for all your panel processing</span>
    </header>
  );
}
