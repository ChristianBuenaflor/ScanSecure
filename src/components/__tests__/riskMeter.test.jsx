import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RiskMeter, { getRiskLevel } from '../RiskMeter.jsx';

describe('getRiskLevel maps grade A/B/C/D/F', () => {
  it('maps 90+ to Minimal', () => {
    expect(getRiskLevel(95).label).toBe('Minimal');
    expect(getRiskLevel(90).label).toBe('Minimal');
  });

  it('maps 80+ to Low Security Risk', () => {
    expect(getRiskLevel(85).label).toBe('Low Security Risk');
  });

  it('maps 70+ to Medium', () => {
    expect(getRiskLevel(75).label).toBe('Medium');
  });

  it('maps 60+ to High', () => {
    expect(getRiskLevel(65).label).toBe('High');
  });

  it('maps below 60 to Critical', () => {
    expect(getRiskLevel(30).label).toBe('Critical');
  });
});

describe('RiskMeter renders', () => {
  it('shows label and marker for score', () => {
    render(<RiskMeter score={85} />);
    expect(screen.getByText('Low Security Risk')).toBeTruthy();
  });
});
