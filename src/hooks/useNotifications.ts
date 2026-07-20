'use client';
import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export interface NotificationItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  created_at: string;
}

interface UseNotificationsReturn {
  unreadCount: number;
  notifications: NotificationItem[];
  toast: NotificationItem | null;
  markAllRead: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toast, setToast] = useState<NotificationItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Resolve current user id once
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  // Stable callback that won't cause infinite re-renders
  const handleNewNotification = useCallback((payload: Record<string, unknown>) => {
    const record = payload['new'] as NotificationItem | undefined;
    if (!record) return;

    setNotifications(prev => [record, ...prev]);

    // Show toast for 4 seconds
    setToast(record);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Subscribe only when we have a userId
  const filter = userId ? `user_id=eq.${userId}` : '';

  useRealtimeSubscription(
    'notifications',
    filter,
    handleNewNotification
  );

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { unreadCount, notifications, toast, markAllRead };
}
