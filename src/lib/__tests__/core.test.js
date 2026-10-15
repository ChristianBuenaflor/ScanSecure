import { describe, it, expect, beforeEach } from 'vitest';
import { saveHistory, loadHistory, safeJsonParse } from '../storage.js';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('caps history at 50', () => {
    saveHistory(Array.from({ length: 60 }, (_, i) => ({ id: i })));
    expect(loadHistory()).toHaveLength(50);
  });

  it('returns [] on corrupt storage', () => {
    localStorage.setItem('sc_history', '{not json');
    expect(loadHistory()).toEqual([]);
  });

  it('safeJsonParse fallback', () => {
    expect(safeJsonParse('bad', 7)).toBe(7);
  });
});
