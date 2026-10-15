import { safeFetch } from '../lib/api.js';

const REQUIRED = [
  { name: 'strict-transport-security', title: 'Missing HSTS', severity: 'high' },
  { name: 'content-security-policy', title: 'Missing Content-Security-Policy', severity: 'high' },
  { name: 'x-frame-options', title: 'Missing X-Frame-Options', severity: 'medium' },
  { name: 'x-content-type-options', title: 'Missing X-Content-Type-Options', severity: 'medium' },
  { name: 'referrer-policy', title: 'Missing Referrer-Policy', severity: 'low' },
  { name: 'permissions-policy', title: 'Missing Permissions-Policy', severity: 'low' },
];

export async function runHeadersCheck(url) {
  const findings = [];
  const res = await safeFetch(url.toString(), { method: 'GET' });
  if (!res.ok) {
    findings.push({ id: 'headers-unavailable', title: 'Security headers could not be read (CORS/network)', severity: 'info', detail: res.error || 'No response', category: 'headers' });
    return findings;
  }
  const headers = {};
  // headers came as text; parse via response object not available; re-fetch headers list impossible with safeFetch text only.
  // Try parse from res.text? No. We store simple: safeFetch returns no headers. Re-implement quick fetch here.
  let h = {};
  try {
    const r = await fetch(url.toString(), { method: 'GET' });
    r.headers.forEach((v, k) => { h[k.toLowerCase()] = v; });
  } catch { /* ignore */ }
  for (const req of REQUIRED) {
    if (!h[req.name]) findings.push({ id: 'hdr-' + req.name, title: req.title, severity: req.severity, detail: `Header "${req.name}" not present.`, category: 'headers' });
  }
  // cookie flags if set-cookie present
  if (h['set-cookie'] && !/secure/i.test(h['set-cookie'])) findings.push({ id: 'cookie-insecure', title: 'Cookie without Secure flag', severity: 'medium', detail: 'Set-Cookie missing Secure.', category: 'headers' });
  if (findings.length === 0) findings.push({ id: 'headers-ok', title: 'All checked security headers present', severity: 'pass', detail: 'HSTS, CSP, X-Frame-Options, X-Content-Type-Options present.', category: 'headers' });
  return findings;
}
