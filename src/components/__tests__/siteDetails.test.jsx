import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SiteDetails from '../SiteDetails.jsx';

describe('SiteDetails renders', () => {
  it('shows Site Details header and system rows', () => {
    render(<SiteDetails findings={[]} url="https://example.com/" meta={{}} />);
    expect(screen.getByText(/Site Details/i)).toBeTruthy();
    expect(screen.getByText(/System info/i)).toBeTruthy();
  });
});
