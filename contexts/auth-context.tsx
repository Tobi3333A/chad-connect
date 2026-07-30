import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';

import { profileRowToUser } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Failed to load profile', error.message);
    return null;
  }
  if (!data) return null;
  return profileRowToUser(data);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setUser(null);
      return;
    }
    setUser(await fetchProfile(userId));
  }, [session?.user?.id]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user?.id) {
        const profile = await fetchProfile(data.session.user.id);
        if (mounted) setUser(profile);
      } else {
        setUser(null);
      }
      if (mounted) setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setSession(nextSession);
        if (nextSession?.user?.id) {
          setUser(await fetchProfile(nextSession.user.id));
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, user, loading, refreshProfile, signOut }),
    [session, user, loading, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
