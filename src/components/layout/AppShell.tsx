'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import type { Profile, UserProgress } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  user: Profile | null;
  progress?: UserProgress | null;
}

export function AppShell({ children, user, progress }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Skip-to-content: first focusable element, visually hidden until focused */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-primary-500 focus:text-white focus:font-bold focus:shadow-lg"
      >
        تخطي إلى المحتوى الرئيسي
      </a>

      <Sidebar />
      <div className="flex-1 flex flex-col lg:ms-[280px] pb-16 lg:pb-0">
        <Header user={user} progress={progress} />
        <main id="main-content" className="flex-1 p-4 lg:p-8 overflow-x-hidden" tabIndex={-1}>
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
