'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { type TechnicianStatus } from '../api/get-technician-status';
import { useConventionalDir } from '../hooks/use-conventional-dir';

const K = 'onboarding.waitingApproval';
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** "Under review" hero — the resting state while an admin reviews the submission. */
export function ApprovalStatusCard({ data }: { data?: TechnicianStatus }) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative flex flex-col items-center gap-6 text-center"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center"
        aria-hidden
      >
        <div className="bg-deco-blob-blue-light size-48 rounded-full opacity-30 blur-[80px]" />
      </div>
      <PulsingClock reduce={Boolean(reduce)} />
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-[28px] leading-tight font-medium">
          {t(`${K}.heading`)}
        </h1>
        <p dir="auto" className="text-muted-foreground text-base">
          {t(`${K}.message`)}
        </p>
      </div>
      <SubmittedChecklist data={data} />
    </motion.div>
  );
}

/** Calm breathing clock with a soft expanding ring — conveys patient, active waiting. */
function PulsingClock({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative">
      {!reduce ? (
        <motion.span
          aria-hidden
          className="bg-primary/15 absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.6], opacity: [0.45, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />
      ) : null}
      <motion.span
        className="bg-primary/10 text-primary relative flex size-20 items-center justify-center rounded-full"
        animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Clock className="size-9" aria-hidden />
      </motion.span>
    </div>
  );
}

function SubmittedChecklist({ data }: { data?: TechnicianStatus }) {
  const { t } = useTranslation();
  const dir = useConventionalDir();
  const items = [
    { key: 'email', done: data?.hasEmail },
    { key: 'bio', done: data?.hasDescription },
    { key: 'regions', done: data?.hasRegions },
    { key: 'certificates', done: data?.hasCertificates },
  ];
  // dir scope → the leading check sits on the reading-start side and the label
  // right-aligns, both via plain logical CSS (no flex-row-reverse).
  return (
    <ul dir={dir} className="bg-field-surface flex w-full flex-col gap-3 rounded-2xl p-4">
      {items.map(({ key, done }) => (
        <li key={key} className="flex items-center gap-3">
          {done ? (
            <CheckCircle2 className="text-success size-5 shrink-0" aria-hidden />
          ) : (
            <Circle className="text-muted-foreground size-5 shrink-0" aria-hidden />
          )}
          <span className="text-foreground flex-1 text-start text-sm">
            {t(`${K}.checklist.${key}`)}
          </span>
        </li>
      ))}
    </ul>
  );
}
