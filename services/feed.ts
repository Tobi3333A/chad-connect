import type { FeedItem, User } from '@/types';
import { feedRowToItem, profileRowToUser } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/supabase/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type FeedRow = Database['public']['Tables']['feed_items']['Row'];

type FeedWithAuthor = FeedRow & {
  author: ProfileRow | null;
};

const FEED_SELECT = `
  *,
  author:profiles!feed_items_author_id_fkey(*)
`;

export async function getFeedItems(): Promise<FeedItem[]> {
  const { data, error } = await supabase
    .from('feed_items')
    .select(FEED_SELECT)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as FeedWithAuthor[]).map((row) =>
    feedRowToItem(row, row.author ? profileRowToUser(row.author) : undefined),
  );
}

export async function getSuggestedConnections(): Promise<User[]> {
  const { data: authData } = await supabase.auth.getUser();
  const myId = authData.user?.id;

  let query = supabase
    .from('profiles')
    .select('*')
    .neq('name', '')
    .order('created_at', { ascending: false })
    .limit(8);

  if (myId) {
    query = query.neq('id', myId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const profiles = (data ?? []).map(profileRowToUser);

  // Prefer people who share at least one need or city with the current user
  if (myId) {
    const { data: me } = await supabase
      .from('profiles')
      .select('needs, city')
      .eq('id', myId)
      .maybeSingle();

    if (me) {
      const myNeeds = new Set(me.needs ?? []);
      const myCity = me.city?.toLowerCase() ?? '';

      const ranked = [...profiles].sort((a, b) => {
        const score = (u: User) => {
          let s = 0;
          if (myCity && u.location?.city?.toLowerCase() === myCity) s += 2;
          s += u.needs.filter((n) => myNeeds.has(n)).length;
          return s;
        };
        return score(b) - score(a);
      });

      return ranked.slice(0, 4);
    }
  }

  return profiles.slice(0, 4);
}
