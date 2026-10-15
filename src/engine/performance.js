import { safeFetch } from '../lib/api.js';

export async function runPerformanceCheck(url) {
  const findings = [];
  const start = performance.now();
  const res = await safeFetch(url.toString(), { timeout: 10000 });
  const elapsed = Math.round(performance.now() - start);
  if (!res.ok) {
    findings.push({ id: 'perf-unavailable', title: 'Performance check unavailable', severity: 'info', detail: res.error || 'no response', category: 'performance' });
    return findings;
  }
  findings.push({ id: 'perf-ttfb', title: `Response time ~${elapsed} ms`, severity: elapsed > 3000 ? 'medium' : elapsed > 1500 ? 'low' : 'pass', detail: 'Includes network + fetch overhead.', category: 'performance' });
  const size = res.text.length;
  if (size > 500000) findings.push({ id: 'perf-large', title: 'Large HTML payload', severity: 'low', detail: `${size} bytes`, category: 'performance' });
  if (size > 0 && !/<meta[^>]+name=["']description["']/i.test(res.text)) findings.push({ id: 'seo-desc', title: 'Missing meta description', severity: 'low', detail: 'No meta description tag found.', category: 'seo' });
  if (!/<title>/i.test(res.text)) findings.push({ id: 'seo-title', title: 'Missing <title>', severity: 'medium', detail: 'No title tag found.', category: 'seo' });
  return findings;
}
