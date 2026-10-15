# ScanSecure — URL-only Security & Malware Scanner

React + Vite (JSX) + shadcn/ui + Tailwind. **No backend, no database.** All checks run in the browser; history stored in `localStorage`.

## Run

```bash
cd scan-secure
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run build    # static dist/ -> deploy to Vercel/Netlify/GitHub Pages
```

## What it scans (all client-side, keyless)

- URL / HTTPS / redirect / punycode / homograph heuristics
- Security headers (HSTS/CSP/X-Frame/X-Content-Type/Referrer/Permissions) with CORS fallback
- TLS via crt.sh (expiry, wildcard)
- DNS via dns.google (A/AAAA/NS/CAA) + SPF/DMARC
- Content (worker): mixed content, password forms, trackers, eval, iframes
- Fingerprint + exposed paths (robots.txt, .git/HEAD, .env, wp-json)
- Reputation heuristics, performance/SEO basics
- Malware / URL reputation: heuristics + keyless OpenPhish feed attempt + optional VirusTotal key (local) + local blocklist + outbound lookups

## Scoring

0-100 with deductions: critical -25, high -15, medium -7, low -2. Grades A-F. History capped at 50, JSON export, print-to-PDF.

## Limits (honest)

- No real port scan in-browser.
- VirusTotal / Safe Browsing require user-provided API keys.
- CORS blocks many direct fetches; the UI reports "unavailable" and offers manual paste where applicable.
- Keyless public feeds may be unreachable from the browser.

## Stack

Vite 5, React 18, Tailwind 3, shadcn/ui (Radix + CVA), lucide-react, react-router-dom 6, vitest + testing-library.