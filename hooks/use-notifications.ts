import { useCallback, useEffect, useState } from 'react';
import { getUnreadCount } from '@/services/notifications';

export function useUnreadNotifications() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const c = await getUnreadCount();
    setCount(c);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { count, refresh };
}
