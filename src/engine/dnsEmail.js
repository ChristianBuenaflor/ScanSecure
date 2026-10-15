import { safeFetch } from '../lib/api.js';

export async function runDnsEmailCheck(url) {
  const findings = [];
  const host = url.hostname;
  const doh = `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=`;
  // A/AAAA
  for (const t of ['A', 'AAAA']) {
    const r = await safeFetch(doh + t, { timeout: 8000 });
    if (!r.ok || !r.json) {
      findings.push({ id: 'dns-unavailable', title: `DNS ${t} lookup unavailable`, severity: 'info', detail: r.error || 'no data', category: 'dns' });
      continue;
    }
    const answers = r.json.Answer || [];
    findings.push({ id: `dns-${t.toLowerCase()}`, title: `DNS ${t} records: ${answers.length}`, severity: answers.length ? 'pass' : 'low', detail: answers.map((a) => a.data).join(', ') || 'none', category: 'dns' });
  }
  // NS
  const ns = await safeFetch(doh + 'NS', { timeout: 8000 });
  const nsAnswers = (ns.json && ns.json.Answer) || [];
  findings.push({ id: 'dns-ns', title: `NS records: ${nsAnswers.length}`, severity: nsAnswers.length ? 'pass' : 'medium', detail: nsAnswers.map((a) => a.data).join(', ') || 'none', category: 'dns' });

  // CAA
  const caa = await safeFetch(doh + 'CAA', { timeout: 8000 });
  const caaAnswers = (caa.json && caa.json.Answer) || [];
  if (caaAnswers.length === 0) findings.push({ id: 'dns-caa-missing', title: 'No CAA record', severity: 'low', detail: 'No CAA record restricts certificate issuance.', category: 'dns' });

  // SPF / DMARC via TXT on domain and _dmarc
  for (const q of [host, `_dmarc.${host}`]) {
    const txt = await safeFetch(`https://dns.google/resolve?name=${encodeURIComponent(q)}&type=TXT`, { timeout: 8000 });
    const answers = (txt.json && txt.json.Answer) || [];
    const joined = answers.map((a) => a.data).join(' ');
    if (q.startsWith('_dmarc.')) {
      if (!joined.includes('v=DMARC1')) findings.push({ id: 'dmarc-missing', title: 'Missing DMARC record', severity: 'medium', detail: 'No DMARC policy found.', category: 'email' });
      else findings.push({ id: 'dmarc-ok', title: 'DMARC record present', severity: 'pass', detail: joined.slice(0, 120), category: 'email' });
    } else {
      if (!joined.includes('v=spf1')) findings.push({ id: 'spf-missing', title: 'Missing SPF record', severity: 'low', detail: 'No SPF record found.', category: 'email' });
      else findings.push({ id: 'spf-ok', title: 'SPF record present', severity: 'pass', detail: joined.slice(0, 120), category: 'email' });
    }
  }

  return findings;
}
