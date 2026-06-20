'use client';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { OmdahAvatarIllustration } from '@/components/illustrations';

const K = 'dashboard.createProject.ai.sow.publishing';

/** Publishing — the loading state while the project + phases + photos are created. */
export function SowPublishing() {
  const { t } = useTranslation();

  return (
    <div className="flex w-full max-w-[440px] flex-col items-center gap-6 text-center">
      <div className="relative flex items-center justify-center">
        <span
          className="bg-deco-blob-blue-light/30 absolute size-36 rounded-full blur-2xl motion-safe:animate-pulse"
          aria-hidden
        />
        <OmdahAvatarIllustration className="relative size-28 shrink-0" aria-hidden />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-foreground text-xl font-semibold">{t(`${K}.title`)}</h1>
        <p className="text-muted-foreground text-sm">{t(`${K}.subtitle`)}</p>
      </div>
      <Loader2 className="text-job-accent size-6 motion-safe:animate-spin" aria-hidden />
    </div>
  );
}
