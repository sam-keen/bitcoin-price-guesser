import classNames from 'classnames';

interface ResolvedGuess {
  direction: 'up' | 'down';
  priceAtGuess: number;
  priceAtResolution: number;
  won: boolean;
  scoreChange: number;
}

interface ResultDisplayProps {
  resolvedGuess: ResolvedGuess;
  onDismiss: () => void;
}

export function ResultDisplay({ resolvedGuess, onDismiss }: ResultDisplayProps) {
  const { won, direction, priceAtGuess, priceAtResolution, scoreChange } = resolvedGuess;
  const marketUp = priceAtResolution > priceAtGuess;

  const containerClasses = classNames(
    'bg-black border-3 p-5 shadow-2xl relative overflow-hidden',
    {
      'border-neon-green': won,
      'border-neon-red': !won,
    }
  );

  const gradientClasses = classNames(
    'absolute inset-0 bg-gradient-to-br to-transparent',
    {
      'from-neon-green/20': won,
      'from-neon-red/20': !won,
    }
  );

  const resultTextClasses = classNames(
    'text-4xl font-bold mb-2 font-mono neon-glow',
    {
      'text-neon-green': won,
      'text-neon-red': !won,
    }
  );

  const pnlClasses = classNames(
    'text-2xl font-mono',
    {
      'text-neon-green': won,
      'text-neon-red': !won,
    }
  );

  const summaryBoxClasses = classNames(
    'w-full max-w-lg mx-auto bg-black/60 border-2 border-neon-cyan/30 p-3 mb-4'
  );

  const buttonClasses = classNames(
    'block mx-auto bg-black/90 border-2 border-neon-green cursor-pointer',
    'hover:bg-neon-green/10 text-neon-green',
    'font-bold py-4 px-6 transition-all font-mono text-lg',
    'hover:shadow-[0_0_30px_rgba(0,255,65,0.5)]',
    'rounded-3xl hover:scale-105'
  );

  return (
    <div className={containerClasses}>
      <div className={gradientClasses}></div>

      <div className="relative z-10">
        <div className="flex items-center justify-center gap-4 text-center mb-4">
          <div className="text-8xl mb-4 glitch">
            {won ? '✓' : '✗'}
          </div>
          <div className="flex flex-col">
            <div className={resultTextClasses}>
              {won ? '[WIN]' : '[LOSS]'}
            </div>
            <div className={pnlClasses}>
              SCORE {scoreChange > 0 ? '+' : ''}{scoreChange}
            </div>
          </div>
        </div>

        <div className={summaryBoxClasses}>
          <div className="flex justify-between items-center m-2">
            <div>
              <div className={classNames('text-xs font-mono mb-1', {
                'text-neon-green': direction === 'up',
                'text-neon-red': direction === 'down',
              })}>
                You predicted: {direction === 'up' ? '▲ UP' : '▼ DOWN'}
              </div>
              <div className="text-2xl font-bold text-neon-cyan font-mono">
                ${priceAtGuess.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-3xl text-neon-cyan">→</div>
            <div>
              <div className={classNames('text-xs font-mono mb-1', {
                'text-neon-green': marketUp,
                'text-neon-red': !marketUp,
              })}>
                Market went: {marketUp ? '▲ UP' : '▼ DOWN'}
              </div>
              <div className="text-2xl font-bold text-neon-cyan font-mono">
                ${priceAtResolution.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className={buttonClasses}
        >
          &gt; TRY_AGAIN
        </button>
      </div>
    </div>
  );
}
