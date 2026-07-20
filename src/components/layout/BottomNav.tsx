'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, BookOpen, Languages, ClipboardCheck, Sparkles } from 'lucide-react';

const UI_TEXT = {
  nav: {
    dashboard: 'الرئيسية',
    practice: 'التدريب',
    vocab: 'المفردات',
    exam: 'الامتحانات',
    tutor: 'المعلم',
  }
};

const navItems = [
  { href: '/dashboard', label: UI_TEXT.nav.dashboard, icon: LayoutDashboard },
  { href: '/practice', label: UI_TEXT.nav.practice, icon: BookOpen },
  { href: '/vocabulary', label: UI_TEXT.nav.vocab, icon: Languages },
  { href: '/exam', label: UI_TEXT.nav.exam, icon: ClipboardCheck },
  { href: '/tutor', label: UI_TEXT.nav.tutor, icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 h-16 bg-bg-secondary border-t border-border-subtle lg:hidden pb-safe"
      aria-label="التنقل السريع"
    >
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href as Route}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md',
                isActive ? 'text-primary-500' : 'text-text-tertiary hover:text-text-primary'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
