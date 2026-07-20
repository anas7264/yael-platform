'use client';
import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  target: number;
  duration?: number; // ms, default 1200
  start?: number;    // default 0
  decimals?: number; // default 0
}

/**
 * Animates a number from `start` to `target` over `duration` ms using
 * requestAnimationFrame. Returns the current animated value.
 */
export function useCountUp({
  target,
  duration = 1200,
  start = 0,
  decimals = 0,
}: UseCountUpOptions): number {
  const [value, setValue] = useState<number>(start);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    startTimeRef.current = null;
    setValue(start);

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;

      const factor = Math.pow(10, decimals);
      setValue(Math.round(current * factor) / factor);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, start, decimals]);

  return value;
}
