import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const scanSrc = readFileSync(path.join(here, '..', 'Scan.jsx'), 'utf8');

describe('Scan 2-column layout', () => {
  it('wraps SecurityChecklist and SiteDetails in a md:grid-cols-2 grid', () => {
    const gridIdx = scanSrc.indexOf('md:grid-cols-2');
    const checklistIdx = scanSrc.indexOf('<SecurityChecklist');
    const detailsIdx = scanSrc.indexOf('<SiteDetails');
    expect(gridIdx).toBeGreaterThanOrEqual(0);
    expect(checklistIdx).toBeGreaterThanOrEqual(0);
    expect(detailsIdx).toBeGreaterThanOrEqual(0);
    expect(checklistIdx).toBeGreaterThan(gridIdx);
    expect(detailsIdx).toBeGreaterThan(gridIdx);
  });

  it('uses dashboard grid with sticky score column left and stacked right column', () => {
    expect(scanSrc).toMatch(/lg:grid-cols-\[220px_1fr\]/);
    expect(scanSrc).toMatch(/lg:sticky/);
    const scoreIdx = scanSrc.indexOf('<ScoreRing');
    const riskIdx = scanSrc.indexOf('<RiskMeter');
    const findingsIdx = scanSrc.indexOf('<FindingsList');
    expect(scoreIdx).toBeGreaterThanOrEqual(0);
    expect(riskIdx).toBeGreaterThanOrEqual(0);
    expect(scoreIdx).toBeLessThan(riskIdx);
    expect(findingsIdx).toBeGreaterThan(riskIdx);
  });
});
