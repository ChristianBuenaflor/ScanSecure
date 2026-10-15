import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TypingText, { nextIndex } from '../TypingText.jsx';

describe('nextIndex', () => {
  it('advances to next value', () => {
    expect(nextIndex(0, 3)).toBe(1);
    expect(nextIndex(2, 3)).toBe(0);
  });

  it('stays on 0 for single value', () => {
    expect(nextIndex(0, 1)).toBe(0);
  });
});

describe('TypingText renders', () => {
  it('shows first value when reduced motion', () => {
    window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
    render(<TypingText values={['a', 'b', 'c']} />);
    expect(screen.getByText('a')).toBeTruthy();
  });

  it('is accessible with aria-live', () => {
    window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
    const { container } = render(<TypingText values={['x']} aria-label="demo" />);
    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy();
  });
});
