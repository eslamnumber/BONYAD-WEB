'use client';

import { useTranslation } from 'react-i18next';

import { Button, Textarea } from '@/components/ui';
import { conventionalDirection } from '@/types/locale';

/** Cancel / confirm button pair shared by every action panel. With no `onCancel`
 *  (the requester's accept-only panel) the confirm button takes the full width. */
export function PanelFooter({
  onCancel,
  onConfirm,
  confirmLabel,
  confirmDisabled,
}: {
  onCancel?: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmDisabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2">
      {onCancel && (
        <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
          {t('dashboard.changeRequests.actions.cancel')}
        </Button>
      )}
      <Button size="sm" onClick={onConfirm} disabled={confirmDisabled} className="flex-1">
        {confirmLabel}
      </Button>
    </div>
  );
}

/** Inline error line shared by the action panels (alert role, punctuated copy). */
function PanelError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" dir="auto" className="text-status-rejected text-start text-xs">
      {error}
    </p>
  );
}

/** Free-text panel for the counter-offer (respond) and reject actions. */
export function TextPanel({
  kind,
  value,
  onChange,
  onCancel,
  onConfirm,
  confirmDisabled,
  pending,
  error,
}: {
  kind: 'respond' | 'reject';
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  pending: boolean;
  error: string | null;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const isRespond = kind === 'respond';
  const titleKey = isRespond ? 'respondTitle' : 'rejectTitle';
  const placeholderKey = isRespond ? 'respondPlaceholder' : 'rejectPlaceholder';
  return (
    <div className="border-border flex flex-col gap-3 rounded-xl border p-4">
      <h3 className="text-foreground text-end text-sm font-medium">
        {t(`dashboard.changeRequests.actions.${titleKey}`)}
      </h3>
      <Textarea
        dir={conventionalDirection(locale)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t(`dashboard.changeRequests.actions.${placeholderKey}`)}
        className="min-h-20 text-start"
      />
      <PanelError error={error} />
      <PanelFooter
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmDisabled={confirmDisabled || pending}
        confirmLabel={
          pending
            ? t('dashboard.changeRequests.actions.submitting')
            : t('dashboard.changeRequests.actions.confirm')
        }
      />
    </div>
  );
}

/** Confirmation panel for agreeing (per-party sign). `note` adds a leading line —
 *  used to tell the requester this is their own request (accept-only, no cancel). */
export function AgreePanel({
  onConfirm,
  onCancel,
  pending,
  error,
  note,
}: {
  onConfirm: () => void;
  onCancel?: () => void;
  pending: boolean;
  error: string | null;
  note?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="border-status-approved/40 bg-status-approved-soft/30 flex flex-col gap-3 rounded-xl border p-4">
      <h3 className="text-foreground text-end text-sm font-medium">
        {t('dashboard.changeRequests.actions.agreeTitle')}
      </h3>
      {note && (
        <p dir="auto" className="text-foreground text-start text-xs font-medium">
          {note}
        </p>
      )}
      <p dir="auto" className="text-muted-foreground text-start text-xs">
        {t('dashboard.changeRequests.actions.agreeBody')}
      </p>
      <PanelError error={error} />
      <PanelFooter
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmDisabled={pending}
        confirmLabel={
          pending
            ? t('dashboard.changeRequests.actions.submitting')
            : t('dashboard.changeRequests.actions.agreeConfirm')
        }
      />
    </div>
  );
}
