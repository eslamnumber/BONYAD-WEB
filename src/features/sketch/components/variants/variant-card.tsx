'use client';

import { useTranslation } from 'react-i18next';

import { FileIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

import type { SketchFloorSvg, SketchParse, SketchVariantLabel } from '../../api/sketch-types';
import { verdictTone, type VerdictTone } from '../../lib/compliance';
import { pickText } from '../../lib/locale-text';

import { VariantFloorPreview } from './variant-floor-preview';

const TONE_CLASS: Record<VerdictTone, string> = {
  ok: 'bg-status-approved-soft text-status-approved',
  needs_fix: 'bg-status-progress-soft text-status-progress',
  reject: 'bg-status-rejected-soft text-status-rejected',
};

type Props = {
  label?: SketchVariantLabel;
  parse?: SketchParse;
  floors: SketchFloorSvg[];
  selected: boolean;
  onSelect: () => void;
  onCompliance: () => void;
};

/** Name + verdict + stats + compliance action below the preview. */
function VariantCardBody({
  name,
  rooms,
  floorsCount,
  tone,
  onCompliance,
}: {
  name: string;
  rooms: number;
  floorsCount: number;
  tone: VerdictTone;
  onCompliance: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-foreground text-base font-semibold" dir="auto">
          {name}
        </h3>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', TONE_CLASS[tone])}>
          {t(`sketch.variants.verdict.${tone}`)}
        </span>
      </div>
      <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>{t('sketch.variants.stats.rooms', { count: rooms })}</span>
        <span>{t('sketch.variants.stats.floors', { count: floorsCount })}</span>
      </div>
      <button
        type="button"
        onClick={onCompliance}
        className="border-border text-foreground hover:bg-muted focus-visible:outline-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <FileIcon className="size-4" aria-hidden />
        {t('sketch.variants.viewCompliance')}
      </button>
    </div>
  );
}

/** One 2D variant tile: a plan preview that selects on tap, plus stats + compliance. */
export function VariantCard({ label, parse, floors, selected, onSelect, onCompliance }: Props) {
  const { t, i18n } = useTranslation();
  const name = pickText(i18n.language, label?.en, label?.ar) || t('sketch.variants.title');
  const rooms = floors.reduce((total, floor) => total + (floor.rooms_count ?? 0), 0);
  const tone = verdictTone(parse?.engineering_review?.verdict);

  return (
    <div
      className={cn(
        'bg-card flex flex-col overflow-hidden rounded-2xl border transition-[border-color,box-shadow] hover:shadow-md',
        selected
          ? 'border-create-option-purple ring-create-option-purple/40 ring-2'
          : 'border-border hover:border-create-option-purple/40',
      )}
    >
      <VariantFloorPreview floors={floors} name={name} selected={selected} onSelect={onSelect} />
      <VariantCardBody
        name={name}
        rooms={rooms}
        floorsCount={floors.length}
        tone={tone}
        onCompliance={onCompliance}
      />
    </div>
  );
}
