import { safeFetch } from '../lib/api.js';

export async function runTlsCheck(url) {
  const findings = [];
  const host = url.hostname;
  // crt.sh
  const res = await safeFetch(`https://crt.sh/?q=${encodeURIComponent(host)}&output=json`, { timeout: 9000 });
  if (!res.ok || !Array.isArray(res.json)) {
    findings.push({ id: 'tls-unavailable', title: 'Certificate transparency (crt.sh) unavailable', severity: 'info', detail: res.error || 'no data', category: 'tls' });
    return findings;
  }
  const rows = res.json;
  if (!rows.length) {
    findings.push({ id: 'tls-none', title: 'No certificates found in CT logs', severity: 'low', detail: 'No crt.sh entries for host.', category: 'tls' });
    return findings;
  }
  // find latest notAfter
  let latest = null;
  for (const r of rows) {
    const d = new Date(r.not_after);
    if (!isNaN(d) && (!latest || d > latest)) latest = d;
  }
  const now = new Date();
  if (latest) {
    const days = Math.round((latest - now) / 86400000);
    if (days < 0) findings.push({ id: 'tls-expired', title: 'Certificate expired', severity: 'critical', detail: `Expired ${Math.abs(days)} days ago.`, category: 'tls' });
    else if (days < 14) findings.push({ id: 'tls-expiring', title: 'Certificate expiring soon', severity: 'high', detail: `Expires in ${days} days.`, category: 'tls' });
    else findings.push({ id: 'tls-ok', title: 'Certificate not expiring soon', severity: 'pass', detail: `Nearest expiry in ${days} days.`, category: 'tls' });
  }
  const wild = rows.some((r) => (r.name_value || '').includes('*'));
  if (wild) findings.push({ id: 'tls-wildcard', title: 'Wildcard certificate in use', severity: 'info', detail: 'Wildcard cert detected in CT logs.', category: 'tls' });
  return findings;
}
