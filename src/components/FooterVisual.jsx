export default function FooterVisual({ className = '' }) {
  return (
    <div className={className} role="img" aria-label="Site security illustration">
      <svg viewBox="0 0 400 300" className="h-auto w-full" aria-hidden="true">
        <defs>
          <linearGradient id="fv-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <rect x="10" y="10" width="380" height="280" rx="24" fill="url(#fv-bg)" stroke="#ffffff" strokeOpacity="0.12" />
        {/* grid */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`v${i}`} x1={40 + i * 60} y1="20" x2={40 + i * 60} y2="280" stroke="#ffffff" strokeOpacity="0.08" />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`h${i}`} x1="20" y1={60 + i * 50} x2="380" y2={60 + i * 50} stroke="#ffffff" strokeOpacity="0.08" />
        ))}

        {/* orbit rings */}
        <circle cx="200" cy="150" r="90" fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeDasharray="6 8">
          <animateTransform attributeName="transform" type="rotate" from="0 200 150" to="360 200 150" dur="24s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="150" r="65" fill="none" stroke="#ffffff" strokeOpacity="0.15" />

        {/* shield */}
        <g>
          <path
            d="M200 70 L260 92 V150 C260 195 232 225 200 240 C168 225 140 195 140 150 V92 Z"
            fill="#0a0a0a"
            stroke="#ffffff"
            strokeOpacity="0.85"
            strokeWidth="2"
          />
          <path d="M178 150 L195 167 L224 133" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* floating pills */}
        <g fontFamily="inherit" fontSize="12">
          <rect x="38" y="72" width="120" height="30" rx="15" fill="#ffffff" opacity="0.95" />
          <circle cx="54" cy="87" r="7" fill="#000000" />
          <text x="66" y="91" fill="#000000" fontWeight="700">No malware</text>

          <rect x="242" y="112" width="120" height="30" rx="15" fill="#ffffff" opacity="0.95" />
          <circle cx="258" cy="127" r="7" fill="#000000" />
          <text x="270" y="131" fill="#000000" fontWeight="700">TLS OK</text>

          <rect x="52" y="196" width="132" height="30" rx="15" fill="#ffffff" opacity="0.95" />
          <circle cx="68" cy="211" r="7" fill="#000000" />
          <text x="80" y="215" fill="#000000" fontWeight="700">Headers pass</text>
        </g>

        {/* scan line */}
        <rect x="140" y="120" width="120" height="4" rx="2" fill="#ffffff" opacity="0.8">
          <animate attributeName="y" values="100;180;100" dur="5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="5s" repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  );
}
