import { runUrlIntel } from './urlIntel.js';
import { runHeadersCheck } from './headersCheck.js';
import { runTlsCheck } from './tlsCert.js';
import { runDnsEmailCheck } from './dnsEmail.js';
import { runContentCheck } from './contentCheck.js';
import { runFingerprintCheck } from './fingerprint.js';
import { runReputationCheck } from './reputation.js';
import { runPerformanceCheck } from './performance.js';
import { checkMalware } from './malware.js';
import { parseSiteMeta } from './siteDetails.js';
import { scoreFindings } from './scoring.js';
import { normalizeUrl } from './normalize.js';
import { loadSettings } from '../lib/storage.js';
import { safeFetch } from '../lib/api.js';

export function createOrchestrator() {
  let aborted = false;
  const abort = () => { aborted = true; };

  async function fetchHtml(url) {
    try {
      const r = await safeFetch(url.toString(), { timeout: 10000 });
      return r.ok ? r.text : '';
    } catch { return ''; }
  }

  async function runScan({ rawUrl, onProgress }) {
    aborted = false;
    const notify = (step, total, label) => { try { onProgress && onProgress({ step, total, label }); } catch { /* ignore */ } };
    const total = 10;
    const all = [];
    let meta = {};
    const n = normalizeUrl(rawUrl);
    if (!n.ok) return { ok: false, error: n.error, findings: [], score: 0, grade: 'F' };
    const url = n.url;

    const settings = loadSettings() || { virusTotalKey: '' };

    const push = (arr) => { if (aborted) return; for (const f of arr || []) all.push(f); };

    notify(1, total, 'URL intelligence');
    push(await runUrlIntel(rawUrl).catch(() => []));
    if (aborted) return partial();

    notify(2, total, 'Security headers');
    push(await runHeadersCheck(url).catch(() => []));
    if (aborted) return partial();

    notify(3, total, 'TLS certificate');
    push(await runTlsCheck(url).catch(() => []));
    if (aborted) return partial();

    notify(4, total, 'DNS & email');
    push(await runDnsEmailCheck(url).catch(() => []));
    if (aborted) return partial();

    notify(5, total, 'Fetching content');
    const html = await fetchHtml(url);
    try { meta = parseSiteMeta(html); } catch { meta = {}; }
    notify(6, total, 'Content analysis');
    push(await runContentCheck(url, html).catch(() => []));
    if (aborted) return partial();

    notify(7, total, 'Fingerprint / exposure');
    push(await runFingerprintCheck(url).catch(() => []));

    notify(8, total, 'Reputation');
    push(await runReputationCheck(url).catch(() => []));

    notify(9, total, 'Performance & SEO');
    push(await runPerformanceCheck(url).catch(() => []));

    notify(10, total, 'Malware / URL reputation');
    push(await checkMalware(url, { apiKey: settings?.virusTotalKey || '' }).catch(() => []));

    const { score, grade } = scoreFindings(all);
    return { ok: true, url: url.href, findings: all, score, grade, meta };

    function partial() {
      const { score, grade } = scoreFindings(all);
      let pmeta = {};
      try { pmeta = meta || {}; } catch { pmeta = {}; }
      return { ok: true, url: url.href, findings: all, score, grade, aborted: true, meta: pmeta };
    }
  }

  return { runScan, abort };
}
