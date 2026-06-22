'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SegmentedTabs, type SegmentedOption } from '@/components/ui';

import { type SupervisingFilter } from '../../api';

import { SupervisionList } from './supervision-list';

/**
 * The technician supervision hub at /dashboard/supervision — Invitations | Active
 * tabs over the projects the SP supervises. `(app)` screen-root is full-width flush
 * (rule 4a): no mx-auto / max-w on the root, just the px gutter. One signature blue
 * glow behind the header for on-brand depth (desktop-gated, behind content).
 */
export function SupervisionScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<SupervisingFilter>('invited');

  const options: SegmentedOption<SupervisingFilter>[] = [
    { value: 'invited', label: t('dashboard.supervision.tabs.invitations') },
    { value: 'active', label: t('dashboard.supervision.tabs.active') },
  ];

  return (
    <div className="relative isolate flex w-full flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden justify-center sm:flex"
      >
        <div className="bg-deco-blob-blue-light h-[340px] w-[340px] rounded-full opacity-20 blur-[90px]" />
      </div>

      <header className="flex flex-col items-end gap-2 text-end">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('dashboard.supervision.title')}
        </h1>
        <p dir="auto" className="text-muted-foreground max-w-xl text-start text-sm leading-6">
          {t('dashboard.supervision.subtitle')}
        </p>
      </header>

      <SegmentedTabs
        options={options}
        value={tab}
        onChange={setTab}
        ariaLabel={t('dashboard.supervision.tabsAria')}
      />

      <SupervisionList status={tab} />
    </div>
  );
}
