'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

const K = 'dashboard.createProject.ai.summary';

/**
 * Shown in the composer slot once every answer is gathered (the closing message is the
 * last chat bubble). "Generate" hands the answers to the Omdah SOW flow; "Edit answers"
 * restarts the interview.
 */
export function InterviewDone({
  onEdit,
  onGenerate,
}: {
  onEdit: () => void;
  onGenerate: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={onGenerate} className="h-12 w-full rounded-full text-base font-semibold">
        {t(`${K}.generate`)}
      </Button>
      <button
        type="button"
        onClick={onEdit}
        className="text-job-accent focus-visible:outline-ring rounded text-sm font-medium underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t(`${K}.edit`)}
      </button>
    </div>
  );
}
