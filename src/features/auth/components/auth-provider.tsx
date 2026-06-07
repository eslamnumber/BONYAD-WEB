'use client';

import { useState, type ReactNode } from 'react';

import { useAuthStore } from '@/stores/auth-store';
import type { AuthUser } from '@/types/auth';

type AuthProviderProps = {
  /** User resolved server-side from the session cookie (or `null` when signed out). */
  initialUser: AuthUser | null;
  children: ReactNode;
};

/**
 * Hydrates the global auth store from the server-resolved user exactly once,
 * during the first render, so authenticated UI never flashes an empty state.
 * Mounted by the authenticated `(app)` layout. Idempotent.
 */
export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  useState(() => {
    useAuthStore.setState({ user: initialUser, isAuthenticated: initialUser !== null });
    return null;
  });
  return <>{children}</>;
}
