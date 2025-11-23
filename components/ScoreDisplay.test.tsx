import { render, screen } from '@testing-library/react';
import { ScoreDisplay } from './ScoreDisplay';

describe('ScoreDisplay', () => {
  it('displays loading state when isLoading is true', () => {
    render(<ScoreDisplay score={0} isLoading={true} />);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('displays positive score with + prefix', () => {
    render(<ScoreDisplay score={5} isLoading={false} />);

    expect(screen.getByText('+5')).toBeInTheDocument();
  });

  it('displays zero score without prefix', () => {
    render(<ScoreDisplay score={0} isLoading={false} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays negative score without + prefix', () => {
    render(<ScoreDisplay score={-3} isLoading={false} />);

    expect(screen.getByText('-3')).toBeInTheDocument();
  });

  it('displays the header label', () => {
    render(<ScoreDisplay score={0} isLoading={false} />);

    expect(screen.getByText('[CURRENT_SCORE]')).toBeInTheDocument();
  });

  it('applies green color class for positive scores', () => {
    const { container } = render(<ScoreDisplay score={5} isLoading={false} />);

    const scoreElement = container.querySelector('.text-neon-green');
    expect(scoreElement).toBeInTheDocument();
    expect(scoreElement).toHaveTextContent('+5');
  });

  it('applies red color class for negative scores', () => {
    const { container } = render(<ScoreDisplay score={-3} isLoading={false} />);

    const scoreElement = container.querySelector('.text-neon-red');
    expect(scoreElement).toBeInTheDocument();
    expect(scoreElement).toHaveTextContent('-3');
  });

  it('applies cyan color class for zero score', () => {
    const { container } = render(<ScoreDisplay score={0} isLoading={false} />);

    // The score element has the neon-glow class which distinguishes it from the header
    const scoreElement = container.querySelector('.text-neon-cyan.neon-glow');
    expect(scoreElement).toBeInTheDocument();
    expect(scoreElement).toHaveTextContent('0');
  });
});
