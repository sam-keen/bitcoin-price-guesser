import classNames from 'classnames';

interface PriceDisplayProps {
  price: number | undefined;
  isLoading: boolean;
}

export function PriceDisplay({ price, isLoading }: PriceDisplayProps) {
  const containerClasses = classNames(
    'bg-black border-3 border-neon-cyan p-4',
    'text-center shadow-2xl relative overflow-hidden',
    'scanline'
  );

  const headerClasses = classNames(
    'text-xs uppercase tracking-[0.3em] mb-2',
    'text-neon-cyan font-mono',
    'flex items-center justify-center gap-2'
  );

  const priceContainerClasses = classNames(
    'flex items-center justify-center my-2',
    'text-3xl md:text-5xl font-bold font-mono'
  );

  const footerClasses = classNames(
    'text-xs text-neon-cyan/60 mt-2 font-mono',
    'flex items-center justify-center gap-3'
  );

  return (
    <div className={containerClasses}>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/15 to-neon-purple/15 animate-pulse"></div>
      </div>
      <div className="relative z-10">
        <div className={headerClasses}>
          <span className="inline-block w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></span>
          [LIVE_MARKET_PRICE]
        </div>
        <div className={priceContainerClasses}>
          {isLoading ? (
            <span className="text-neon-cyan/50 glitch">loading...</span>
          ) : price !== undefined ? (
            <span className="text-neon-cyan neon-glow">
              ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          ) : (
            <span className="text-neon-cyan/50">--</span>
          )}
        </div>
        <div className={footerClasses}>
          <span>BTC/USD</span>
          <span>•</span>
          <span>REFRESH: 5s</span>
        </div>
      </div>
    </div>
  );
}
