'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import { hasViewerAgreed, isOwnChangeRequest } from '../../lib/change-request-status';
import type { ChangeRequest } from '../../schemas/change-request';

import { AgreePanel, TextPanel } from './change-request-action-panels';
import { useChangeRequestActions } from './use-change-request-actions';

type Panel = 'none' | 'respond' | 'reject' | 'agree';
type Actions = ReturnType<typeof useChangeRequestActions>;
type Props = { projectId: number; cr: ChangeRequest; isTechnician: boolean; onDone: () => void };

/**
 * Action bar for an active negotiation. The party who *authored* the request
 * can't reject or counter their own proposal (the backend returns "You cannot
 * reject your own change request"), so they get only the accept panel; the other
 * party gets counter-offer / agree / reject. Once the viewing party has agreed,
 * it collapses to a "waiting for the other party" note.
 */
export function ChangeRequestActions({ projectId, cr, isTechnician, onDone }: Props) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const actions = useChangeRequestActions(projectId, cr.id, onDone);

  // Hide every action once the viewer has agreed — whether our cached flag says so
  // or the backend rejected a repeat agree with "you have already agreed".
  if (hasViewerAgreed(cr, isTechnician) || actions.alreadyAgreed) {
    return (
      <p dir="auto" className="text-status-approved text-start text-sm">
        {t('dashboard.changeRequests.actions.youAgreed')}
      </p>
    );
  }

  if (isOwnChangeRequest(cr, user)) {
    return (
      <AgreePanel
        onConfirm={actions.agree}
        pending={actions.pending}
        error={actions.error}
        note={t('dashboard.changeRequests.actions.ownRequestNote')}
      />
    );
  }

  return <CounterpartyActions actions={actions} />;
}

/** Reviewing party's state machine: counter-offer / reject / agree, each behind its panel. */
function CounterpartyActions({ actions }: { actions: Actions }) {
  const [panel, setPanel] = useState<Panel>('none');
  const [text, setText] = useState('');

  if (panel === 'agree') {
    return (
      <AgreePanel
        onConfirm={actions.agree}
        onCancel={() => setPanel('none')}
        pending={actions.pending}
        error={actions.error}
      />
    );
  }

  if (panel === 'respond' || panel === 'reject') {
    return (
      <TextPanel
        kind={panel}
        value={text}
        onChange={setText}
        onCancel={() => setPanel('none')}
        onConfirm={() => (panel === 'respond' ? actions.respond(text) : actions.reject(text))}
        confirmDisabled={panel === 'respond' && text.trim().length === 0}
        pending={actions.pending}
        error={actions.error}
      />
    );
  }

  return (
    <ActionButtons
      onPick={(next) => {
        setText('');
        setPanel(next);
      }}
    />
  );
}

function ActionButtons({ onPick }: { onPick: (panel: Exclude<Panel, 'none'>) => void }) {
  const { t } = useTranslation();
  const base =
    'focus-visible:outline-ring rounded-lg px-4 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2';
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <button
        type="button"
        onClick={() => onPick('reject')}
        className={`${base} border-border text-status-rejected border`}
      >
        {t('dashboard.changeRequests.actions.reject')}
      </button>
      <button
        type="button"
        onClick={() => onPick('respond')}
        className={`${base} border-brand-dark-navy text-brand-dark-navy border`}
      >
        {t('dashboard.changeRequests.actions.respond')}
      </button>
      <button
        type="button"
        onClick={() => onPick('agree')}
        className={`${base} bg-brand-dark-navy text-on-media motion-safe:hover:opacity-90`}
      >
        {t('dashboard.changeRequests.actions.agree')}
      </button>
    </div>
  );
}
