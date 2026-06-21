'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AiAssistantIcon, PhaseCheckIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

const STEPS = ['analyze', 'draw', 'rooms', 'openings', 'code', 'prepare'] as const;
const STEP_MS = 4000;

type StepState = 'done' | 'active' | 'pending';

/** One timeline row: a status node + label. */
function StepRow({ label, state }: { label: string; state: StepState }) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors',
        state === 'active' && 'bg-create-option-purple/5',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full border',
          state === 'done' && 'bg-success text-success-foreground border-transparent',
          state === 'active' && 'border-create-option-purple text-create-option-purple',
          state === 'pending' && 'border-border text-muted-foreground',
        )}
      >
        {state === 'done' ? (
          <PhaseCheckIcon className="size-3.5" />
        ) : state === 'active' ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <span className="size-1.5 rounded-full bg-current" />
        )}
      </span>
      <span
        className={cn(
          'text-sm',
          state === 'pending' ? 'text-muted-foreground' : 'text-foreground font-medium',
        )}
      >
        {label}
      </span>
    </li>
  );
}

/** Phase 2 — progress while the backend generates the 2D variants. */
export function SketchGenerating() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => Math.min(i + 1, STEPS.length - 1)), STEP_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-8 py-10 text-center" aria-live="polite">
      <div className="relative flex size-24 items-center justify-center">
        <span
          className="bg-deco-blob-purple absolute inset-0 rounded-full opacity-30 blur-2xl"
          aria-hidden
        />
        <span
          className="bg-create-option-purple/10 absolute inset-2 rounded-full motion-safe:animate-ping"
          aria-hidden
        />
        <span className="bg-card border-border text-create-option-purple relative flex size-20 items-center justify-center rounded-full border shadow-sm">
          <AiAssistantIcon className="size-9" aria-hidden />
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-foreground text-2xl font-semibold">{t('sketch.generating.title')}</h2>
        <p className="text-muted-foreground text-base">{t('sketch.generating.subtitle')}</p>
      </div>

      <ol className="flex w-full max-w-md flex-col gap-1">
        {STEPS.map((step, i) => (
          <StepRow
            key={step}
            label={t(`sketch.generating.steps.${step}`)}
            state={i < active ? 'done' : i === active ? 'active' : 'pending'}
          />
        ))}
      </ol>
    </div>
  );
}
