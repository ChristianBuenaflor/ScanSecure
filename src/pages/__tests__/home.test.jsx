import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home.jsx';

describe('Home landing', () => {
  it('renders hero headline and start scan CTA', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /scan websites for malware & security/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /start a scan/i })).toBeTruthy();
  });

  it('renders feature grid', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getByText(/Security headers/i)).toBeTruthy();
  });

  it('uses all-black minimal theme', () => {
    const { container } = render(<MemoryRouter><Home /></MemoryRouter>);
    expect(container.firstChild.className).toMatch(/bg-black/);
  });
});
