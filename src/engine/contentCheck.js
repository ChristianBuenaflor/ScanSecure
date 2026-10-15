export async function runContentCheck(url, html) {
  const findings = [];
  if (!html) {
    findings.push({ id: 'content-nohtml', title: 'No HTML available for content analysis', severity: 'info', detail: 'Fetch blocked by CORS or empty.', category: 'content' });
    return findings;
  }
  return new Promise((resolve) => {
    let worker;
    try {
      worker = new Worker(new URL('../workers/analyzer.worker.js', import.meta.url), { type: 'module' });
    } catch {
      resolve([{ id: 'worker-unavailable', title: 'Content worker unavailable', severity: 'info', detail: 'Worker init failed.', category: 'content' }]);
      return;
    }
    const timer = setTimeout(() => {
      try { worker.terminate(); } catch { /* ignore */ }
      resolve([{ id: 'content-timeout', title: 'Content analysis timed out', severity: 'info', detail: 'Worker did not finish.', category: 'content' }]);
    }, 8000);
    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(Array.isArray(e.data?.findings) ? e.data.findings : findings);
    };
    worker.onerror = () => {
      clearTimeout(timer);
      try { worker.terminate(); } catch { /* ignore */ }
      resolve([{ id: 'content-error', title: 'Content analysis failed', severity: 'info', detail: 'Worker error.', category: 'content' }]);
    };
    worker.postMessage({ html, baseUrl: url.toString() });
  });
}
