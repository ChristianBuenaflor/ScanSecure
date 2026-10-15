export function normalizeUrl(input) {
  if (typeof input !== 'string') return { ok: false, error: 'URL is required' };
  let raw = input.trim();
  if (!raw) return { ok: false, error: 'URL is required' };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = 'https://' + raw;
  try {
    const url = new URL(raw);
    if (!/^https?:$/.test(url.protocol)) return { ok: false, error: 'Only http(s) URLs are supported' };
    if (!url.hostname) return { ok: false, error: 'Invalid hostname' };
    return { ok: true, url, href: url.href };
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }
}

export function analyzeUrl(url) {
  const out = [];
  const host = url.hostname.toLowerCase();
  if (url.protocol === 'http:') out.push({ id: 'proto-http', title: 'Site served over HTTP (not encrypted)', severity: 'high', detail: 'The target URL uses plain HTTP. Use HTTPS.', category: 'transport' });
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) out.push({ id: 'ip-host', title: 'Host is a raw IP address', severity: 'medium', detail: 'Serving a site from a raw IP is unusual for production.', category: 'url' });
  if (url.username || url.password) out.push({ id: 'creds-url', title: 'Credentials embedded in URL', severity: 'critical', detail: 'The URL contains username/password.', category: 'url' });
  if (url.href.length > 200) out.push({ id: 'long-url', title: 'Unusually long URL', severity: 'low', detail: 'Long URLs are common in phishing.', category: 'url' });

  const riskyTlds = ['zip', 'mov', 'xyz', 'top', 'click', 'country', 'gq', 'cf', 'tk', 'ml'];
  const parts = host.split('.');
  const tld = parts[parts.length - 1];
  if (riskyTlds.includes(tld)) out.push({ id: 'risky-tld', title: `High-risk TLD (.${tld})`, severity: 'medium', detail: 'This TLD is frequently abused by attackers.', category: 'url' });

  const suspicious = ['login', 'verify', 'account', 'secure', 'update', 'signin', 'wallet', 'bank'];
  if (suspicious.some((k) => url.pathname.toLowerCase().includes(k))) {
    out.push({ id: 'suspicious-path', title: 'Suspicious path keyword', severity: 'low', detail: 'Path contains account/verification style keyword.', category: 'url' });
  }

  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly'];
  if (shorteners.includes(host)) out.push({ id: 'shortener', title: 'URL shortener detected', severity: 'medium', detail: 'Destination is hidden behind a shortener.', category: 'url' });

  if (host.includes('xn--')) out.push({ id: 'punycode', title: 'Punycode / IDN domain', severity: 'high', detail: 'Domain uses punycode, possible homograph attack.', category: 'url' });

  const badKeywords = ['free', 'gift', 'winner', 'prize', 'urgent'];
  if (badKeywords.some((k) => (host + url.pathname).toLowerCase().includes(k))) {
    out.push({ id: 'spam-keyword', title: 'Spam-like keyword in URL', severity: 'low', detail: 'Common spam/phishing wording found.', category: 'url' });
  }

  return out;
}

export function analyzeUrlText(input) {
  const n = normalizeUrl(input);
  if (!n.ok) return { ok: false, error: n.error, findings: [] };
  return { ok: true, url: n.url, href: n.href, findings: analyzeUrl(n.url) };
}
