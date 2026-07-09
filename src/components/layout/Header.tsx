'use client';

import { Menu, Bell, Flame } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Badge } from '@/components/ui/Badge';
import type { Profile, UserProgress } from '@/types';

interface HeaderProps {
  user: Profile | null;
  progress?: UserProgress | null;
  pageTitle?: string;
}

export function Header({ user, progress, pageTitle = 'الرئيسية' }: HeaderProps) {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8 bg-bg-secondary/80 backdrop-blur border-b border-border-subtle">
      <div className="flex items-center gap-4 lg:hidden">
        <button onClick={toggleSidebar} className="text-text-secondary hover:text-text-primary">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="hidden lg:flex items-center">
        <h1 className="text-xl font-bold text-text-primary">{pageTitle}</h1>
      </div>

      <div className="flex flex-1 lg:flex-none items-center justify-end gap-4">
        {progress && (
          <div className="hidden sm:flex items-center gap-3">
            <Badge variant="xp">XP {progress.xp}</Badge>
            <Badge variant="streak" className="gap-1">
              <Flame className="w-4 h-4 fill-current" />
              <span>{progress.streak_days}</span>
            </Badge>
          </div>
        )}

        <button className="relative text-text-secondary hover:text-text-primary">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-accent-rose rounded-full" />
        </button>

        {user?.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={user.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full border border-border-subtle" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center font-bold border border-primary-500/30">
            {user?.full_name?.charAt(0) || 'م'}
          </div>
        )}
      </div>
    </header>
  );
}
