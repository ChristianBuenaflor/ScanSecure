export async function safeFetch(url, opts = {}) {
  const { timeout = 8000, ...rest } = opts;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { ...rest, signal: ctrl.signal });
    let text = '';
    try { text = await res.text(); } catch { text = ''; }
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = null; }
    return { ok: res.ok, status: res.status, text, json, error: null };
  } catch (err) {
    return { ok: false, status: 0, text: '', json: null, error: err?.message || 'fetch failed' };
  } finally {
    clearTimeout(timer);
  }
}

export function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve({ timedOut: true }), ms)),
  ]);
}
