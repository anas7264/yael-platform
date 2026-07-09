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
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ms-[280px] pb-16 lg:pb-0">
        <Header user={user} progress={progress} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
