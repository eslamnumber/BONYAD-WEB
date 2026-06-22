import { create } from 'zustand';

import type { AssistantSuggestion } from '../api/send-assistant-message';

export type AssistantMessage = { id: string; role: 'user' | 'assistant'; text: string };
export type AssistantStatus = 'idle' | 'sending' | 'error';

type AssistantState = {
  isOpen: boolean;
  messages: AssistantMessage[];
  conversationId: string | null;
  suggestions: AssistantSuggestion[];
  status: AssistantStatus;
  open: () => void;
  close: () => void;
  toggle: () => void;
  pushMessage: (message: AssistantMessage) => void;
  setConversationId: (id: string | null) => void;
  setSuggestions: (suggestions: AssistantSuggestion[]) => void;
  setStatus: (status: AssistantStatus) => void;
};

/**
 * Global state for the floating Bonyad assistant: panel open/close + the live
 * conversation (messages, running conversationId, latest quick-reply suggestions,
 * request status). Kept in a module-level store (not React state) so the conversation
 * survives route-group layout swaps — the launcher is mounted in both the `(main)` and
 * `(app)` layouts, only one per URL. Mirrors the {@link useNotificationsStore} pattern.
 * History is in-memory (resets on a full page reload; server-side history is deferred).
 */
export const useAssistantStore = create<AssistantState>((set) => ({
  isOpen: false,
  messages: [],
  conversationId: null,
  suggestions: [],
  status: 'idle',
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  pushMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setConversationId: (conversationId) => set({ conversationId }),
  setSuggestions: (suggestions) => set({ suggestions }),
  setStatus: (status) => set({ status }),
}));
