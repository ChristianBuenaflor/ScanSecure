import { describe, it, expect } from 'vitest';
import { parseSiteMeta, buildSiteDetails } from '../siteDetails.js';

describe('parseSiteMeta', () => {
  it('detects WordPress theme and counts assets', () => {
    const html = `
      <meta name="generator" content="WordPress 7.1.3" />
      <link href="https://example.com/wp-content/themes/Divi/style.css" />
      <a href="/a">x</a><a href="/b">y</a>
      <script src="/s1.js"></script>
      <iframe src="/f"></iframe>
    `;
    const m = parseSiteMeta(html);
    expect(m.cms).toBe('WordPress');
    expect(m.version).toMatch(/7\.1\.3/);
    expect(m.theme).toMatch(/Divi/);
    expect(m.links).toBe(2);
    expect(m.scripts).toBe(1);
    expect(m.iframes).toBe(1);
  });
});

describe('buildSiteDetails honest mapping', () => {
  it('maps IPs from dns-a and Unknown otherwise', () => {
    const rows = buildSiteDetails(
      [{ id: 'dns-a', title: 'DNS A records: 2', severity: 'pass', detail: '141.193.213.10, 141.193.213.11', category: 'dns' }],
      new URL('https://example.com/'),
      { cms: null, links: 0, scripts: 0, iframes: 0, embeds: 0 }
    );
    expect(rows.system.ips).toMatch(/141\.193\.213\.10/);
    expect(rows.system.cdn.status).toBe('unknown');
  });

  it('detects CDN from NS hint', () => {
    const rows = buildSiteDetails(
      [{ id: 'dns-ns', title: 'NS', severity: 'pass', detail: 'amy.ns.cloudflare.com', category: 'dns' }],
      new URL('https://example.com/'),
      {}
    );
    expect(rows.system.cdn.value).toMatch(/CloudFlare/i);
  });
});
