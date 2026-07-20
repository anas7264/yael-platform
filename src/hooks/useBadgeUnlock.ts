'use client';
import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export interface UnlockedBadge {
  id: string;
  badge_id: string;
  name: string;
  icon: string; // emoji
  description: string;
  earned_at: string;
}

interface UseBadgeUnlockReturn {
  celebrationBadge: UnlockedBadge | null;
  dismissCelebration: () => void;
}

export function useBadgeUnlock(): UseBadgeUnlockReturn {
  const [celebrationBadge, setCelebrationBadge] = useState<UnlockedBadge | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Resolve current user id once
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const handleBadgeUnlock = useCallback((payload: Record<string, unknown>) => {
    const record = payload['new'] as UnlockedBadge | undefined;
    if (!record) return;
    setCelebrationBadge(record);
  }, []);

  const filter = userId ? `user_id=eq.${userId}` : '';

  useRealtimeSubscription('user_badges', filter, handleBadgeUnlock);

  const dismissCelebration = useCallback(() => {
    setCelebrationBadge(null);
  }, []);

  return { celebrationBadge, dismissCelebration };
}
