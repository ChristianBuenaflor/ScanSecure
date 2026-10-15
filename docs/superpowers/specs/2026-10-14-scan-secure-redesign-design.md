# ScanSecure Website — Design Spec

**Date:** 2026-10-14
**Status:** Approved in chat (pending written review)
**Location:** `C:\Users\SnL Virtual Partner\Music\scan-secure`

## Problem

Build a client-side website that scans a website's security posture and performs a malware/URL-reputation check, using **React + Vite + shadcn/ui**, with **no backend and no database**. All analysis runs in the browser. Findings are persisted only in `localStorage`.

## Constraints

- No server, no database, no secret keys committed.
- Network calls are best-effort and must degrade gracefully under CORS.
- JS/JSX (not TypeScript), per user choice.
- True shadcn/ui look & behavior (Radix primitives + CVA + Tailwind).

## Architecture

- **Stack:** Vite 5, React 18 (JSX), Tailwind CSS 3, shadcn/ui components adapted to JSX on top of `@radix-ui/*`, `lucide-react`, `react-router-dom` v6, `clsx`, `tailwind-merge`, `class-variance-authority`.
- **Dev:** vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer, vitest, @testing-library/react, jsdom, eslint.
- **Folders:**
  - `src/components/ui/` shadcn primitives
  - `src/components/` feature components (Navbar, ScoreRing, UrlForm, FindingsList, HistoryTable, ExportBar)
  - `src/pages/` Home, Scan, History, About
  - `src/engine/` pure check functions
  - `src/lib/` cn, storage, api, export, normalize
  - `src/workers/analyzer.worker.js`
- **Data flow:** normalize → orchestrator runs checks with progress → findings → scoring → render. History saved to localStorage (max 50).

## UI (shadcn, JSX)

Components: `button, card, input, badge, alert, progress, tabs, accordion, dialog, skeleton, dropdown-menu` (as needed), each on Radix + CVA + `cn()`. Dark theme default with CSS-variable tokens; light toggle persisted.

## Security engine (client-side)

- `normalize.js` — parse/validate URL, enforce HTTPS, strip hash, detect IP literal, IDN/punycode, length, auth info.
- `urlIntel.js` — protocol, redirects, TLD risk, suspicious keywords, shorteners, homograph hints.
- `headersCheck.js` — fetch headers with CORS fallback + manual paste dialog.
- `tlsCert.js` — crt.sh certificate expiry/wildcard/issuer.
- `dnsEmail.js` — dns.google A/AAAA/NS/CAA + SPF/DMARC TXT.
- `contentCheck` (worker) — mixed content, password forms over HTTP, trackers, eval/inline scripts, iframes.
- `fingerprint.js` + exposed path probes (robots.txt, .git/HEAD, .env, wp-json).
- `reputation.js` — heuristics + local blacklist.
- `performance.js` — TTFB/content size/SEO basics.
- `scoring.js` — 0–100, deductions critical -25, high -15, medium -7, low -2; grades A–F.
- `severity.js` — grouping + sorting.
- `orchestrator.js` — parallel checks with progress events, partial results, abort.

## Malware / URL reputation (no backend) — core feature

`engine/malware.js`:

- Heuristic risk: suspicious TLD, IP host, punycode, shorteners, phishing keywords, data: URIs, @ in authority.
- Keyless feed attempt: fetch public feed with 6s timeout, CORS fallback; honestly report "feed unavailable".
- Optional user VirusTotal API key (localStorage only, sent only to VirusTotal).
- Local user blocklist/allowlist in localStorage.
- Outbound quick-links to VirusTotal, URLhaus, PhishTank, Google Transparency Report.
- Findings marked critical (listed) or medium (heuristic).

## Testing

- Vitest + @testing-library/react (jsdom).
- Unit tests: normalize, scoring (gradeFor), severity (groupFindings), malware heuristics, normalize edge cases.
- Component smoke test: Scan page renders form and runs a mocked orchestrator? Keep minimal to avoid network.
- Commands: `npm test`, `npm run build`, `npm run dev`.

## Deliverables

- Working `npm run dev` site at `Music/scan-secure`.
- Passing `npm test` + `npm run build`.
- README with run/build/deploy instructions and honest limits.

## Out of scope

- True backend port scanning, VirusTotal/Safe Browsing keys by default, server-side DB.
- Compare/bulk/export parity beyond JSON export + print-to-PDF (simplified history).
- Production deployment.