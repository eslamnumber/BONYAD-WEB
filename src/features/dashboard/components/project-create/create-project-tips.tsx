'use client';

import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '@/components/icons';
import { Button, Modal, ModalFooter } from '@/components/ui';
import { conventionalDirection, type Locale } from '@/types/locale';

const K = 'dashboard.createProject.method';
const TIP_KEYS = ['clearTitle', 'scope', 'budget', 'photos', 'phases'] as const;

/**
 * "Need help? Learn how to create a good project" — the link opens a tips dialog
 * (the app's shared `Modal`, conventional reading direction like the other dashboard
 * modals) with a short, numbered list of advice for writing a strong project request.
 */
export function CreateProjectTips({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <p className="text-foreground text-end text-xs leading-normal">
        {t(`${K}.help.question`)}{' '}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-job-accent focus-visible:outline-ring rounded font-medium underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {t(`${K}.help.link`)}
        </button>
      </p>
      <TipsModal open={open} onClose={() => setOpen(false)} locale={locale} />
    </>
  );
}

function TipsModal({
  open,
  onClose,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const titleId = useId();

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} dir={conventionalDirection(locale)}>
      <div className="border-border flex items-center justify-between gap-3 border-b px-6 py-5">
        <h2 id={titleId} className="text-foreground min-w-0 text-start text-xl font-medium">
          {t(`${K}.tips.title`)}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t(`${K}.tips.close`)}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring shrink-0 rounded-lg p-2 focus-visible:ring-2 focus-visible:outline-none"
        >
          <CloseIcon className="size-4" aria-hidden />
        </button>
      </div>
      <TipsList />
      <ModalFooter>
        <Button onClick={onClose} className="h-11 flex-1 rounded-lg text-base font-medium">
          {t(`${K}.tips.gotIt`)}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function TipsList() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <p className="text-muted-foreground text-start text-sm leading-snug">
        {t(`${K}.tips.intro`)}
      </p>
      <ol className="flex flex-col gap-4">
        {TIP_KEYS.map((key, index) => (
          <li key={key} className="flex items-start gap-3">
            <span
              aria-hidden
              className="bg-job-accent/10 text-job-accent flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            >
              {index + 1}
            </span>
            <span className="text-foreground text-start text-sm leading-snug">
              {t(`${K}.tips.items.${key}`)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
