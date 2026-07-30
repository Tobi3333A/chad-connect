import type { CreateHousingInput, HousingPost } from '@/types';
import { housingRowToPost, profileRowToUser } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/supabase/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type HousingRow = Database['public']['Tables']['housing_posts']['Row'];

type HousingWithRelations = HousingRow & {
  author: ProfileRow | null;
  event: { title: string } | null;
};

function mapHousing(row: HousingWithRelations): HousingPost {
  return housingRowToPost(
    row,
    row.author ? profileRowToUser(row.author) : undefined,
    row.event?.title,
  );
}

const HOUSING_SELECT = `
  *,
  author:profiles!housing_posts_author_id_fkey(*),
  event:events!housing_posts_event_id_fkey(title)
`;

export async function getHousingPosts(filters?: {
  type?: string;
  city?: string;
  eventId?: string;
}): Promise<HousingPost[]> {
  let query = supabase
    .from('housing_posts')
    .select(HOUSING_SELECT)
    .order('created_at', { ascending: false });

  if (filters?.type) {
    query = query.eq('type', filters.type as HousingPost['type']);
  }
  if (filters?.city) {
    query = query.ilike('city', filters.city);
  }
  if (filters?.eventId) {
    query = query.eq('event_id', filters.eventId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as HousingWithRelations[]).map(mapHousing);
}

export async function getHousingById(id: string): Promise<HousingPost | null> {
  const { data, error } = await supabase
    .from('housing_posts')
    .select(HOUSING_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapHousing(data as unknown as HousingWithRelations);
}

export async function createHousingPost(input: CreateHousingInput): Promise<HousingPost> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('housing_posts')
    .insert({
      title: input.title,
      type: input.type,
      event_id: input.eventId ?? null,
      city: input.city,
      country: input.country,
      budget_min: input.budgetMin ?? null,
      budget_max: input.budgetMax ?? null,
      move_in_date: input.moveInDate.slice(0, 10),
      move_out_date: input.moveOutDate ? input.moveOutDate.slice(0, 10) : null,
      description: input.description,
      preferences: input.preferences,
      author_id: authData.user.id,
    })
    .select(HOUSING_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return mapHousing(data as unknown as HousingWithRelations);
}
