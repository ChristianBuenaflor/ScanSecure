import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import History from '../History.jsx';

const entry = {
  id: 'h1',
  url: 'https://example.com/',
  score: 85,
  grade: 'B',
  findings: [{ id: 'content-ok', title: 'No obvious content issues', severity: 'pass', category: 'content' }],
  meta: {},
  at: Date.now(),
};

describe('History detail matches Scan view', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('sc_history', JSON.stringify([entry]));
  });

  it('shows risk meter, checklist and site details for selected scan', () => {
    render(<History />);
    fireEvent.click(screen.getByRole('button', { name: /view/i }));
    expect(screen.getAllByText(/Security risk/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Website Malware & Security/i)).toBeTruthy();
    expect(screen.getByText(/Site Details/i)).toBeTruthy();
  });
});
