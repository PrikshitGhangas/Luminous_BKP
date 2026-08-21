'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserRole, Profile } from '../types';
import { DEMO_USERS } from '../constants/demo-data';

export type AuthSource = 'supabase' | 'demo' | null;

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  avatar_url?: string;
  is_active: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  profile: Profile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  source: AuthSource;
  signUp: (input: SignUpInput) => Promise<{ error: string | null; needsEmailVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithProvider: (provider: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  launchDemo: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Load the Supabase browser client lazily (singleton). */
function getBrowserClient(): Promise<ReturnType<typeof import('../supabase/client').createClient> | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  // Dynamic import avoids bundling server-only concerns into the client bundle.
  return import('../supabase/client').then((m) => m.createClient());
}

function mapProfileToUser(p: Profile): AuthUser {
  return {
    id: p.id,
    email: p.email,
    full_name: p.full_name || p.email.split('@')[0],
    role: (p.role as UserRole) || 'other',
    avatar_url: p.avatar_url ?? undefined,
    is_active: p.is_active !== false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [source, setSource] = useState<AuthSource>(null);
  const subRef = React.useRef<{ unsubscribe: () => void } | null>(null);

  const isDemoMode = source === 'demo';

  const loadProfile = useCallback(async (id: string): Promise<Profile | null> => {
    try {
      const client = await getBrowserClient();
      if (!client) return null;
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) return null;
      return data as Profile;
    } catch {
      return null;
    }
  }, []);

  const applyProfile = useCallback((p: Profile | null) => {
    setProfile(p);
    if (p) setUser(mapProfileToUser(p));
  }, []);

  // Initialize from Supabase session on mount.
  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const client = await getBrowserClient();
        if (!client || disposed) {
          setIsLoading(false);
          return;
        }
        const {
          data: { session },
        } = await client.auth.getSession();

        if (session?.user) {
          const p = await loadProfile(session.user.id);
          if (!disposed) {
            setSource('supabase');
            applyProfile(p);
          }
        }
      } catch {
        // no-op: leave unauthenticated
      } finally {
        if (!disposed) setIsLoading(false);
      }
    })();

    return () => {
      disposed = true;
    };
  }, [loadProfile, applyProfile]);

  // Subscribe to auth changes.
  useEffect(() => {
    let disposed = false;

    getBrowserClient().then((client) => {
      if (!client || disposed) return;
      const { data } = client.auth.onAuthStateChange(async (event, session) => {
        if (disposed) return;
        if (event === 'SIGNED_OUT' || !session?.user) {
          setSource(null);
          setProfile(null);
          setUser(null);
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          const p = await loadProfile(session.user.id);
          if (!disposed) {
            setSource('supabase');
            applyProfile(p);
          }
        }
      });
      subRef.current = data.subscription;
    });

    return () => {
      disposed = true;
      subRef.current?.unsubscribe();
      subRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = useCallback(
    async ({ email, password, fullName, role }: SignUpInput) => {
      try {
        const client = await getBrowserClient();
        if (!client) return { error: 'Authentication is not configured.', needsEmailVerification: false };
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
            },
          },
        });
        if (error) return { error: friendlyAuthMessage(error.message), needsEmailVerification: false };
        const needsEmailVerification = !data.session; // Session null => email confirmation required.
        return { error: null, needsEmailVerification };
      } catch {
        return { error: 'Unable to create account. Please try again.', needsEmailVerification: false };
      }
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const client = await getBrowserClient();
      if (!client) return { error: 'Authentication is not configured.' };
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { error: friendlyAuthMessage(error.message) };
      return { error: null };
    } catch {
      return { error: 'Unable to sign in. Please check your email and password.' };
    }
  }, []);

  /** Initiate an OAuth/social sign-in via Supabase Auth. */
  const signInWithProvider = useCallback(async (provider: string) => {
    try {
      const client = await getBrowserClient();
      if (!client) return { error: 'Authentication is not configured.' };
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await client.auth.signInWithOAuth({
        provider: provider as never,
        options: { redirectTo },
      });
      if (error) return { error: friendlyAuthMessage(error.message) };
      return { error: null };
    } catch {
      return { error: 'Unable to start social sign-in. Please try again.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const client = await getBrowserClient();
      if (client) await client.auth.signOut();
    } catch {
      // ignore
    }
    setSource(null);
    setProfile(null);
    setUser(null);
    // Clear any demo-mode markers so protected routes are enforced again.
    if (typeof document !== 'undefined') {
      document.cookie = 'luminous_demo=; path=/; max-age=0';
      document.cookie = 'luminous_role=; path=/; max-age=0';
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const client = await getBrowserClient();
      if (!client) return { error: 'Authentication is not configured.' };
      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) return { error: friendlyAuthMessage(error.message) };
      return { error: null };
    } catch {
      return { error: 'Unable to send reset link. Please try again.' };
    }
  }, []);

  /** Load a demo persona (clearly labeled, never a real account). */
  const launchDemo = useCallback((role: UserRole) => {
    const demo = DEMO_USERS[role] || DEMO_USERS.student;
    if (!demo) return;
    setSource('demo');
    setProfile(null);
    setUser({
      id: demo.id,
      email: demo.email,
      full_name: demo.full_name,
      role: demo.role,
      avatar_url: demo.avatar_url,
      is_active: demo.is_active !== false,
    });
    // Allow the middleware to recognize this as demo mode (client-only persona).
    if (typeof document !== 'undefined') {
      document.cookie = `luminous_demo=1; path=/; max-age=3600; SameSite=Lax`;
      document.cookie = `luminous_role=${demo.role}; path=/; max-age=3600; SameSite=Lax`;
    }
  }, []);

  const switchRole = useCallback(
    (role: UserRole) => {
      launchDemo(role);
    },
    [launchDemo]
  );

  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const refresh = useCallback(async () => {
    try {
      const client = await getBrowserClient();
      if (!client) return;
      const {
        data: { session },
      } = await client.auth.getSession();
      if (session?.user) {
        const p = await loadProfile(session.user.id);
        if (p) {
          setSource('supabase');
          applyProfile(p);
        }
      }
    } catch {
      // ignore
    }
  }, [loadProfile, applyProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        profile,
        isLoading,
        isDemoMode,
        source,
        signUp,
        signIn,
        signInWithProvider,
        signOut,
        resetPassword,
        launchDemo,
        switchRole,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Convert internal Supabase messages into safe, user-friendly text. */
function friendlyAuthMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid email') || lower.includes('invalid api key')) {
    return 'Unable to sign in. Please check your email and password.';
  }
  if (lower.includes('email not confirmed') || lower.includes('confirm your email')) {
    return 'Please confirm your email address before signing in.';
  }
  if (lower.includes('already registered') || lower.includes('already been registered') || lower.includes('already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (lower.includes('password')) {
    return 'Your password does not meet the requirements (at least 8 characters).';
  }
  if (lower.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return 'There was a problem with your request. Please try again.';
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}