// src/auth/AuthProvider.tsx
// Single source of truth for "who is logged in." Mount once near the root;
// read it anywhere with useAuth().
//
// Why a provider and not a bare hook: the previous useAuth() kept its own
// state per component, so every Header + page + modal on screen opened its
// own onAuthStateChange subscription and fetched `profiles` independently
// (five-plus copies on a typical page). Worse, refreshProfile() after
// onboarding only updated the calling component — the header kept showing
// the old name until a reload. One provider fixes both.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

// Where OAuth / magic links land. Both locale slugs render the onboarding
// page, so the Spanish one is fine as the canonical callback.
const AUTH_CALLBACK_PATH = '/bienvenido';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
      return;
    }
    setProfile(data);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      setSession(session);
      if (session?.user) await loadProfile(session.user.id);
      if (!cancelled) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Supabase warns against awaiting other client calls inside this
        // callback (deadlock risk on token refresh) — fire and forget.
        void loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${AUTH_CALLBACK_PATH}`,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${AUTH_CALLBACK_PATH}`,
        shouldCreateUser: true, // doubles as sign-up for new members
      },
    });
    if (error) {
      console.error('Magic-link error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      isAdmin: profile?.is_admin ?? false,
      signInWithGoogle,
      signInWithEmail,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, signInWithGoogle, signInWithEmail, signOut, refreshProfile]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuthContext = (): AuthState => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
