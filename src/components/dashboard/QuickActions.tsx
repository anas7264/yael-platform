'use client';

import Link from 'next/link';
import { Sparkles, BookOpen, ClipboardList, MessageCircle } from 'lucide-react';
import type { Route } from 'next';

interface QuickActionsProps {
  dueVocabCount: number;
}

export function QuickActions({ dueVocabCount }: QuickActionsProps) {
  const actions = [
    {
      href: '/practice' as Route,
      icon: <Sparkles className="w-6 h-6" />,
      title: 'ابدأ تمرين',
      desc: 'تدرب على أسئلة مكيّفة لمستواك',
      gradient: 'from-primary-600 to-indigo-600',
      glow: 'hover:shadow-glow-primary',
    },
    {
      href: '/vocabulary/review' as Route,
      icon: <BookOpen className="w-6 h-6" />,
      title: 'راجع المفردات',
      desc: 'بطاقات FSRS الذكية',
      gradient: 'from-yellow-500 to-amber-600',
      glow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]',
      badge: dueVocabCount > 0 ? dueVocabCount : null,
    },
    {
      href: '/exam' as Route,
      icon: <ClipboardList className="w-6 h-6" />,
      title: 'امتحان تجريبي',
      desc: 'محاكاة كاملة لامتحان ياعيل',
      gradient: 'from-violet-600 to-purple-700',
      glow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]',
    },
    {
      href: '/tutor' as Route,
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'تحدث مع المعلم',
      desc: 'مساعد ذكاء اصطناعي متخصص',
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">إجراءات سريعة</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div
              className={`relative overflow-hidden rounded-xl p-5 text-white bg-gradient-to-br ${action.gradient} ${action.glow} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              {action.badge !== null && action.badge !== undefined && (
                <span className="absolute top-3 left-3 bg-white text-yellow-600 text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {action.badge}
                </span>
              )}
              <div className="mb-3 opacity-90">{action.icon}</div>
              <p className="font-bold text-sm">{action.title}</p>
              <p className="text-white/70 text-xs mt-1">{action.desc}</p>
              <div className="absolute bottom-0 left-0 w-full h-full bg-white opacity-0 hover:opacity-5 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
