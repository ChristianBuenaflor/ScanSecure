import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FooterVisual from '../FooterVisual.jsx';

describe('FooterVisual', () => {
  it('renders shield illustration with accessible label', () => {
    render(<FooterVisual />);
    expect(screen.getByLabelText(/site security illustration/i)).toBeTruthy();
  });

  it('is monochrome black only (no green)', () => {
    const { container } = render(<FooterVisual />);
    expect(container.innerHTML).not.toMatch(/#10b981|#059669/i);
  });
});
