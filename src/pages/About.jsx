export default function About() {
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">About ScanSecure</h1>
      <p className="text-muted-foreground">
        ScanSecure is a browser-only website security and malware scanner built with React, Vite and shadcn/ui.
        There is no backend and no database. All analysis runs in your browser and history is stored in localStorage.
      </p>
      <h2 className="text-lg font-semibold">What it checks</h2>
      <ul className="list-disc pl-5 text-sm space-y-1">
        <li>URL and redirect heuristics (HTTPS, IP hosts, punycode, shorteners, suspicious keywords)</li>
        <li>Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer/Permissions Policy)</li>
        <li>TLS via crt.sh certificate transparency</li>
        <li>DNS (A/AAAA/NS/CAA) and SPF/DMARC via dns.google</li>
        <li>Content (mixed content, password forms, trackers, eval/inline JS, iframes)</li>
        <li>Fingerprinting & exposed paths (robots.txt, .git/HEAD, .env, wp-json)</li>
        <li>Reputation & performance/SEO basics</li>
        <li>Malware / URL reputation (heuristics, keyless feed, optional VirusTotal, local blocklist)</li>
      </ul>
      <h2 className="text-lg font-semibold">Honest limits</h2>
      <ul className="list-disc pl-5 text-sm space-y-1">
        <li>No true port scan in-browser.</li>
        <li>VirusTotal / Safe Browsing require API keys (optional, entered locally).</li>
        <li>CORS limits direct fetches; headers/content may need manual paste.</li>
        <li>Keyless public feeds may be unreachable due to CORS; the UI reports this honestly.</li>
      </ul>
    </div>
  );
}
