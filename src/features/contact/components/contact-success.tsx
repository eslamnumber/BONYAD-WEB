'use client';

import { useTranslation } from 'react-i18next';

type Props = {
  ticketNumber: string;
  onReset: () => void;
};

export function ContactSuccess({ ticketNumber, onReset }: Props) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-6 text-center">
      <h2 className="text-foreground text-2xl font-semibold">{t('contact.form.successTitle')}</h2>
      <p className="text-hero-subtext text-base">
        {t('contact.form.successBody', { ticketNumber })}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="bg-primary text-primary-foreground h-12 rounded-full px-6 text-base font-semibold transition-opacity motion-safe:hover:opacity-90"
      >
        {t('contact.form.submitAnother')}
      </button>
    </div>
  );
}
