import { describe, it, expect } from 'vitest';
import { buildSecurityChecks } from '../securitySummary.js';

describe('buildSecurityChecks honest mapping', () => {
  it('returns 5 rows for clean scan', () => {
    const findings = [
      { id: 'mw-heuristic-ok', title: 'No malware heuristics triggered', severity: 'pass', category: 'malware' },
      { id: 'content-ok', title: 'No obvious content issues', severity: 'pass', category: 'content' },
    ];
    const rows = buildSecurityChecks(findings);
    expect(rows).toHaveLength(5);
    expect(rows[0].id).toBe('malware');
    expect(rows[0].status).toBe('pass');
  });

  it('flags malware when critical malware finding present', () => {
    const rows = buildSecurityChecks([
      { id: 'mw-feed-listed', title: 'Listed in OpenPhish feed', severity: 'critical', category: 'malware' },
    ]);
    expect(rows[0].status).toBe('fail');
  });

  it('marks server-errors unknown when content unavailable', () => {
    const rows = buildSecurityChecks([
      { id: 'content-nohtml', title: 'No HTML available', severity: 'info', category: 'content' },
    ]);
    const srv = rows.find((r) => r.id === 'server-errors');
    expect(['unknown', 'warn']).toContain(srv.status);
  });

  it('marks cms unknown when no tech evidence', () => {
    const rows = buildSecurityChecks([]);
    const cms = rows.find((r) => r.id === 'cms');
    expect(cms.status).toBe('unknown');
  });
});
