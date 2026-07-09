import { useCallback, useEffect, useState } from 'react';
import type { HousingPost } from '@/types';
import { getHousingPosts } from '@/services/housing';

export function useHousing(filters?: { type?: string; city?: string; eventId?: string }) {
  const [posts, setPosts] = useState<HousingPost[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHousingPosts(filters);
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, [filters?.type, filters?.city, filters?.eventId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { posts, loading, refresh };
}
