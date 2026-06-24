import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, getActivityLogs } from '@/lib/supabase/repositories/notifications';
import type { Database } from '@/lib/supabase/types';

type DBNotification = Database['public']['Tables']['notifications']['Row'];
type DBActivityLog = Database['public']['Tables']['activity_logs']['Row'];

export function useNotifications(userId?: string, companyId?: string) {
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications(userId, companyId);
      setNotifications(data);
    } catch {}
    setLoading(false);
  }, [userId, companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return { notifications, loading, unreadCount, markRead, markAllRead, refetch: fetch };
}

export function useActivityLogs(companyId?: string) {
  const [logs, setLogs] = useState<DBActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getActivityLogs(companyId).then((data) => {
      setLogs(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [companyId]);

  return { logs, loading };
}
