'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hydrates authentication state from Supabase on mount and subscribes
 * to auth state changes. Returns the current user, session, and profile.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient();

    // Hydrate on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', s.user.id)
          .single()
          .then(({ data }) => {
            setProfile(data ?? null);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s?.user) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
  };
}
