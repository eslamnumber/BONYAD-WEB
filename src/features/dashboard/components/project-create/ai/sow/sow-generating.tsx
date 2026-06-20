'use client';

import { Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { OmdahAvatarIllustration } from '@/components/illustrations';

import { SOW_SECTION_ORDER } from '../../../../api/ai/merge-sections';

const K = 'dashboard.createProject.ai.sow';
type NodeState = 'done' | 'active' | 'pending';

/**
 * "Omdah is building your scope of work…" — the live generation screen. The blue
 * orb sits in its thinking state (breathing glow + ping ring + typing dots), and a
 * vertical timeline below it fills in section-by-section as each stream event lands.
 */
export function SowGenerating({ arrived, thinking }: { arrived: string[]; thinking: string }) {
  const { t } = useTranslation();
  const firstPending = SOW_SECTION_ORDER.findIndex((key) => !arrived.includes(key));

  return (
    <div className="flex w-full max-w-[520px] flex-col items-center gap-8 text-center">
      <ThinkingOrb />
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-foreground text-2xl font-semibold">{t(`${K}.generating.title`)}</h1>
        <p dir="auto" className="text-muted-foreground min-h-5 text-sm">
          {thinking || t(`${K}.generating.subtitle`)}
        </p>
        <TypingDots />
      </div>

      <ol className="border-border/60 bg-card/60 flex w-full flex-col rounded-2xl border p-5 backdrop-blur-sm">
        {SOW_SECTION_ORDER.map((key, i) => {
          const state: NodeState = arrived.includes(key)
            ? 'done'
            : i === firstPending
              ? 'active'
              : 'pending';
          return (
            <TimelineRow
              key={key}
              label={t(`${K}.sections.${key}`)}
              state={state}
              last={i === SOW_SECTION_ORDER.length - 1}
            />
          );
        })}
      </ol>
    </div>
  );
}

/** The blue ball in its "thinking" state — layered glow + an expanding ring. */
function ThinkingOrb() {
  return (
    <div className="relative flex items-center justify-center">
      <span
        className="bg-deco-blob-blue-light/40 absolute size-44 rounded-full blur-3xl motion-safe:animate-pulse"
        aria-hidden
      />
      <span
        className="border-job-accent/30 absolute size-36 rounded-full border motion-safe:animate-ping"
        aria-hidden
      />
      <OmdahAvatarIllustration
        className="relative size-32 shrink-0 motion-safe:animate-pulse"
        aria-hidden
      />
    </div>
  );
}

/** Three staggered dots — the "thinking" affordance. */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      <span className="bg-job-accent size-1.5 rounded-full motion-safe:animate-bounce" />
      <span className="bg-job-accent size-1.5 rounded-full [animation-delay:150ms] motion-safe:animate-bounce" />
      <span className="bg-job-accent size-1.5 rounded-full [animation-delay:300ms] motion-safe:animate-bounce" />
    </div>
  );
}

/** One section node on the vertical timeline, with a connector to the next. */
function TimelineRow({ label, state, last }: { label: string; state: NodeState; last: boolean }) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <Node state={state} />
        {last ? null : (
          <span
            className={`my-1 w-px flex-1 ${state === 'done' ? 'bg-success/40' : 'bg-border'}`}
          />
        )}
      </div>
      <span
        className={`pb-4 text-start text-sm ${
          state === 'pending' ? 'text-muted-foreground' : 'text-foreground font-medium'
        }`}
      >
        {label}
      </span>
    </li>
  );
}

function Node({ state }: { state: NodeState }) {
  if (state === 'done') {
    return (
      <span className="bg-success text-success-foreground flex size-6 shrink-0 items-center justify-center rounded-full">
        <Check className="size-3.5" aria-hidden />
      </span>
    );
  }
  if (state === 'active') {
    return (
      <span className="border-job-accent text-job-accent flex size-6 shrink-0 items-center justify-center rounded-full border-2">
        <Loader2 className="size-3.5 motion-safe:animate-spin" aria-hidden />
      </span>
    );
  }
  return (
    <span className="border-border bg-muted size-6 shrink-0 rounded-full border" aria-hidden />
  );
}
