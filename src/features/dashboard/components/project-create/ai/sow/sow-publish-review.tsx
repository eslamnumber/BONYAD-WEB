'use client';

import { type ComponentType, type SVGProps } from 'react';
import { useTranslation } from 'react-i18next';

import {
  AboutTimelineDotIcon,
  AiAssistantIcon,
  DetailLocationIcon,
  PaperclipIcon,
} from '@/components/icons';
import { Button } from '@/components/ui';

import type { SowDocument } from '../../../../api/ai/sow-types';

import type { PublishDraft } from './sow-flow-types';
import { formatRange, hasText } from './sow-format';
import { AmountText } from './sow-primitives';

const K = 'dashboard.createProject.ai.sow';
type Tr = (key: string, opts?: Record<string, unknown>) => string;
type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;
type Detail = { icon: IconCmp; label: string; value?: string };

function buildDetails(sow: SowDocument, draft: PublishDraft, t: Tr): Detail[] {
  const weeks = sow.timeline?.duration_weeks;
  return [
    {
      icon: AboutTimelineDotIcon,
      label: t(`${K}.confirm.duration`),
      value: typeof weeks === 'number' ? t(`${K}.confirm.weeks`, { count: weeks }) : undefined,
    },
    { icon: DetailLocationIcon, label: t(`${K}.confirm.address`), value: draft.address },
    {
      icon: PaperclipIcon,
      label: t(`${K}.confirm.photos`),
      value: draft.photos.length ? String(draft.photos.length) : undefined,
    },
  ].filter((d) => hasText(d.value));
}

/** Publish — final review + confirm. A professional recap before the project goes live. */
export function SowPublishReview({
  sow,
  draft,
  onBack,
  onPublish,
}: {
  sow: SowDocument;
  draft: PublishDraft;
  onBack: () => void;
  onPublish: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-foreground text-start text-2xl font-bold">{t(`${K}.confirm.title`)}</h1>
        <p className="text-muted-foreground text-start text-sm">{t(`${K}.confirm.subtitle`)}</p>
      </header>

      <HeroCard sow={sow} t={t} />

      <dl className="border-border/60 bg-card/70 divide-border/50 flex flex-col divide-y rounded-2xl border backdrop-blur-sm">
        {buildDetails(sow, draft, t).map((d) => (
          <DetailRow key={d.label} icon={d.icon} label={d.label} value={d.value!} />
        ))}
      </dl>

      <p className="text-muted-foreground text-start text-xs leading-relaxed">
        {t(`${K}.confirm.note`)}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button onClick={onPublish} className="h-12 flex-1 rounded-full text-base font-semibold">
          {t(`${K}.confirm.publish`)}
        </Button>
        <Button variant="ghost" onClick={onBack} className="h-12 rounded-full">
          {t(`${K}.confirm.back`)}
        </Button>
      </div>
    </div>
  );
}

function HeroCard({ sow, t }: { sow: SowDocument; t: Tr }) {
  const meta = sow.project_metadata ?? {};
  const currency = sow.commercials?.currency || t(`${K}.sar`);
  const grand = formatRange(sow.commercials?.cost_breakdown?.grand_total);
  const title = hasText(meta.project_name) ? meta.project_name! : t(`${K}.review.untitled`);

  return (
    <section className="border-border/60 bg-card/70 flex flex-col gap-4 rounded-2xl border p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="bg-job-accent/10 text-job-accent inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <AiAssistantIcon className="size-3.5" aria-hidden />
            {t(`${K}.review.byOmdah`)}
          </span>
          <h2 dir="auto" className="text-foreground text-start text-xl font-bold">
            {title}
          </h2>
        </div>
        {hasText(meta.quality_tier) ? (
          <span className="border-job-accent/30 text-job-accent shrink-0 rounded-md border px-2.5 py-0.5 text-xs font-semibold">
            {t(`${K}.review.tier`, { tier: meta.quality_tier })}
          </span>
        ) : null}
      </div>
      {grand ? (
        <div className="border-job-accent/30 bg-job-accent/10 flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <span className="text-muted-foreground text-start text-sm">
            {t(`${K}.confirm.budget`)}
          </span>
          <span className="text-job-accent text-lg">
            <AmountText value={grand} currency={currency} />
          </span>
        </div>
      ) : null}
    </section>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: IconCmp; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className="bg-secondary/60 text-job-accent flex size-9 shrink-0 items-center justify-center rounded-xl">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <dt className="text-muted-foreground text-start text-xs">{label}</dt>
        <dd dir="auto" className="text-foreground text-start text-sm font-medium">
          {value}
        </dd>
      </div>
    </div>
  );
}
