import classNames from 'classnames';

interface GuessFormProps {
  onSubmit: (direction: 'up' | 'down') => void;
  disabled: boolean;
  isLoading: boolean;
  submittingDirection?: 'up' | 'down' | null;
}

export function GuessForm({ onSubmit, disabled, isLoading, submittingDirection }: GuessFormProps) {
  const baseButtonClasses = classNames(
    'bg-black/90 border-2 font-bold py-3 px-12 text-xl sm:text-2xl',
    'transition-all flex flex-col items-center justify-center font-mono',
    'relative overflow-hidden group cursor-pointer',
    'rounded-3xl hover:scale-105 hover:bg-black'
  );

  const disabledClasses = classNames(
    'disabled:border-gray-600',
    'disabled:cursor-not-allowed',
    'disabled:text-gray-600'
  );

  const upButtonClasses = classNames(
    baseButtonClasses,
    disabledClasses,
    'border-neon-green text-neon-green',
    'shadow-[0_0_30px_rgba(0,255,65,0.5)]',
    'hover:bg-neon-green/10',
    'hover:shadow-[0_0_50px_rgba(0,255,65,0.8)]'
  );

  const downButtonClasses = classNames(
    baseButtonClasses,
    disabledClasses,
    'border-neon-red text-neon-red',
    'shadow-[0_0_30px_rgba(255,0,85,0.6)]',
    'hover:bg-neon-red/10',
    'hover:shadow-[0_0_50px_rgba(255,0,85,0.8)]'
  );

  return (
    <div className="flex gap-6 justify-center">
      <button
        onClick={() => onSubmit('up')}
        disabled={disabled || isLoading}
        className={upButtonClasses}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-neon-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {submittingDirection === 'up' ? (
          <span className="tracking-wider relative z-10 text-lg">submitting...</span>
        ) : (
          <>
            <span className="relative z-10 text-base">▲</span>
            <span className="tracking-wider relative z-10">GOING UP</span>
          </>
        )}
      </button>
      <button
        onClick={() => onSubmit('down')}
        disabled={disabled || isLoading}
        className={downButtonClasses}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-neon-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {submittingDirection === 'down' ? (
          <span className="tracking-wider relative z-10 text-lg">submitting...</span>
        ) : (
          <>
            <span className="relative z-10 text-base">▼</span>
            <span className="tracking-wider relative z-10">GOING DOWN</span>
          </>
        )}
      </button>
    </div>
  );
}
