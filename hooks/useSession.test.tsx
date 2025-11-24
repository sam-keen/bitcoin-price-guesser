import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from './useSession';
import { ReactNode } from 'react';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('starts with isLoading true', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: 'new-user-123', score: 0 }),
    });

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.userId).toBeNull();
  });

  it('reads existing userId from localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('existing-user-456');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: 'existing-user-456', score: 10 }),
    });

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('bitcoinPriceGuesserUserId');
    expect(result.current.userId).toBe('existing-user-456');
  });

  it('stores new userId in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: 'new-user-789', score: 0 }),
    });

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'bitcoinPriceGuesserUserId',
        'new-user-789'
      );
    });
  });

  it('sends Authorization header when userId exists', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('existing-user-456');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: 'existing-user-456', score: 5 }),
    });

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer existing-user-456',
      },
    });
  });

  it('handles fetch error', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.userId).toBeNull();
  });
});
