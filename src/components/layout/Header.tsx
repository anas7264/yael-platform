'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Menu from 'lucide-react/dist/esm/icons/menu';
import Bell from 'lucide-react/dist/esm/icons/bell';
import Flame from 'lucide-react/dist/esm/icons/flame';
import X from 'lucide-react/dist/esm/icons/x';
import Star from 'lucide-react/dist/esm/icons/star';
import { useAppStore } from '@/stores/useAppStore';
import { Badge } from '@/components/ui/Badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useBadgeUnlock } from '@/hooks/useBadgeUnlock';
import type { Profile, UserProgress } from '@/types';

interface HeaderProps {
  user: Profile | null;
  progress?: UserProgress | null;
  pageTitle?: string;
}

export function Header({ user, progress, pageTitle = 'الرئيسية' }: HeaderProps) {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  // --- Realtime hooks ---
  const { unreadCount, toast, markAllRead } = useNotifications();
  const { celebrationBadge, dismissCelebration } = useBadgeUnlock();

  // Live XP: start from server-rendered value, update via realtime
  const [liveXp, setLiveXp] = useState<number>(progress?.xp ?? 0);
  useEffect(() => {
    if (progress?.xp !== undefined) setLiveXp(progress.xp);
  }, [progress?.xp]);

  // Notification panel open state
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8 bg-bg-secondary/80 backdrop-blur border-b border-border-subtle">
        {/* Hamburger (mobile) */}
        <div className="flex items-center gap-4 lg:hidden">
          <button onClick={toggleSidebar} className="text-text-secondary hover:text-text-primary" aria-label="فتح القائمة">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Page title (desktop) */}
        <div className="hidden lg:flex items-center">
          <h1 className="text-xl font-bold text-text-primary">{pageTitle}</h1>
        </div>

        {/* Right-side controls */}
        <div className="flex flex-1 lg:flex-none items-center justify-end gap-4">
          {/* Live XP + Streak */}
          {progress && (
            <div className="hidden sm:flex items-center gap-3">
              <Badge variant="xp" aria-live="polite">XP {liveXp}</Badge>
              <Badge variant="streak" className="gap-1">
                <Flame className="w-4 h-4 fill-current" />
                <span aria-live="polite">{progress.streak_days}</span>
              </Badge>
            </div>
          )}

          {/* Notification bell */}
          <button
            className="relative text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => { setNotifOpen(v => !v); if (notifOpen) markAllRead(); }}
            aria-label={`الإشعارات — ${unreadCount} غير مقروء`}
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span
                aria-live="polite"
                className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold bg-accent-rose text-white rounded-full flex items-center justify-center animate-bounce"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Avatar */}
          {user?.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <Image src={user.avatar_url} alt="Avatar" width={36} height={36} className="rounded-full border border-border-subtle object-cover" priority />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center font-bold border border-primary-500/30">
              {user?.full_name?.charAt(0) || 'م'}
            </div>
          )}
        </div>
      </header>

      {/* Notification Toast */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 right-6 z-50 max-w-xs w-full bg-bg-secondary border border-primary-500/30 rounded-2xl p-4 shadow-xl animate-slide-up"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary">إشعار جديد</p>
              <p className="text-xs text-text-secondary mt-1">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Badge Unlock Celebration Modal */}
      {celebrationBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="تهانينا! حصلت على وسام جديد"
        >
          <div className="relative bg-bg-secondary border border-primary-500/30 rounded-3xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl shadow-primary-500/20 overflow-hidden">
            {/* Confetti-style decorative circles */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full -translate-x-12 -translate-y-12 animate-ping" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full translate-x-16 translate-y-16 animate-ping" style={{ animationDelay: '300ms' }} />

            <button
              onClick={dismissCelebration}
              className="absolute top-4 left-4 text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative">
              <div className="w-28 h-28 mx-auto rounded-full bg-amber-400/10 border-4 border-amber-400/30 flex items-center justify-center text-7xl mb-4 shadow-xl shadow-amber-400/10 animate-bounce">
                {celebrationBadge.icon}
              </div>

              <div className="flex items-center justify-center gap-1 mb-3">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">إنجاز جديد</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>

              <h2 className="text-2xl font-bold text-text-primary mb-2">{celebrationBadge.name}</h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">{celebrationBadge.description}</p>

              <button
                onClick={dismissCelebration}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-primary-500/20"
              >
                رائع! شكراً
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
