'use client';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
