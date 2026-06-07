import { create } from 'zustand';

import type { AuthUser } from '@/types/auth';

type AuthState = {
  /** Current authenticated user, or `null` when signed out. */
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Hydrate from the server-resolved user on boot, or after a fresh login. */
  setSession: (user: AuthUser | null) => void;
  /** Clear local auth state after logout (the httpOnly cookie is cleared server-side). */
  clearSession: () => void;
};

/**
 * Global auth store. Holds only the non-secret current user — the session JWT
 * lives in an httpOnly cookie, never here. Hydrated by {@link AuthProvider} from
 * a server-side {@link getServerUser} read. See `docs/state-management.md`.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setSession: (user) => set({ user, isAuthenticated: user !== null }),
  clearSession: () => set({ user: null, isAuthenticated: false }),
}));
