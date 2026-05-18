'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { captureException } from '@/lib/sentry';

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RouteError({ error, reset }: ErrorBoundaryProps) {
  const { t } = useTranslation();

  useEffect(() => {
    captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t('errors.generic')}</h1>
      <p className="text-muted-foreground text-balance">{t('errors.genericDescription')}</p>
      <Button type="button" onClick={reset}>
        {t('common.tryAgain')}
      </Button>
    </section>
  );
}
