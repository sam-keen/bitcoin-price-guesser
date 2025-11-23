import { renderHook, act } from '@testing-library/react';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns totalSeconds when startTime is null', () => {
    const onDone = jest.fn();
    const { result } = renderHook(() => useCountdown(null, 60, onDone));

    expect(result.current.secondsRemaining).toBe(60);
    expect(result.current.isActive).toBe(false);
    expect(onDone).not.toHaveBeenCalled();
  });

  it('calculates initial seconds remaining correctly', () => {
    const onDone = jest.fn();
    const now = Date.now();
    const startTime = now - 10000; // Started 10 seconds ago

    const { result } = renderHook(() => useCountdown(startTime, 60, onDone));

    expect(result.current.secondsRemaining).toBe(50);
    expect(result.current.isActive).toBe(true);
  });

  it('counts down every second', () => {
    const onDone = jest.fn();
    const startTime = Date.now();

    const { result } = renderHook(() => useCountdown(startTime, 60, onDone));

    expect(result.current.secondsRemaining).toBe(60);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.secondsRemaining).toBe(59);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.secondsRemaining).toBe(54);
  });

  it('calls onDone when countdown reaches 0', () => {
    const onDone = jest.fn();
    const startTime = Date.now();

    renderHook(() => useCountdown(startTime, 3, onDone));

    expect(onDone).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('calls onDone immediately if countdown already expired', () => {
    const onDone = jest.fn();
    const startTime = Date.now() - 70000; // Started 70 seconds ago

    renderHook(() => useCountdown(startTime, 60, onDone));

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('returns isActive false when countdown reaches 0', () => {
    const onDone = jest.fn();
    const startTime = Date.now();

    const { result } = renderHook(() => useCountdown(startTime, 2, onDone));

    expect(result.current.isActive).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.isActive).toBe(false);
  });

  it('does not go below 0 seconds', () => {
    const onDone = jest.fn();
    const startTime = Date.now();

    const { result } = renderHook(() => useCountdown(startTime, 2, onDone));

    act(() => {
      jest.advanceTimersByTime(5000); // Advance well past the countdown
    });

    expect(result.current.secondsRemaining).toBe(0);
  });

  it('clears interval on unmount', () => {
    const onDone = jest.fn();
    const startTime = Date.now();
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useCountdown(startTime, 60, onDone));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
