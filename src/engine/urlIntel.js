import { normalizeUrl, analyzeUrl } from './normalize.js';

export async function runUrlIntel(raw) {
  const n = normalizeUrl(raw);
  if (!n.ok) return [ { id: 'url-invalid', title: 'Invalid URL', severity: 'critical', detail: n.error } ];
  const findings = analyzeUrl(n.url);

  // Redirect hint (best-effort, may fail under CORS)
  try {
    const res = await fetch(n.url.toString(), { method: 'GET', redirect: 'follow', mode: 'no-cors' });
    // no-cors yields opaque; record nothing extra
    void res;
  } catch {
    findings.push({ id: 'redirect-unknown', title: 'Redirect/availability could not be verified', severity: 'info', detail: 'CORS prevented checking redirects.', category: 'url' });
  }
  return findings;
}
