'use client';

import { useEffect, useState } from 'react';

/**
 * Countdown timer hook
 * Counts seconds remaining from a start time
 * Calls onDone when countdown reaches 0
 */
export function useCountdown(
  startTime: number | null,
  totalSeconds: number,
  onDone: () => void
) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);

  useEffect(() => {
    if (!startTime) {
      return;
    }

    // Calculate initial seconds remaining
    const now = Date.now();
    const elapsed = (now - startTime) / 1000;
    const remaining = Math.max(0, totalSeconds - elapsed);

    setSecondsRemaining(Math.ceil(remaining));

    if (remaining <= 0) {
      onDone();
      return;
    }

    // Update every second
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const remaining = Math.max(0, totalSeconds - elapsed);

      setSecondsRemaining(Math.ceil(remaining));

      if (remaining <= 0) {
        clearInterval(interval);
        onDone();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, totalSeconds, onDone]);

  return {
    secondsRemaining,
    isActive: startTime !== null && secondsRemaining > 0,
  };
}
