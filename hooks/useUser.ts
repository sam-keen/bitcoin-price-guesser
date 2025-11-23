'use client';

import { useQuery } from '@tanstack/react-query';

interface ActiveGuess {
  guessId: string;
  direction: 'up' | 'down';
  priceAtGuess: number;
  timestampAtGuess: number;
  secondsRemaining: number;
}

interface ResolvedGuess {
  guessId: string;
  direction: 'up' | 'down';
  priceAtGuess: number;
  priceAtResolution: number;
  won: boolean;
  scoreChange: number;
}

interface UserResponse {
  userId: string;
  score: number;
  activeGuess: ActiveGuess | null;
  resolvedGuess: ResolvedGuess | null;
}

/**
 * Fetch user data (score + active guess)
 * This triggers resolution if a guess is eligible
 */
export function useUser(userId: string | null) {
  return useQuery<UserResponse>({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('No userId provided');
      }

      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      return response.json();
    },
    enabled: !!userId, // Only run if we have a userId
  });
}
