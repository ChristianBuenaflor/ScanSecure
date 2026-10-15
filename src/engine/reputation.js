import { safeFetch } from '../lib/api.js';

const BAD_TLDS = ['zip', 'mov', 'top', 'click', 'gq', 'cf', 'tk', 'ml'];

export async function runReputationCheck(url) {
  const findings = [];
  const host = url.hostname.toLowerCase();
  if (BAD_TLDS.includes(host.split('.').pop())) {
    findings.push({ id: 'rep-bad-tld', title: 'Domain uses frequently abused TLD', severity: 'medium', detail: host, category: 'reputation' });
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    findings.push({ id: 'rep-ip-host', title: 'Reputation: raw IP host', severity: 'high', detail: host, category: 'reputation' });
  }
  if (host.includes('xn--')) {
    findings.push({ id: 'rep-punycode', title: 'Reputation: punycode domain', severity: 'high', detail: host, category: 'reputation' });
  }
  if (findings.length === 0) findings.push({ id: 'rep-ok', title: 'No negative reputation heuristics', severity: 'pass', detail: 'No bad TLD, IP, or punycode.', category: 'reputation' });
  return findings;
}
