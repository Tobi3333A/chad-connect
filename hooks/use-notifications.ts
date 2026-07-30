import { useCallback, useEffect, useState } from 'react';
import { getUnreadCount } from '@/services/notifications';

export function useUnreadNotifications() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const c = await getUnreadCount();
      setCount(c);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { count, refresh };
}
