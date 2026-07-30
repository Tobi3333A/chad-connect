import type { NeedType, User } from '@/types';
import type { Database } from '@/supabase/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function profileRowToUser(row: ProfileRow): User {
  return {
    _id: row.id,
    email: row.email,
    name: row.name,
    university: row.university,
    major: row.major,
    graduationYear: row.graduation_year ?? new Date().getFullYear() + 1,
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    needs: (row.needs ?? []) as NeedType[],
    location:
      row.city || row.country
        ? {
            city: row.city ?? '',
            state: row.state ?? undefined,
            country: row.country ?? '',
          }
        : undefined,
    isVerified: row.is_verified,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
