'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface GuessResponse {
  guessId: string;
  direction: 'up' | 'down';
  priceAtGuess: number;
  timestampAtGuess: number;
}

/**
 * Submit a new guess
 * Invalidates user query on success to refetch updated state
 */
export function useSubmitGuess(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<GuessResponse, Error, 'up' | 'down'>({
    mutationFn: async (direction) => {
      if (!userId) {
        throw new Error('No userId available');
      }

      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit guess');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate user query to fetch updated state with active guess
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}
