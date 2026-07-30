import type { Connection, ConnectionStatus } from '@/types';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/supabase/types';

type ConnectionRow = Database['public']['Tables']['connections']['Row'];

function rowToConnection(row: ConnectionRow): Connection {
  return {
    _id: row.id,
    requesterId: row.requester_id,
    addresseeId: row.addressee_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function requireAuthUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

export async function getConnectionWith(otherUserId: string): Promise<Connection | null> {
  const myId = await requireAuthUserId();

  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`requester_id.eq.${myId},addressee_id.eq.${myId}`);

  if (error) throw new Error(error.message);

  const match = (data ?? []).find(
    (row) =>
      (row.requester_id === myId && row.addressee_id === otherUserId) ||
      (row.requester_id === otherUserId && row.addressee_id === myId),
  );

  return match ? rowToConnection(match) : null;
}

export async function requestConnection(otherUserId: string): Promise<Connection> {
  const myId = await requireAuthUserId();
  if (otherUserId === myId) throw new Error('You cannot connect with yourself');

  const existing = await getConnectionWith(otherUserId);
  if (existing) {
    if (existing.status === 'declined') {
      const { data, error } = await supabase
        .from('connections')
        .update({
          requester_id: myId,
          addressee_id: otherUserId,
          status: 'pending' satisfies ConnectionStatus,
        })
        .eq('id', existing._id)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return rowToConnection(data);
    }
    return existing;
  }

  const { data, error } = await supabase
    .from('connections')
    .insert({
      requester_id: myId,
      addressee_id: otherUserId,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return rowToConnection(data);
}

export async function acceptConnection(connectionId: string): Promise<Connection> {
  const myId = await requireAuthUserId();

  const { data, error } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)
    .eq('addressee_id', myId)
    .eq('status', 'pending')
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return rowToConnection(data);
}

export async function declineConnection(connectionId: string): Promise<Connection> {
  const myId = await requireAuthUserId();

  const { data, error } = await supabase
    .from('connections')
    .update({ status: 'declined' })
    .eq('id', connectionId)
    .eq('addressee_id', myId)
    .eq('status', 'pending')
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return rowToConnection(data);
}

export async function listMyConnections(
  status: ConnectionStatus = 'accepted',
): Promise<Connection[]> {
  const myId = await requireAuthUserId();

  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('status', status)
    .or(`requester_id.eq.${myId},addressee_id.eq.${myId}`)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToConnection);
}

export async function listIncomingRequests(): Promise<Connection[]> {
  const myId = await requireAuthUserId();

  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('addressee_id', myId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToConnection);
}
