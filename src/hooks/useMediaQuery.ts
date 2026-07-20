'use client';
import { useState, useEffect } from 'react';

/**
 * Returns whether a media query matches.
 * SSR-safe: returns false on the server.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Convenience: true when viewport is mobile (< 768px) */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/** Convenience: true when viewport is desktop (≥ 1024px) */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/** Convenience: true when user prefers reduced motion */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
