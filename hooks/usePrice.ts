'use client';

import { useQuery } from '@tanstack/react-query';

interface PriceResponse {
  price: number;
  timestamp: number;
}

/**
 * Fetch current Bitcoin price
 * Polls every 5 seconds
 */
export function usePrice() {
  return useQuery<PriceResponse>({
    queryKey: ['btcPrice'],
    queryFn: async () => {
      const response = await fetch('/api/price');

      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }

      return response.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });
}
