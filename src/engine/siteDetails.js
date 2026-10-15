function findById(findings, id) {
  return findings.find((f) => f?.id === id);
}

function detailOf(findings, ...ids) {
  for (const id of ids) {
    const f = findById(findings, id);
    if (f?.detail) return f.detail;
  }
  return '';
}

function detectCdn(findings) {
  const hay = findings.map((f) => `${f?.title || ''} ${f?.detail || ''}`).join(' ').toLowerCase();
  if (/cloudflare/.test(hay)) return { value: 'CloudFlare', status: 'detected' };
  if (/fastly/.test(hay)) return { value: 'Fastly', status: 'detected' };
  if (/akamai/.test(hay)) return { value: 'Akamai', status: 'detected' };
  if (/cloudfront/.test(hay)) return { value: 'CloudFront', status: 'detected' };
  if (/sucuri/.test(hay)) return { value: 'Sucuri', status: 'detected' };
  return { value: 'Unknown — fetch blocked', status: 'unknown' };
}

function detectTlsIssuer(findings) {
  const tls = findings.filter((f) => f?.category === 'tls');
  const hay = tls.map((f) => `${f?.title || ''} ${f?.detail || ''}`).join(' ');
  const m = hay.match(/issued by ([^.,;]+)/i) || hay.match(/issuer[:\s]+([^.,;]+)/i);
  if (m) return { value: m[1].trim(), status: 'detected' };
  if (tls.some((f) => /crt\.sh.*unavailable|no certificates/i.test(`${f?.title || ''} ${f?.detail || ''}`))) {
    return { value: 'Unknown — CT lookup blocked', status: 'unknown' };
  }
  return { value: 'Unknown — not collected', status: 'unknown' };
}

export function parseSiteMeta(html = '') {
  const src = String(html || '');
  const out = { cms: null, version: null, theme: null, directory: null, links: 0, scripts: 0, iframes: 0, embeds: 0, generator: null };

  const gen = src.match(/<meta[^>]+name=["']generator["'][^>]*content=["']([^"']+)["']/i);
  if (gen) {
    out.generator = gen[1];
    const wp = gen[1].match(/WordPress\s*([\d.]+)?/i);
    if (wp) {
      out.cms = 'WordPress';
      if (wp[1]) out.version = `${wp[1]} based on generator meta`;
    } else if (/drupal|joomla|ghost|wix|squarespace|shopify/i.test(gen[1])) {
      out.cms = gen[1].split(/\s/)[0];
      out.version = gen[1];
    }
  }

  const themeMatch = src.match(/wp-content\/themes\/([^/"'\s?#]+)/i);
  if (themeMatch) {
    out.cms = out.cms || 'WordPress';
    out.theme = themeMatch[0].split('?')[0];
    if (!out.theme.startsWith('http')) out.theme = `…/wp-content/themes/${themeMatch[1]}/`;
  }
  const dirMatch = src.match(/(https?:\/\/[^"'\s]*?\/wp-content\/)/i);
  if (dirMatch) {
    out.directory = dirMatch[1];
    out.cms = out.cms || 'WordPress';
  } else if (/wp-content\//i.test(src)) {
    out.directory = '…/wp-content/';
    out.cms = out.cms || 'WordPress';
  }

  // feed version hint like screenshots: "7.1.3 based on feed/"
  if (!out.version) {
    const feed = src.match(/wordpress[^0-9]*([\d]+\.[\d.]+)[^<]{0,40}feed/i) || src.match(/<generator[^>]*>https?:\/\/wordpress\.org\/\?v=([\d.]+)/i);
    if (feed) {
      out.cms = out.cms || 'WordPress';
      out.version = `${feed[1]} based on feed/`;
    }
  }

  out.links = (src.match(/<a[\s>]/gi) || []).length;
  out.scripts = (src.match(/<script[^>]+src=/gi) || []).length;
  out.iframes = (src.match(/<iframe[\s>]/gi) || []).length;
  out.embeds = (src.match(/<(embed|object)[\s>]/gi) || []).length;
  return out;
}

export function buildSiteDetails(findings = [], url = null, meta = {}) {
  const list = Array.isArray(findings) ? findings : [];
  const m = meta || {};

  const dnsA = detailOf(list, 'dns-a');
  const ips = dnsA && dnsA !== 'none' ? dnsA : 'Unknown — DNS blocked';

  const cdn = detectCdn(list);
  const tlsIssuer = detectTlsIssuer(list);

  let finalUrl = '';
  try { finalUrl = url ? new URL(url.toString()).toString() : ''; } catch { finalUrl = ''; }

  const powered = detailOf(list, 'powered-by', 'server-header');
  const wpJson = findById(list, 'path-/wp-json');

  let app = m.cms || null;
  let version = m.version || null;
  let theme = m.theme || null;
  let directory = m.directory || null;
  let appStatus = 'unknown';
  if (app) {
    appStatus = version ? 'detected' : 'detected';
  } else if (wpJson) {
    app = 'WordPress';
    version = version || 'detected, version not verified';
    appStatus = 'detected';
  } else if (powered) {
    app = 'Unknown — tech disclosed, CMS not confirmed';
    appStatus = 'unknown';
  }

  return {
    system: {
      ips,
      ipsStatus: ips.startsWith('Unknown') ? 'unknown' : 'detected',
      cdn,
      tlsIssuer,
    },
    redirects: { to: finalUrl || 'Unknown', status: finalUrl ? 'detected' : 'unknown' },
    app: {
      name: app || 'Unknown — not fingerprinted',
      version: version || 'Unknown — version not verified',
      theme: theme || 'Unknown',
      directory: directory || 'Unknown',
      poweredBy: powered || 'Unknown',
      status: appStatus,
    },
    content: {
      links: Number(m.links) || 0,
      scripts: Number(m.scripts) || 0,
      iframes: Number(m.iframes) || 0,
      embeds: Number(m.embeds) || 0,
    },
  };
}
