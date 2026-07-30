import type { Notification } from '@/types';
import { notificationRowToNotification } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';

export async function getNotifications(): Promise<Notification[]> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(notificationRowToNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', authData.user.id);

  if (error) throw new Error(error.message);
}

export async function getUnreadCount(): Promise<number> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', authData.user.id)
    .eq('read', false);

  if (error) throw new Error(error.message);
  return count ?? 0;
}
