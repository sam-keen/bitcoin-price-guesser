'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface SessionResponse {
  userId: string;
  score: number;
}

/**
 * Get or create user session
 * Stores userId in localStorage for persistence
 */
export function useSession() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialised, setIsInitialised] = useState(false);

  // Load userId from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('bitcoinPriceGuesserUserId');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrating from localStorage on mount
    setUserId(storedUserId);
    setIsInitialised(true);
  }, []);

  const { data, isLoading, error } = useQuery<SessionResponse>({
    queryKey: ['session', userId],
    queryFn: async () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // If we have a userId, send it in Authorization header
      if (userId) {
        headers['Authorization'] = `Bearer ${userId}`;
      }

      const response = await fetch('/api/session', {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to get session');
      }

      const data = await response.json();

      // Store userId in localStorage if it's new
      if (data.userId && data.userId !== userId) {
        localStorage.setItem('bitcoinPriceGuesserUserId', data.userId);
        setUserId(data.userId);
      }

      return data;
    },
    enabled: isInitialised, // Only run after we've checked localStorage
  });

  return {
    userId: data?.userId || null,
    isLoading: !isInitialised || isLoading,
    error,
  };
}
