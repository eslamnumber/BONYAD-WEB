'use client';

import { useAssistantStore } from '../store/assistant-store';

import { AssistantFab } from './assistant-fab';
import { AssistantPanel } from './assistant-panel';

/**
 * Root of the global Bonyad assistant. Mounted once in the `(main)` and `(app)`
 * layouts (so it shows on every public + dashboard screen, but not the auth /
 * onboarding flows). The launcher button stays mounted while the panel is open
 * (the panel covers it) so focus can return to it on close.
 */
export function AssistantLauncher() {
  const isOpen = useAssistantStore((s) => s.isOpen);
  return (
    <>
      <AssistantFab />
      {isOpen ? <AssistantPanel /> : null}
    </>
  );
}
