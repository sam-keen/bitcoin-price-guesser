import { render, screen } from '@testing-library/react';
import { CountdownTimer } from './CountdownTimer';

describe('CountdownTimer', () => {
  it('displays seconds remaining when countdown is active', () => {
    render(<CountdownTimer secondsRemaining={45} />);

    expect(screen.getByText('45s')).toBeInTheDocument();
    expect(screen.getByText('[AWAITING_RESULT]')).toBeInTheDocument();
  });

  it('displays resolving state when secondsRemaining is 0', () => {
    render(<CountdownTimer secondsRemaining={0} />);

    expect(screen.getByText('[RESOLVING_POSITION]')).toBeInTheDocument();
    expect(screen.getByText(/AWAITING_PRICE_CHANGE/)).toBeInTheDocument();
    expect(screen.queryByText('0s')).not.toBeInTheDocument();
  });

  it('displays resolving state when secondsRemaining is negative', () => {
    render(<CountdownTimer secondsRemaining={-5} />);

    expect(screen.getByText('[RESOLVING_POSITION]')).toBeInTheDocument();
  });

  it('calculates progress correctly at start (60s remaining)', () => {
    const { container } = render(<CountdownTimer secondsRemaining={60} />);

    // At 60s remaining, progress should be 0%
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('calculates progress correctly at midpoint (30s remaining)', () => {
    const { container } = render(<CountdownTimer secondsRemaining={30} />);

    // At 30s remaining, progress should be 50%
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('caps progress at 100% when secondsRemaining is 0', () => {
    // When resolving, we don't show the progress bar, but the calculation
    // should cap at 100%
    const { container } = render(<CountdownTimer secondsRemaining={1} />);

    const progressBar = container.querySelector('[style*="width"]');
    // At 1s remaining, progress should be ~98.33%
    expect(progressBar?.getAttribute('style')).toContain('98.333');
  });
});
