import { describe, it, expect } from 'vitest';
import { normalizeUrl } from '../normalize.js';

describe('normalizeUrl', () => {
  it('defaults scheme to https', () => {
    expect(normalizeUrl('example.com').href).toBe('https://example.com/');
  });
  it('rejects invalid', () => {
    expect(normalizeUrl('::::').ok).toBe(false);
  });
  it('keeps empty handling', () => {
    expect(normalizeUrl('').ok).toBe(false);
  });
});
