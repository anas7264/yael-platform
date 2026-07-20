'use client';

import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Image from 'next/image';

interface TopUser {
  id: string;
  rank: number;
  name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
}

interface TopThreeProps {
  users: TopUser[];
}

export function TopThree({ users }: TopThreeProps) {
  // We expect up to 3 users sorted by rank
  const rank1 = users.find(u => u.rank === 1);
  const rank2 = users.find(u => u.rank === 2);
  const rank3 = users.find(u => u.rank === 3);

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-6 pt-12 pb-8">
      {/* Rank 2 (Silver) */}
      {rank2 && (
        <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="relative mb-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-300 bg-bg-tertiary overflow-hidden flex items-center justify-center shadow-lg">
              {rank2.avatar_url ? (
                <Image src={rank2.avatar_url} alt={rank2.name} fill className="object-cover" />
              ) : (
                <span className="text-xl font-bold text-slate-400">{rank2.name.charAt(0)}</span>
              )}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-slate-300 rounded-full flex items-center justify-center border-2 border-bg-primary text-slate-700 shadow-sm z-10">
              <span className="text-xs font-bold font-mono">2</span>
            </div>
          </div>
          <div className="text-center mt-3 w-24 sm:w-28 bg-bg-secondary p-3 pb-6 rounded-t-2xl border border-b-0 border-slate-300/30">
            <p className="font-bold text-sm truncate" title={rank2.name}>{rank2.name}</p>
            <p className="text-xs text-text-tertiary mt-1">مستوى {rank2.level}</p>
            <p className="text-xs font-bold text-slate-400 mt-1" dir="ltr">{rank2.xp.toLocaleString()} XP</p>
          </div>
        </div>
      )}

      {/* Rank 1 (Gold) */}
      {rank1 && (
        <div className="flex flex-col items-center relative z-10 -mt-8 animate-fade-in">
          <div className="absolute -top-8 text-amber-400 animate-bounce">
            <Trophy className="w-10 h-10 drop-shadow-lg fill-amber-400/20" />
          </div>
          <div className="relative mb-2">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400 bg-bg-tertiary overflow-hidden flex items-center justify-center shadow-xl shadow-amber-400/20">
              {rank1.avatar_url ? (
                <Image src={rank1.avatar_url} alt={rank1.name} fill className="object-cover" />
              ) : (
                <span className="text-2xl font-bold text-amber-500">{rank1.name.charAt(0)}</span>
              )}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center border-2 border-bg-primary text-white shadow-md z-10">
              <span className="text-sm font-bold font-mono">1</span>
            </div>
          </div>
          <div className="text-center mt-3 w-28 sm:w-32 bg-gradient-to-b from-amber-500/10 to-bg-secondary p-4 pb-10 rounded-t-2xl border border-b-0 border-amber-500/30">
            <p className="font-bold text-base truncate text-amber-600 dark:text-amber-400" title={rank1.name}>{rank1.name}</p>
            <p className="text-xs text-text-tertiary mt-1">مستوى {rank1.level}</p>
            <p className="text-sm font-bold text-amber-500 mt-1" dir="ltr">{rank1.xp.toLocaleString()} XP</p>
          </div>
        </div>
      )}

      {/* Rank 3 (Bronze) */}
      {rank3 && (
        <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="relative mb-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-400/80 bg-bg-tertiary overflow-hidden flex items-center justify-center shadow-lg">
              {rank3.avatar_url ? (
                <Image src={rank3.avatar_url} alt={rank3.name} fill className="object-cover" />
              ) : (
                <span className="text-xl font-bold text-orange-400/80">{rank3.name.charAt(0)}</span>
              )}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-orange-400/80 rounded-full flex items-center justify-center border-2 border-bg-primary text-orange-950 shadow-sm z-10">
              <span className="text-xs font-bold font-mono">3</span>
            </div>
          </div>
          <div className="text-center mt-3 w-24 sm:w-28 bg-bg-secondary p-3 pb-4 rounded-t-2xl border border-b-0 border-orange-400/30">
            <p className="font-bold text-sm truncate" title={rank3.name}>{rank3.name}</p>
            <p className="text-xs text-text-tertiary mt-1">مستوى {rank3.level}</p>
            <p className="text-xs font-bold text-orange-400 mt-1" dir="ltr">{rank3.xp.toLocaleString()} XP</p>
          </div>
        </div>
      )}
    </div>
  );
}
