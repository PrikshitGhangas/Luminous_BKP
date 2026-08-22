'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserRole, Profile } from '../types';
import { DEMO_USERS } from '../constants/demo-data';
import { ROLE_DETAILS } from '../constants/roles';

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
  department?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  profile: Profile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  source: AuthSource;
  signUp: (input: SignUpInput) => Promise<{ error: string | null; needsEmailVerification: boolean; defaultPath?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; defaultPath?: string; role?: UserRole }>;
  signInWithProvider: (provider: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
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

  // Initialize from Supabase session or demo cookie on mount.
  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const client = await getBrowserClient();
        let session = null;
        if (client) {
          try {
            const { data } = await client.auth.getSession();
            session = data?.session;
          } catch (err) {
            console.warn('[Luminous Auth] getSession error:', err);
          }
        }

        if (session?.user && !disposed) {
          const p = await loadProfile(session.user.id);
          if (!disposed) {
            setSource('supabase');
            if (p) {
              applyProfile(p);
            } else {
              const role = (session.user.user_metadata?.role as UserRole) || 'student';
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                role,
                avatar_url: session.user.user_metadata?.avatar_url,
                is_active: true,
              });
              if (typeof document !== 'undefined') {
                document.cookie = `luminous_role=${role}; path=/; max-age=86400; SameSite=Lax`;
                document.cookie = `luminous_demo=; path=/; max-age=0`;
              }
            }
          }
        } else if (!disposed) {
          // Check if a demo persona was active
          let isDemo = false;
          let demoRole: UserRole | null = null;

          if (typeof document !== 'undefined') {
            const cookies = Object.fromEntries(
              document.cookie
                .split('; ')
                .filter(Boolean)
                .map((c) => {
                  const [k, ...v] = c.split('=');
                  return [k, v.join('=')];
                })
            );
            if (cookies['luminous_demo'] === '1' && cookies['luminous_role']) {
              isDemo = true;
              demoRole = cookies['luminous_role'] as UserRole;
            }
          }

          if (!isDemo && typeof window !== 'undefined') {
            try {
              if (localStorage.getItem('luminous_demo') === '1') {
                isDemo = true;
                const storedRole = localStorage.getItem('luminous_role') as UserRole;
                if (storedRole) demoRole = storedRole;
              }
            } catch {}
          }

          if (isDemo && demoRole && DEMO_USERS[demoRole]) {
            const demo = DEMO_USERS[demoRole];
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
            if (p) {
              applyProfile(p);
            } else {
              const role = (session.user.user_metadata?.role as UserRole) || 'student';
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                role,
                avatar_url: session.user.user_metadata?.avatar_url,
                is_active: true,
              });
            }
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
    async ({ email, password, fullName, role, department }: SignUpInput) => {
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
              department: department?.trim() || undefined,
            },
          },
        });
        if (error) {
          // Log the raw message so the real cause is visible (UI shows a safe message).
          console.error('[Luminous Auth] signUp error:', error.message, error.code, error.status);
          return { error: friendlyAuthMessage(error.message), needsEmailVerification: false };
        }
        const needsEmailVerification = !data.session; // Session null => email confirmation required.
        if (data.session?.user) {
          const p = await loadProfile(data.session.user.id);
          setSource('supabase');
          if (p) {
            applyProfile(p);
          } else {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              full_name: fullName || 'User',
              role,
              department: department?.trim() || undefined,
              is_active: true,
            });
          }
          if (typeof document !== 'undefined') {
            document.cookie = `luminous_role=${role}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `luminous_demo=; path=/; max-age=0`;
          }
        }
        const defaultPath = ROLE_DETAILS[role]?.defaultPath || '/student';
        return { error: null, needsEmailVerification, defaultPath };
      } catch (e) {
        console.error('[Luminous Auth] signUp exception:', e);
        return { error: 'Unable to create account. Please try again.', needsEmailVerification: false };
      }
    },
    [loadProfile, applyProfile]
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const demoEntry = Object.entries(DEMO_USERS).find(
      ([_, u]) => u.email.toLowerCase() === trimmedEmail
    );

    try {
      const client = await getBrowserClient();
      if (client) {
        const { data, error } = await client.auth.signInWithPassword({ email: trimmedEmail, password });
        if (!error && data?.user) {
          let targetPath = '/student';
          let userRole: UserRole = 'student';
          const p = await loadProfile(data.user.id);
          setSource('supabase');
          if (p) {
            applyProfile(p);
            if (p?.role && p.role in ROLE_DETAILS) {
              userRole = p.role as UserRole;
              targetPath = ROLE_DETAILS[userRole]?.defaultPath || '/student';
            }
          } else {
            userRole = (data.user.user_metadata?.role as UserRole) || 'student';
            setUser({
              id: data.user.id,
              email: data.user.email || '',
              full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
              role: userRole,
              avatar_url: data.user.user_metadata?.avatar_url,
              is_active: true,
            });
            targetPath = ROLE_DETAILS[userRole]?.defaultPath || '/student';
          }
          if (typeof document !== 'undefined') {
            document.cookie = `luminous_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `luminous_demo=; path=/; max-age=0`;
          }
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('luminous_demo');
              localStorage.setItem('luminous_role', userRole);
            } catch {}
          }
          return { error: null, defaultPath: targetPath, role: userRole };
        }

        // If Supabase authentication returned an error but user is testing a demo persona email, fall back smoothly
        if (demoEntry) {
          const role = demoEntry[0] as UserRole;
          launchDemo(role);
          const targetPath = ROLE_DETAILS[role]?.defaultPath || '/student';
          return { error: null, defaultPath: targetPath, role };
        }

        if (error) return { error: friendlyAuthMessage(error.message) };
      } else if (demoEntry) {
        const role = demoEntry[0] as UserRole;
        launchDemo(role);
        const targetPath = ROLE_DETAILS[role]?.defaultPath || '/student';
        return { error: null, defaultPath: targetPath, role };
      }

      return { error: 'Unable to sign in. Please check your email and password.' };
    } catch {
      if (demoEntry) {
        const role = demoEntry[0] as UserRole;
        launchDemo(role);
        const targetPath = ROLE_DETAILS[role]?.defaultPath || '/student';
        return { error: null, defaultPath: targetPath, role };
      }
      return { error: 'Unable to sign in. Please check your email and password.' };
    }
  }, [loadProfile, applyProfile]);

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
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('luminous_demo');
        localStorage.removeItem('luminous_role');
      } catch {}
      window.location.href = '/';
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const client = await getBrowserClient();
      if (!client) return { error: 'Authentication is not configured.' };
      // redirectTo must match a configured app URL so Supabase can embed a working
      // reset link into the recovery email (otherwise the email has no link).
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : undefined;
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) return { error: friendlyAuthMessage(error.message) };
      return { error: null };
    } catch {
      return { error: 'Unable to send reset link. Please try again.' };
    }
  }, []);

  /** Set a new password after following a password-recovery link. */
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const client = await getBrowserClient();
      if (!client) return { error: 'Authentication is not configured.' };
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) return { error: friendlyAuthMessage(error.message) };
      return { error: null };
    } catch {
      return { error: 'Unable to update password. Please try again.' };
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
      document.cookie = `luminous_demo=1; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `luminous_role=${demo.role}; path=/; max-age=86400; SameSite=Lax`;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('luminous_demo', '1');
        localStorage.setItem('luminous_role', demo.role);
      } catch {}
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
        setSource('supabase');
        if (p) {
          applyProfile(p);
        } else {
          const role = (session.user.user_metadata?.role as UserRole) || 'student';
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            role,
            avatar_url: session.user.user_metadata?.avatar_url,
            is_active: true,
          });
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
        updatePassword,
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
  // Email-sending failure — the account may be created but the confirmation email
  // could not be sent (SMTP/email provider misconfigured in the Supabase project).
  if (lower.includes('error sending confirmation email') || lower.includes('sending confirmation') || lower.includes('unexpected_failure')) {
    return 'Account created, but the confirmation email could not be sent. Check the email/SMTP settings in your Supabase project, or disable email confirmation for testing.';
  }
  // Trigger/database failures during account provisioning (e.g. profile row). The
  // exact cause is logged to the browser console.
  if (lower.includes('database error saving new user') || lower.includes('db error') || lower.includes('row-level security') || lower.includes('relation') || lower.includes('does not exist')) {
    return 'Account could not be created (database setup issue). Check that the migrations were applied. See the browser console for details.';
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