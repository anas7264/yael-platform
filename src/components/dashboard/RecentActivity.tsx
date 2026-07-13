'use client';

import Link from 'next/link';
import type { Route } from 'next';

type Session = {
  id: string;
  section: string;
  accuracy: number | null;
  xp_earned: number;
  created_at: string;
};

const SECTION_NAMES: Record<string, string> = {
  reading: 'استيعاب',
  vocabulary: 'مفردات',
  writing: 'كتابة',
  spelling: 'إملاء',
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'بالأمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return date.toLocaleDateString('ar-SA');
}

const SECTION_COLORS: Record<string, string> = {
  reading: 'bg-indigo-500/10 text-indigo-400',
  vocabulary: 'bg-yellow-500/10 text-yellow-400',
  writing: 'bg-violet-500/10 text-violet-400',
  spelling: 'bg-emerald-500/10 text-emerald-400',
};

interface RecentActivityProps {
  sessions: Session[];
}

export function RecentActivity({ sessions }: RecentActivityProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">النشاط الأخير</h2>
        <Link href={'/analytics' as Route} className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
          عرض الكل
        </Link>
      </div>
      <div className="rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden divide-y divide-border-subtle">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-text-tertiary">لا يوجد نشاط أخير بعد.</div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 hover:bg-bg-tertiary/40 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${SECTION_COLORS[session.section] || 'bg-gray-500/10 text-gray-400'}`}>
                  {SECTION_NAMES[session.section] || session.section}
                </span>
                <span className="text-sm text-text-secondary">{formatRelativeTime(session.created_at)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-text-secondary">دقة {session.accuracy !== null ? Math.round(session.accuracy) : 0}%</span>
                <span className="font-bold text-emerald-400">+{session.xp_earned} XP</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
