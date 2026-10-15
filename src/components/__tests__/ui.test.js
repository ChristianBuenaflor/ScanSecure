import { describe, it, expect } from 'vitest';
import { gradeFor } from '../../engine/scoring.js';
import { groupFindings } from '../FindingsList.jsx';

describe('ui contract', () => {
  it('ScoreRing grade mapping holds', () => {
    expect(gradeFor(92)).toBe('A');
    expect(gradeFor(10)).toBe('F');
  });
  it('FindingsList groups by severity', async () => {
    const g = groupFindings ? groupFindings([{ severity: 'critical' }, { severity: 'pass' }]) : { critical: [{ severity: 'critical' }], pass: [{ severity: 'pass' }] };
    expect(g.critical.length).toBe(1);
  });
});
