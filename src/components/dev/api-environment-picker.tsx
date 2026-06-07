'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type ApiEnvironment, type ApiEnvironmentKey } from '@/config/api-environments';
import { INTERNAL_API } from '@/config/routes';
import { apiClient } from '@/lib/api-client';

import { EnvironmentList } from './api-environment-list';

function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onEscape]);
}

/** Persist the chosen backend then hard-navigate so all RSC re-render. */
function useEnvironmentSwitch() {
  const [switching, setSwitching] = useState(false);
  async function switchTo(env: ApiEnvironment): Promise<boolean> {
    setSwitching(true);
    try {
      await apiClient.post(INTERNAL_API.API_ENVIRONMENT, {
        internal: true,
        body: { key: env.key },
      });
      window.location.assign('/login');
      return true;
    } catch {
      setSwitching(false);
      return false;
    }
  }
  return { switching, switchTo };
}

function PickerHeader({
  title,
  closeLabel,
  onClose,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-foreground text-xl font-bold">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="text-muted-foreground hover:text-foreground rounded p-2"
      >
        <X className="size-5" aria-hidden />
      </button>
    </div>
  );
}

function ConfirmSwitchDialog({
  name,
  switching,
  onCancel,
  onConfirm,
}: {
  name: string;
  switching: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-foreground/40 fixed inset-0 z-10 flex items-center justify-center p-6">
      <div className="bg-background w-full max-w-sm rounded-2xl border p-5 shadow-lg">
        <h3 className="text-foreground text-base font-bold">{t('env.confirmTitle', { name })}</h3>
        <p className="text-muted-foreground mt-2 text-sm">{t('env.confirmMessage', { name })}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={switching}
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground rounded-md px-4 py-2 text-sm font-medium"
          >
            {t('env.cancel')}
          </button>
          <button
            type="button"
            disabled={switching}
            onClick={onConfirm}
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {t('env.switch')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Full-screen backend picker (beta-tester tool). Switching posts to the internal
 * switch route (which persists the choice and clears the session) then
 * hard-navigates to /login so every RSC re-renders against the new host. Mirrors
 * the Android ApiEnvironmentPickerScreen.
 */
export function ApiEnvironmentPicker({
  currentKey,
  onClose,
}: {
  currentKey: ApiEnvironmentKey;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<ApiEnvironment | null>(null);
  const { switching, switchTo } = useEnvironmentSwitch();
  useEscapeKey(onClose);

  async function onConfirm() {
    if (pending && !(await switchTo(pending))) setPending(null);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('env.pickerTitle')}
      className="bg-background fixed inset-0 z-50 flex flex-col overflow-y-auto p-4"
    >
      <PickerHeader title={t('env.pickerTitle')} closeLabel={t('env.close')} onClose={onClose} />
      <p className="text-muted-foreground mt-3 text-sm">{t('env.pickerWarning')}</p>
      <EnvironmentList currentKey={currentKey} disabled={switching} onSelect={setPending} />
      {pending && (
        <ConfirmSwitchDialog
          name={t(pending.displayNameKey)}
          switching={switching}
          onCancel={() => setPending(null)}
          onConfirm={() => void onConfirm()}
        />
      )}
    </div>
  );
}
