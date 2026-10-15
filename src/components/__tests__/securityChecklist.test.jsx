import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SecurityChecklist from '../SecurityChecklist.jsx';

describe('SecurityChecklist renders', () => {
  it('shows Website Malware & Security header', () => {
    render(<SecurityChecklist findings={[]} />);
    expect(screen.getByText(/Website Malware & Security/i)).toBeTruthy();
  });

  it('shows 5 rows', () => {
    const { container } = render(<SecurityChecklist findings={[]} />);
    expect(container.querySelectorAll('[data-check-row]').length).toBe(5);
  });
});
