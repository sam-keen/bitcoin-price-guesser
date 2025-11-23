import { render, screen, fireEvent } from '@testing-library/react';
import { ResultDisplay } from './ResultDisplay';

describe('ResultDisplay', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const winningGuess = {
    direction: 'up' as const,
    priceAtGuess: 45000,
    priceAtResolution: 46000,
    won: true,
    scoreChange: 1,
  };

  const losingGuess = {
    direction: 'up' as const,
    priceAtGuess: 45000,
    priceAtResolution: 44000,
    won: false,
    scoreChange: -1,
  };

  it('displays WIN state when guess is correct', () => {
    render(<ResultDisplay resolvedGuess={winningGuess} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('[WIN]')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('SCORE +1')).toBeInTheDocument();
  });

  it('displays LOSS state when guess is incorrect', () => {
    render(<ResultDisplay resolvedGuess={losingGuess} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('[LOSS]')).toBeInTheDocument();
    expect(screen.getByText('✗')).toBeInTheDocument();
    expect(screen.getByText('SCORE -1')).toBeInTheDocument();
  });

  it('displays prices correctly formatted', () => {
    render(<ResultDisplay resolvedGuess={winningGuess} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('$45,000.00')).toBeInTheDocument();
    expect(screen.getByText('$46,000.00')).toBeInTheDocument();
  });

  it('shows correct prediction direction label for UP', () => {
    render(<ResultDisplay resolvedGuess={winningGuess} onDismiss={mockOnDismiss} />);

    expect(screen.getByText(/You predicted:.*▲ UP/)).toBeInTheDocument();
  });

  it('shows correct prediction direction label for DOWN', () => {
    const downGuess = { ...winningGuess, direction: 'down' as const };
    render(<ResultDisplay resolvedGuess={downGuess} onDismiss={mockOnDismiss} />);

    expect(screen.getByText(/You predicted:.*▼ DOWN/)).toBeInTheDocument();
  });

  it('shows correct market direction when market went UP', () => {
    render(<ResultDisplay resolvedGuess={winningGuess} onDismiss={mockOnDismiss} />);

    expect(screen.getByText(/Market went:.*▲ UP/)).toBeInTheDocument();
  });

  it('shows correct market direction when market went DOWN', () => {
    render(<ResultDisplay resolvedGuess={losingGuess} onDismiss={mockOnDismiss} />);

    expect(screen.getByText(/Market went:.*▼ DOWN/)).toBeInTheDocument();
  });

  it('calls onDismiss when TRY_AGAIN button is clicked', () => {
    render(<ResultDisplay resolvedGuess={winningGuess} onDismiss={mockOnDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: /try_again/i }));
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('handles negative score changes correctly', () => {
    render(<ResultDisplay resolvedGuess={losingGuess} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('SCORE -1')).toBeInTheDocument();
  });
});
