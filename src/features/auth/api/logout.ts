'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { INTERNAL_API, ROUTES } from '@/config/routes';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

/** Clear the session via the same-origin logout route handler (clears the cookie). */
export async function logoutUser(): Promise<void> {
  await apiClient.post<{ ok: boolean }>(INTERNAL_API.AUTH_LOGOUT, { internal: true });
}

/**
 * Logout mutation: clears the cookie (route handler), the local store, and the
 * TanStack Query cache, then redirects to the login screen.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);
  return useMutation<void, Error, void>({
    mutationFn: logoutUser,
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      router.replace(ROUTES.LOGIN);
    },
  });
}
