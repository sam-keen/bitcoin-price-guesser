'use client';

import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { usePrice } from '@/hooks/usePrice';
import { useUser } from '@/hooks/useUser';
import { useSubmitGuess } from '@/hooks/useSubmitGuess';
import { useCountdown } from '@/hooks/useCountdown';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { PriceDisplay } from '@/components/PriceDisplay';
import { GuessForm } from '@/components/GuessForm';
import { CountdownTimer } from '@/components/CountdownTimer';
import { ResultDisplay } from '@/components/ResultDisplay';
import { useQueryClient } from '@tanstack/react-query';
import { COUNTDOWN_SECONDS } from '@/lib/constants';

export default function Home() {
  const queryClient = useQueryClient();
  const { userId, isLoading: sessionLoading } = useSession();
  const { data: priceData, isLoading: priceLoading } = usePrice();
  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useUser(userId);
  const submitGuess = useSubmitGuess(userId);

  // Countdown timer logic
  const handleCountdownDone = useCallback(() => {
    // When countdown finishes, refetch user data to trigger resolution
    refetchUser();
  }, [refetchUser]);

  const { secondsRemaining } = useCountdown(
    userData?.activeGuess?.timestampAtGuess || null,
    COUNTDOWN_SECONDS,
    handleCountdownDone
  );

  // If countdown is at 0 and we still have an active guess, keep polling
  useEffect(() => {
    if (userData?.activeGuess && secondsRemaining <= 0) {
      const interval = setInterval(() => {
        refetchUser();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [userData?.activeGuess, secondsRemaining, refetchUser]);

  const handleGuess = async (direction: 'up' | 'down') => {
    submitGuess.mutate(direction);
  };

  const handleDismissResult = () => {
    // Invalidate user query to clear resolved guess and allow new guess
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
  };

  const isLoading = sessionLoading || userLoading;

  // Shared layout class for side-by-side displays
  const sideBySideGridClasses = classNames(
    'grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4'
  );

  // Prediction entry display classes
  const predictionContainerClasses = classNames(
    'bg-black border-3 border-neon-purple p-4',
    'text-center shadow-2xl relative overflow-hidden'
  );

  const predictionGradientClasses = classNames(
    'absolute inset-0 bg-gradient-to-br from-neon-purple/15 to-neon-cyan/15'
  );

  const predictionHeaderClasses = classNames(
    'text-xs uppercase tracking-[0.3em] mb-2',
    'flex items-center justify-center gap-2',
    'text-neon-cyan font-mono'
  );

  const predictionPriceClasses = classNames(
    'text-3xl md:text-5xl font-bold mb-3',
    'text-neon-green neon-glow font-mono'
  );

  const getDirectionTextClasses = (direction: 'up' | 'down') =>
    classNames({
      'text-neon-green': direction === 'up',
      'text-neon-red': direction === 'down',
    });

  return (
    <div className="min-h-screen bg-black text-neon-green relative overflow-hidden">
      {/* Scan lines overlay */}
      <div className="crt-lines fixed inset-0 pointer-events-none z-50"></div>

      <div className="container mx-auto px-4 py-6 max-w-5xl relative z-10">
        <header className="text-center mb-8 border border-neon-cyan/30 p-5 bg-black/80">
          <h1
            className="text-5xl font-black mb-2 flex items-center justify-center gap-3"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            <svg
              viewBox="0 0 32 32"
              className="w-8 min-w-8 h-8 sm:w-10 sm:min-w-10 sm:h-10"
              aria-label="Bitcoin"
            >
              <circle cx="16" cy="16" r="16" className="fill-neon-orange" />
              <path
                className="fill-black"
                d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
              />
            </svg>
            <span className="gradient-text tracking-[0.1em]">PREDICT</span>
          </h1>
          <p className="text-neon-cyan text-base font-mono tracking-[0.2em]">
            &gt; PREDICT <span className="-mx-3">_BTC_</span> PRICE_MOVEMENT
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Score & Price - Side by side on desktop */}
          {!userData?.activeGuess && (
            <div className={sideBySideGridClasses}>
              <ScoreDisplay score={userData?.score || 0} isLoading={isLoading} />
              <PriceDisplay price={priceData?.price} isLoading={priceLoading} />
            </div>
          )}

          {/* Score & prediction Entry - Side by side when active guess */}
          {userData?.activeGuess && !userData?.resolvedGuess && (
            <div className={sideBySideGridClasses}>
              <ScoreDisplay score={userData?.score || 0} isLoading={isLoading} />
              {/* prediction Entry Display */}
              <div className={predictionContainerClasses}>
                <div className={predictionGradientClasses}></div>
                <div className="relative z-10">
                  <div className={predictionHeaderClasses}>
                    <span className="leading-0 text-xl">⚡</span>
                    <span className="mr-2">[PREDICTION_ENTERED]</span>
                    <span className={getDirectionTextClasses(userData.activeGuess.direction)}>
                      {userData.activeGuess.direction === 'up' ? '▲ UP' : '▼ DOWN'}
                    </span>
                  </div>
                  <div className={predictionPriceClasses}>
                    $
                    {userData.activeGuess.priceAtGuess.toLocaleString('en-US', {
                      minimumFractionDigits: 2, maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Countdown Timer - Full width below prediction */}
          {userData?.activeGuess && !userData?.resolvedGuess && (
            <CountdownTimer secondsRemaining={secondsRemaining} />
          )}

          {/* Resolved Guess Result */}
          {userData?.resolvedGuess && (
            <ResultDisplay resolvedGuess={userData.resolvedGuess} onDismiss={handleDismissResult} />
          )}

          {/* Guess Form - Only show if no active guess and no resolved guess to display */}
          {!userData?.activeGuess && !userData?.resolvedGuess && (
            <div className="space-y-3">
              <div className="text-center mt-12 mb-4">
                <p className="text-lg text-neon-cyan font-mono tracking-[0.2em]">
                  &gt;{' '}
                  {priceData?.price ? (
                    <>
                      ENTER <span className="-mx-3">_BTC_</span> PRICE_PREDICTION
                    </>
                  ) : (
                    'AWAITING_LIVE_PRICE'
                  )}
                </p>
              </div>
              <div className={!priceData?.price ? 'opacity-50' : ''}>
                <GuessForm
                  onSubmit={handleGuess}
                  disabled={!userId || submitGuess.isPending || !priceData?.price}
                  isLoading={submitGuess.isPending}
                  submittingDirection={submitGuess.isPending ? submitGuess.variables : null}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-white/60 text-xs font-mono border-t border-white/20 pt-4">
          <p>[ANONYMOUS_SESSION] • [PERSISTENT_STORAGE]</p>
          <p className="mt-2">&gt; DATA_FEED: Coinbase_API | REFRESH_RATE: 5s</p>
        </footer>
      </div>
    </div>
  );
}
