'use client';

import { useState, useEffect } from 'react';
import { TopThree } from '@/components/leaderboard/TopThree';
import { LeaderboardTable, LeaderboardUser } from '@/components/leaderboard/LeaderboardTable';
import { UserRankCard } from '@/components/leaderboard/UserRankCard';
import { Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Period = 'daily' | 'weekly' | 'alltime';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }

      // Mock fetching logic until real RPC functions are implemented.
      // A real query might look like: `await supabase.rpc('get_leaderboard', { p_period: period })`
      await new Promise(res => setTimeout(res, 600));

      if (!mounted) return;

      // Mock Data
      const mockUsers: LeaderboardUser[] = Array.from({ length: 15 }).map((_, i) => ({
        id: i === 7 ? session?.user?.id || 'me' : `user-${i}`,
        rank: i + 1,
        name: i === 7 ? 'أنت' : `متعلم ${i + 1}`,
        avatar_url: null,
        level: Math.max(1, 20 - i),
        xp: Math.max(100, 5000 - (i * 300) + (period === 'alltime' ? 10000 : period === 'weekly' ? 2000 : 0)),
      }));

      setUsers(mockUsers);
      setIsLoading(false);
    };

    fetchLeaderboard();
    return () => { mounted = false; };
  }, [period]);

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);
  const currentUser = users.find(u => u.id === currentUserId);
  
  // Calculate XP to next rank
  let xpToNext = null;
  if (currentUser && currentUser.rank > 1) {
    const nextRankUser = users.find(u => u.rank === currentUser.rank - 1);
    if (nextRankUser) {
      xpToNext = nextRankUser.xp - currentUser.xp + 1;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mb-2 shadow-glow-amber">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold">لوحة الشرف</h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          تنافس مع زملائك، احصد النقاط، وارتقِ في الترتيب. من سيكون بطل الأسبوع؟
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-bg-secondary border border-border-subtle rounded-xl max-w-sm mx-auto">
        <button
          onClick={() => setPeriod('daily')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            period === 'daily' ? 'bg-bg-primary text-primary-500 shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          يومي
        </button>
        <button
          onClick={() => setPeriod('weekly')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            period === 'weekly' ? 'bg-bg-primary text-primary-500 shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          أسبوعي
        </button>
        <button
          onClick={() => setPeriod('alltime')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            period === 'alltime' ? 'bg-bg-primary text-primary-500 shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          كل الأوقات
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-8 pt-12">
          <div className="flex justify-center items-end gap-6 h-48">
            <div className="w-24 h-32 bg-bg-secondary rounded-t-2xl"></div>
            <div className="w-32 h-40 bg-bg-secondary rounded-t-2xl"></div>
            <div className="w-24 h-24 bg-bg-secondary rounded-t-2xl"></div>
          </div>
          <div className="h-64 bg-bg-secondary rounded-2xl"></div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <TopThree users={topThree} />
          <LeaderboardTable users={rest} currentUserId={currentUserId} />
        </div>
      )}

      {/* Floating Rank Card */}
      {!isLoading && currentUser && (
        <UserRankCard user={currentUser} xpToNextRank={xpToNext} />
      )}
    </div>
  );
}
