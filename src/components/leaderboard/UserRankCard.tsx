'use client';

import Trophy from 'lucide-react/dist/esm/icons/trophy';
import ArrowUpCircle from 'lucide-react/dist/esm/icons/arrow-up-circle';
import { LeaderboardUser } from './LeaderboardTable';

interface UserRankCardProps {
  user: LeaderboardUser | undefined;
  xpToNextRank: number | null;
}

export function UserRankCard({ user, xpToNextRank }: UserRankCardProps) {
  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40 animate-slide-up">
      <div className="bg-bg-secondary/90 backdrop-blur-md border border-primary-500/30 rounded-2xl p-4 shadow-xl shadow-primary-500/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">ترتيبك الحالي</p>
            <p className="font-bold text-lg text-primary-500 font-mono">#{user.rank}</p>
          </div>
        </div>

        {xpToNextRank && xpToNextRank > 0 && (
          <div className="text-end border-r border-border-subtle pr-4">
            <p className="text-xs text-text-secondary flex items-center justify-end gap-1 mb-1">
              للترتيب التالي <ArrowUpCircle className="w-3 h-3 text-emerald-500" />
            </p>
            <p className="font-bold text-sm" dir="ltr">
              <span className="text-emerald-500">+{xpToNextRank.toLocaleString()}</span> XP
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
