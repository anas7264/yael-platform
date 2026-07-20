'use client';
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { UserProgress } from '@/types';

const PROGRESS_QUERY_KEY = ['user-progress'] as const;

async function fetchUserProgress(): Promise<UserProgress | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) throw new Error(error.message);
  return data ?? null;
}

/**
 * TanStack Query hook that fetches user progress and keeps it
 * up to date via Supabase Realtime subscriptions.
 */
export function useUserProgress() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PROGRESS_QUERY_KEY,
    queryFn: fetchUserProgress,
    staleTime: 60_000, // 1 minute
  });

  // Invalidate the query on any realtime change to user_progress
  const handleRealtimeUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROGRESS_QUERY_KEY });
  }, [queryClient]);

  const userId = query.data?.user_id ?? '';
  useRealtimeSubscription(
    'user_progress',
    userId ? `user_id=eq.${userId}` : '',
    handleRealtimeUpdate
  );

  return query;
}
