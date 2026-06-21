'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { conventionalDirection, type Locale } from '@/types/locale';

import type { SketchParse } from '../api/sketch-types';
import { useSketchPlanner } from '../hooks/use-sketch-planner';

import { ComplianceSheet } from './compliance/compliance-sheet';
import { SketchForm } from './form/sketch-form';
import { SketchGenerating } from './generating/sketch-generating';
import { SketchErrorPanel } from './sketch-error-panel';
import { VariantPicker } from './variants/variant-picker';
import { Sketch3DViewer } from './viewer/sketch-3d-viewer';

/** The signature purple glow, desktop-gated and inert (identity §11). */
function SketchBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 hidden justify-center sm:flex"
      aria-hidden
    >
      <div className="bg-deco-blob-purple h-[420px] w-[420px] rounded-full opacity-20 blur-[110px]" />
    </div>
  );
}

/**
 * Back link to the chooser. Sits at the inline-start (same side as the content) and
 * computes the chevron flip from the flow's conventional `dir` in JS — a `ltr:`/`rtl:`
 * variant would track `<html dir>` (the inverted app map), not this override, so it
 * would point the wrong way. Mirrors the Omdah flow's back button.
 */
function SketchBackLink({ dir }: { dir: 'ltr' | 'rtl' }) {
  const { t } = useTranslation();
  const flip = dir === 'rtl' ? '-scale-x-100' : '';
  return (
    <Link
      href={ROUTES.DASHBOARD_PROJECTS_CREATE}
      className="text-foreground/70 hover:text-foreground focus-visible:outline-ring inline-flex w-fit items-center gap-1 rounded text-sm font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
    >
      <ChevronLeftIcon className={`size-3 shrink-0 ${flip}`} aria-hidden />
      {t('sketch.back')}
    </Link>
  );
}

/** Renders the active phase (or the error overlay). */
function PhaseContent({
  planner,
  openSheet,
}: {
  planner: ReturnType<typeof useSketchPlanner>;
  openSheet: (parse?: SketchParse) => void;
}) {
  if (planner.error) {
    return <SketchErrorPanel kind={planner.error} onRetry={planner.actions.retry} />;
  }
  if (planner.phase === 'viewer' && planner.confirmedJob) {
    return (
      <Sketch3DViewer
        job={planner.confirmedJob}
        onViewCompliance={() => openSheet(planner.confirmedJob?.parse)}
        onStartOver={planner.actions.startOver}
      />
    );
  }
  if (planner.phase === 'variants' && planner.job) {
    return (
      <VariantPicker
        job={planner.job}
        selectedIndex={planner.selectedVariant}
        confirming={planner.confirming}
        onSelect={planner.actions.selectVariant}
        onConfirm={planner.actions.confirm}
        onCompliance={openSheet}
      />
    );
  }
  if (planner.phase === 'generating') {
    return <SketchGenerating />;
  }
  return <SketchForm onGenerate={planner.actions.generate} submitting={planner.submitting} />;
}

/**
 * Orchestrator for the 2D → 3D sketch planner. Runs in conventional direction
 * (en → ltr, ar → rtl) per the product decision for this flow, and is a full-width
 * `(app)` screen-root.
 */
export function SketchPlanner() {
  const { i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const dir = conventionalDirection(locale);
  const planner = useSketchPlanner();
  const [sheet, setSheet] = useState<{ open: boolean; parse?: SketchParse }>({ open: false });

  const openSheet = (parse?: SketchParse) => setSheet({ open: true, parse });
  const closeSheet = () => setSheet((prev) => ({ ...prev, open: false }));

  return (
    <div dir={dir} className="relative isolate flex w-full flex-col px-4 py-8 sm:px-6">
      <SketchBackdrop />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <SketchBackLink dir={dir} />
        <PhaseContent planner={planner} openSheet={openSheet} />
      </div>
      <ComplianceSheet open={sheet.open} onClose={closeSheet} parse={sheet.parse} dir={dir} />
    </div>
  );
}
