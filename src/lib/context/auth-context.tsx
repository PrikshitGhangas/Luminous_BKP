'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../constants/demo-data';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'luminous_active_user';
const ROLE_COOKIE_KEY = 'luminous_role';

function getInitialUser(): UserProfile {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as UserProfile;
      }
    } catch {
      // ignore
    }
  }
  return DEMO_USERS.super_admin;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(DEMO_USERS.super_admin);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDemoMode] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        setUser(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync role cookie for middleware routing checks
  const syncRoleCookie = useCallback((roleName: string | null) => {
    if (typeof document !== 'undefined') {
      if (roleName) {
        document.cookie = `${ROLE_COOKIE_KEY}=${roleName}; path=/; max-age=604800; SameSite=Lax`;
      } else {
        document.cookie = `${ROLE_COOKIE_KEY}=; path=/; max-age=0`;
      }
    }
  }, []);

  useEffect(() => {
    if (user && mounted) {
      syncRoleCookie(user.role);
    }
  }, [user, mounted, syncRoleCookie]);

  const loginAsRole = useCallback(
    (targetRole: UserRole) => {
      const selectedUser = DEMO_USERS[targetRole] || DEMO_USERS.admin;
      setUser(selectedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(selectedUser));
        syncRoleCookie(selectedUser.role);
      }
    },
    [syncRoleCookie]
  );

  const login = useCallback(
    async (email: string): Promise<boolean> => {
      setIsLoading(true);
      const matched = Object.values(DEMO_USERS).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      const targetUser = matched || {
        id: `usr-${Date.now()}`,
        email,
        full_name: email.split('@')[0].toUpperCase(),
        role: 'student' as UserRole,
        is_active: true,
      };

      setUser(targetUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));
      syncRoleCookie(targetUser.role);
      setIsLoading(false);
      return true;
    },
    [syncRoleCookie]
  );

  const switchRole = useCallback(
    (newRole: UserRole) => {
      loginAsRole(newRole);
    },
    [loginAsRole]
  );

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      syncRoleCookie(null);
    }
  }, [syncRoleCookie]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isLoading,
        isDemoMode,
        login,
        loginAsRole,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
