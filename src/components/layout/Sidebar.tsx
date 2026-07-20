'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  BookOpen,
  Languages,
  ClipboardCheck,
  Sparkles,
  BarChart3,
  User,
  Trophy,
  Settings,
} from 'lucide-react';

const UI_TEXT = {
  nav: {
    dashboard: 'الرئيسية',
    practice: 'التدريب',
    vocab: 'المفردات',
    exam: 'الامتحانات',
    tutor: 'المعلم الذكي',
    analytics: 'التحليلات',
    leaderboard: 'لوحة الشرف',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
  }
};

const navItems = [
  { href: '/dashboard', label: UI_TEXT.nav.dashboard, icon: LayoutDashboard },
  { href: '/practice', label: UI_TEXT.nav.practice, icon: BookOpen },
  { href: '/vocabulary', label: UI_TEXT.nav.vocab, icon: Languages },
  { href: '/exam', label: UI_TEXT.nav.exam, icon: ClipboardCheck },
  { href: '/tutor', label: UI_TEXT.nav.tutor, icon: Sparkles },
  { href: '/analytics', label: UI_TEXT.nav.analytics, icon: BarChart3 },
  { href: '/leaderboard', label: UI_TEXT.nav.leaderboard, icon: Trophy },
  { href: '/profile', label: UI_TEXT.nav.profile, icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col w-[280px] h-screen fixed top-0 start-0 bg-bg-secondary border-e border-border-subtle z-40"
      aria-label="التنقل الرئيسي"
    >
      <div className="h-16 flex items-center px-6 border-b border-border-subtle shrink-0">
        <Link href={"/dashboard" as Route} className="text-2xl font-bold text-primary-500" aria-label="يَعَل — الصفحة الرئيسية">
          يَعَل
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-label="قائمة التنقل">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href as Route}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                isActive
                  ? 'bg-primary-500/10 text-primary-500 border-s-2 border-primary-500'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border-s-2 border-transparent'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-subtle shrink-0">
        <Link
          href={"/settings" as Route}
          aria-current={pathname.startsWith('/settings') ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            pathname.startsWith('/settings')
              ? 'bg-primary-500/10 text-primary-500 border-s-2 border-primary-500'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border-s-2 border-transparent'
          )}
        >
          <Settings className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>{UI_TEXT.nav.settings}</span>
        </Link>
      </div>
    </aside>
  );
}
