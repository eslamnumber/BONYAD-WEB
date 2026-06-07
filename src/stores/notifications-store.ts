import { create } from 'zustand';

type NotificationsState = {
  /** Whether the notifications drawer overlay is open. */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

/**
 * Drawer open/close state for the notifications overlay. Kept in a store (not
 * local state) so any trigger — the bell in the app shell, a future search-bar
 * bell, a keyboard shortcut — can open the same single drawer instance mounted
 * in the `(app)` layout. Mirrors the {@link useAuthStore} Zustand pattern.
 */
export const useNotificationsStore = create<NotificationsState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
