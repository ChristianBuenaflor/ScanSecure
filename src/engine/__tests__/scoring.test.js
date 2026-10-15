import { describe, it, expect } from 'vitest';
import { gradeFor, scoreFindings } from '../scoring.js';

describe('scoring', () => {
  it('gradeFor mapping', () => {
    expect(gradeFor(92)).toBe('A');
    expect(gradeFor(10)).toBe('F');
  });
  it('empty findings => 100/A', () => {
    expect(scoreFindings([])).toEqual({ score: 100, grade: 'A' });
  });
  it('deducts', () => {
    expect(scoreFindings([{ severity: 'critical' }]).score).toBe(75);
  });
});
