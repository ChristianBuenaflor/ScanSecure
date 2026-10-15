# ScanSecure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-only React+Vite+shadcn security & malware scanner site (no backend/DB), located in `Music/scan-secure`.

**Architecture:** Vite + React 18 JSX app with real shadcn/ui components adapted to JSX (Radix + CVA), Tailwind dark theme, client-only scanning engines in `src/engine`, a content-analysis Web Worker, and `localStorage` for history/settings. Routing via react-router-dom.

**Tech Stack:** Vite 5, React 18, Tailwind 3, shadcn/ui (Radix primitives + CVA), lucide-react, react-router-dom 6, vitest, @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-10-14-scan-secure-redesign-design.md`

## Global Constraints

- No backend, no database. All data in `localStorage`.
- JS/JSX only (no TypeScript).
- Network calls must degrade gracefully (CORS/timeouts) and never throw out of the scan.
- Components live in `src/components/ui/*` and use `cn()` from `src/lib/cn.js`.
- Engine functions are pure-ish and exported named.
- Target Node 24, npm 11.
- Tests via vitest; `npm test` must pass; `npm run build` must succeed.

## Review Focus

- URL without scheme must be normalized to `https://` rather than crash.
- CORS-blocked fetches must resolve to "unavailable" findings, not unhandled rejections.
- Empty findings list must yield score 100 and grade A, never NaN.
- Corrupt `localStorage` history must be caught and reset to `[]`.
- Malware feed fetch timeout (6s) must not block the overall scan.

---

### Task 1: Scaffold project and install dependencies

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `postcss.config.js`, `tailwind.config.js`, `.gitignore`, `src/main.jsx`, `src/index.css`, `src/App.jsx`, `src/lib/cn.js`
- Modify: none

**Interfaces:**
- Produces: `cn(...inputs)` in `src/lib/cn.js` returning merged class string.

- [ ] **Step 1: Write file contents** for all listed scaffold files. `cn.js`:
  ```js
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';
  export function cn(...inputs) { return twMerge(clsx(inputs)); }
  ```
- [ ] **Step 2: Install dependencies**
  Run: `npm install`
  Expected: no errors; `node_modules` created.
- [ ] **Step 3: Verify scaffold**
  Run: `npm run dev` (then stop after it prints local URL) and `npm run build`
  Expected: build succeeds, empty app renders.
- [ ] **Step 4: Commit** (git unavailable; skip commit; note files created)

### Task 2: shadcn/ui primitives adapted to JSX

**Files:**
- Create: `src/components/ui/button.jsx`, `card.jsx`, `input.jsx`, `label.jsx`, `badge.jsx`, `alert.jsx`, `progress.jsx`, `tabs.jsx`, `accordion.jsx`, `dialog.jsx`, `skeleton.jsx`, `separator.jsx`
- Modify: none

**Interfaces:**
- Produces: named exports `Button`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Input`, `Label`, `Badge`, `Alert`, `Progress`, `Tabs`, `Accordion`, `Dialog`, `Skeleton`, `Separator`.

- [ ] **Step 1: Implement each primitive** using Radix primitives + CVA + `cn`. Mirror shadcn defaults (variants: default/destructive/outline/secondary/ghost/link; sizes sm/default/lg/icon).
- [ ] **Step 2: Verify types/build**
  Run: `npm run build`
  Expected: PASS.
- [ ] **Step 3: Commit** (skip; git unavailable)

### Task 3: Routing, layout, theme

**Files:**
- Create: `src/components/layout/Navbar.jsx`, `src/pages/Home.jsx`, `src/pages/Scan.jsx`, `src/pages/History.jsx`, `src/pages/About.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: UI primitives from Task 2.
- Produces: route paths `/`, `/scan`, `/history`, `/about`; `Navbar` accepts no props.

- [ ] **Step 1: Write layout + placeholder pages** with routes.
- [ ] **Step 2: Add dark theme tokens** to `src/index.css` (CSS variables) + light toggle in Navbar persisted to localStorage.
- [ ] **Step 3: Verify**
  Run: `npm run dev` (smoke) then `npm run build`
  Expected: PASS; navigation works.

### Task 4: Core utilities (storage, export, api helpers)

**Files:**
- Create: `src/lib/storage.js`, `src/lib/export.js`, `src/lib/api.js`
- Test: `src/lib/__tests__/core.test.js`

**Interfaces:**
- `loadHistory(): Array`
- `saveHistory(items: Array): void` (caps 50, swallows corrupt storage)
- `safeJsonParse(str, fallback)`
- `exportJson(filename, data)`
- `safeFetch(url, opts)` returning `{ ok, status, text, json, error }` never throwing.

- [ ] **Step 1: Write failing tests**
  ```js
  import { describe, it, expect, beforeEach } from 'vitest';
  import { saveHistory, loadHistory, safeJsonParse } from '../storage.js';
  describe('storage', () => {
    beforeEach(() => localStorage.clear());
    it('caps history at 50', () => {
      saveHistory(Array.from({ length: 60 }, (_, i) => ({ id: i })));
      expect(loadHistory()).toHaveLength(50);
    });
    it('returns [] on corrupt storage', () => {
      localStorage.setItem('sc_history', '{not json');
      expect(loadHistory()).toEqual([]);
    });
    it('safeJsonParse fallback', () => {
      expect(safeJsonParse('bad', 7)).toBe(7);
    });
  });
  ```
- [ ] **Step 2: Run test** → expect FAIL.
  Run: `npx vitest run src/lib/__tests__/core.test.js`
- [ ] **Step 3: Implement storage.js, safeJsonParse, export.js, api.js (safeFetch with timeout).**
- [ ] **Step 4: Run test** → expect PASS.

### Task 5: normalize + urlIntel engines

**Files:**
- Create: `src/engine/normalize.js`, `src/engine/urlIntel.js`
- Test: `src/engine/__tests__/normalize.test.js`

**Interfaces:**
- `normalizeUrl(input: string): { ok: boolean, url?: URL, href?: string, error?: string }`
- `analyzeUrl(url: URL): Finding[]`

- [ ] **Step 1: Write failing tests** (scheme-less becomes https; invalid returns ok false; IP host flagged)
  ```js
  import { describe, it, expect } from 'vitest';
  import { normalizeUrl } from '../normalize.js';
  describe('normalizeUrl', () => {
    it('defaults scheme to https', () => {
      expect(normalizeUrl('example.com').href).toBe('https://example.com/');
    });
    it('rejects invalid', () => {
      expect(normalizeUrl('::::').ok).toBe(false);
    });
  });
  ```
- [ ] **Step 2: Run test** → FAIL.
- [ ] **Step 3: Implement normalizeUrl + analyzeUrl with findings [{id, title, severity, detail}]**.
- [ ] **Step 4: Run test** → PASS.

### Task 6: scoring + severity

**Files:**
- Create: `src/engine/scoring.js`, `src/engine/severity.js`
- Test: `src/engine/__tests__/scoring.test.js`, `src/components/__tests__/ui.test.js`

**Interfaces:**
- `scoreFindings(findings): { score: number, grade: string }`
- `gradeFor(score): 'A'|...|'F'`
- `groupFindings(findings): Record<severity, Finding[]>`

- [ ] **Step 1: Write failing tests** (gradeFor mapping, empty findings → 100/A, groupFindings grouping).
- [ ] **Step 2: Run tests** → FAIL.
- [ ] **Step 3: Implement** with deductions critical 25/high 15/medium 7/low 2, clamp 0..100.
- [ ] **Step 4: Run tests** → PASS.

### Task 7: Remaining security checks + worker

**Files:**
- Create: `src/engine/headersCheck.js`, `tlsCert.js`, `dnsEmail.js`, `fingerprint.js`, `reputation.js`, `performance.js`, `contentCheck.js` (main-thread adapter), `src/workers/analyzer.worker.js`
- Modify: none

**Interfaces:**
- Each check `(url, context) => Promise<Finding[]>` and never throws.
- Worker handles HTML string and returns findings for mixed-content/forms/trackers/eval.

- [ ] **Step 1: Implement each check** using `safeFetch` with 8s timeouts, CORS fallback. Append finding `severity:'low/info'` when unavailable.
- [ ] **Step 2: Implement worker** `analyzer.worker.js` listening for `{html, baseUrl}` and posting `{findings}`.
- [ ] **Step 3: Implement contentCheck.js** wrapper to call worker.
- [ ] **Step 4: Verify build** `npm run build`.

### Task 8: Malware / URL reputation engine

**Files:**
- Create: `src/engine/malware.js`
- Test: `src/engine/__tests__/malware.test.js`

**Interfaces:**
- `malwareHeuristics(url): Finding[]`
- `checkMalware(url, { apiKey }): Promise<Finding[]>` (attempts feed fetch with 6s timeout; VT if key present; never throws)
- `buildThreatLinks(url): Array<{label,url}>`

- [ ] **Step 1: Write failing tests** for heuristics (IP host → medium/high, suspicious TLD, shortener, punycode detection)
  ```js
  import { describe, it, expect } from 'vitest';
  import { malwareHeuristics } from '../malware.js';
  describe('malwareHeuristics', () => {
    it('flags IP host', () => {
      const f = malwareHeuristics(new URL('http://1.2.3.4/x'));
      expect(f.some(x => /ip/i.test(x.title))).toBe(true);
    });
    it('flags suspicious TLD', () => {
      const f = malwareHeuristics(new URL('https://example.zip/'));
      expect(f.length).toBeGreaterThan(0);
    });
  });
  ```
- [ ] **Step 2: Run test** → FAIL.
- [ ] **Step 3: Implement** heuristics + `checkMalware` with AbortController 6s; feed fetch guarded by try/catch; VT lookup if key; links.
- [ ] **Step 4: Run test** → PASS.
- [ ] **Step 5: Add feed-timeout test not blocking** (include in malware.test.js with fake fetch).

### Task 9: Orchestrator

**Files:**
- Create: `src/engine/orchestrator.js`

**Interfaces:**
- `runScan({ url, onProgress }): Promise<{ findings: Finding[], score, grade }>` and `abort()`.

- [ ] **Step 1: Implement** run all checks in parallel via Promise.allSettled, progress callback after each, AbortController support, partial results on abort.
- [ ] **Step 2: Verify** by temporary manual smoke in Scan page (Task 10).

### Task 10: Scan page + feature components

**Files:**
- Create: `src/components/ScoreRing.jsx`, `UrlForm.jsx`, `FindingsList.jsx`, `HistoryTable.jsx`, `ExportBar.jsx`
- Modify: `src/pages/Scan.jsx`, `src/pages/Home.jsx`, `src/pages/History.jsx`

**Interfaces:**
- `FindingsList({ findings })` uses `groupFindings`.
- `HistoryTable({ items, onSelect, onDelete })`.
- `ExportBar({ findings, url })` exports JSON / prints.

- [ ] **Step 1: Implement UrlForm** with validation + submit.
- [ ] **Step 2: Implement ScoreRing** (SVG ring + grade).
- [ ] **Step 3: Implement FindingsList** with tabs by severity + accordion details.
- [ ] **Step 4: Wire Scan.jsx** to orchestrator, progress bar, findings, score, save to history.
- [ ] **Step 5: Implement Home.jsx** hero + URL form + recent history.
- [ ] **Step 6: Implement History.jsx** table + delete + select-to-view.
- [ ] **Step 7: Implement ExportBar** JSON download + window.print.
- [ ] **Step 8: Verify** `npm run build` and dev smoke.

### Task 11: Settings / VirusTotal key + About page

**Files:**
- Create/modify: `src/pages/About.jsx`, a `SettingsDialog` component maybe `src/components/SettingsDialog.jsx`

**Interfaces:**
- Settings stored in localStorage key `sc_settings`.

- [ ] **Step 1: Implement** settings dialog with VT API key input + theme toggle.
- [ ] **Step 2: About page** credits/limits/honest caveats.
- [ ] **Step 3: Verify** build.

### Task 12: Tests sweep & polish

**Files:**
- Modify: test files as needed
- Run: `npm test`, `npm run build`, `npm run lint` (if eslint configured)

**Steps:**
- [ ] Add any missing Review Focus tests:
  - corrupt localStorage (Task 4)
  - scheme-less URL (Task 5)
  - empty findings (Task 6)
  - CORS fetch rejection (Task 7's headers maybe)
  - feed timeout (Task 8)
- [ ] Run `npm test` → all PASS.
- [ ] Run `npm run build` → PASS.
- [ ] Fix lint issues.

### Task 13: README and docs

**Files:**
- Create: `README.md`
- Contains run/dev/test/build and limits.

- [ ] Write README with instructions.
- [ ] Final verification `npm test && npm run build`.

---

## Execution Handoff

Plan complete. Please review. Preferred execution: subagent-driven (tasks have clear interfaces) OR native. Given dependency-heavy UI polish, I recommend native execution in this session with a final review; tasks depend on shared component primitives. Which approach?