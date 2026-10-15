import { safeFetch } from '../lib/api.js';

const PATHS = [
  { path: '/robots.txt', title: 'robots.txt accessible', critical: false },
  { path: '/.git/HEAD', title: 'Exposed .git/HEAD', critical: true },
  { path: '/.env', title: 'Exposed .env file', critical: true },
  { path: '/wp-json', title: 'WordPress REST API exposed', critical: false },
  { path: '/sitemap.xml', title: 'sitemap.xml accessible', critical: false },
];

export async function runFingerprintCheck(url) {
  const findings = [];
  const base = url.origin;
  await Promise.all(PATHS.map(async (p) => {
    const r = await safeFetch(base + p.path, { timeout: 6000 });
    if (r.status === 200) {
      if (p.critical) findings.push({ id: 'exposed-' + p.path, title: p.title, severity: 'critical', detail: `${base}${p.path} returned 200.`, category: 'exposure' });
      else findings.push({ id: 'path-' + p.path, title: `${p.title}`, severity: 'info', detail: 'Accessible (HTTP 200).', category: 'exposure' });
    }
  }));
  try {
    const r = await fetch(url.toString(), { method: 'HEAD' });
    const server = r.headers.get('server');
    if (server) findings.push({ id: 'server-header', title: 'Server header disclosed', severity: 'low', detail: server, category: 'fingerprint' });
    const powered = r.headers.get('x-powered-by');
    if (powered) findings.push({ id: 'powered-by', title: 'X-Powered-By disclosed', severity: 'low', detail: powered, category: 'fingerprint' });
  } catch { /* ignore */ }
  if (findings.length === 0) findings.push({ id: 'fingerprint-none', title: 'No exposed files detected (best-effort)', severity: 'pass', detail: 'Probes returned non-200.', category: 'exposure' });
  return findings;
}
