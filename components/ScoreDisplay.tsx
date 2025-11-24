import classNames from 'classnames';

interface ScoreDisplayProps {
  score: number;
  isLoading: boolean;
}

export function ScoreDisplay({ score, isLoading }: ScoreDisplayProps) {
  const isPositive = score > 0;
  const isNegative = score < 0;

  const containerClasses = classNames(
    'bg-black border-3 border-neon-orange p-4',
    'text-center shadow-xl relative overflow-hidden'
  );

  const scoreClasses = classNames(
    'self-center text-4xl md:text-5xl font-bold font-mono neon-glow',
    {
      'text-neon-green': isPositive,
      'text-neon-red': isNegative,
      'text-neon-cyan': !isPositive && !isNegative,
    }
  );

  return (
    <div className={containerClasses}>
      <div className="absolute inset-0 bg-gradient-to-br from-neon-orange/20 to-transparent"></div>
      <div className="h-full grid grid-rows-[auto_1fr] relative z-10">
        <div className="text-xs uppercase tracking-[0.3em] mb-1.5 text-neon-cyan font-mono">
          [CURRENT_SCORE]
        </div>
        <div className={scoreClasses}>{isLoading ? '...' : score > 0 ? `+${score}` : score}</div>
      </div>
    </div>
  );
}
