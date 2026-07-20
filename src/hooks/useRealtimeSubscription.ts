'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSubscription(
  table: string,
  filter: string,
  onUpdate: (payload: Record<string, unknown>) => void
) {
  useEffect(() => {
    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        onUpdate
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, filter, onUpdate]);
}
