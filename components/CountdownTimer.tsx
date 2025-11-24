import classNames from 'classnames';
import { COUNTDOWN_SECONDS } from '@/lib/constants';

interface CountdownTimerProps {
  secondsRemaining: number;
}

export function CountdownTimer({ secondsRemaining }: CountdownTimerProps) {
  const isResolving = secondsRemaining <= 0;

  // Progress from 0% (COUNTDOWN_SECONDS remaining) to 100% (0s remaining)
  const totalDuration = COUNTDOWN_SECONDS;
  const progress = Math.min(
    100,
    Math.max(0, ((totalDuration - secondsRemaining) / totalDuration) * 100)
  );

  const containerClasses = classNames(
    'bg-black border-3 border-neon-yellow p-4',
    'text-center shadow-2xl relative overflow-hidden',
    { 'animate-pulse': isResolving }
  );

  const headerClasses = classNames(
    'text-xs uppercase tracking-[0.3em] mb-2',
    'font-bold text-neon-yellow font-mono'
  );

  const footerClasses = classNames('text-sm mt-2 text-neon-yellow/80 font-mono');

  if (isResolving) {
    return (
      <div className={containerClasses}>
        <div className="absolute inset-0 bg-gradient-to-br from-neon-yellow/20 to-neon-orange/20"></div>
        <div className="relative z-10">
          <div className={headerClasses}>[RESOLVING]</div>
          <div className="text-3xl font-bold text-neon-yellow font-mono glitch">
            ⏳ AWAITING <span className="-mx-4">_PRICE_</span> CHANGE
          </div>
          <div className={footerClasses}>&gt; Waiting for market movement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Progress bar that fills from left to right as time runs out */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent to-neon-yellow/25 transition-[width] duration-200 ease-linear"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-neon-yellow/10 to-transparent"></div>
      <div className="relative z-10">
        <div className={headerClasses}>[AWAITING_RESULT]</div>
        <div className="text-7xl font-bold text-neon-yellow font-mono neon-glow">
          {secondsRemaining}s
        </div>
      </div>
    </div>
  );
}
