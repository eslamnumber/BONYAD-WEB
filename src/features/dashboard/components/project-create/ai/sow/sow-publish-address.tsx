'use client';

import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

import { Button, Label, Textarea } from '@/components/ui';

import type { PublishDraft } from './sow-flow-types';
import { SowPhotoUpload } from './sow-photo-upload';

const K = 'dashboard.createProject.ai.sow.publish';

// Client-only — the Google Maps SDK touches `window` at import.
const AddressMap = dynamic(() => import('./address-map'), {
  ssr: false,
  loading: () => (
    <div className="border-border/60 bg-muted/40 h-64 w-full animate-pulse rounded-2xl border" />
  ),
});

/**
 * Publish — location step. A required free-text address plus an optional map
 * pin-drop (lat/lng) and optional project photos. Continue is gated on the address.
 */
export function SowPublishAddress({
  draft,
  onUpdate,
  onBack,
  onContinue,
}: {
  draft: PublishDraft;
  onUpdate: (partial: Partial<PublishDraft>) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="bg-job-accent/10 text-job-accent flex size-11 items-center justify-center rounded-2xl">
          <MapPin className="size-5" aria-hidden />
        </span>
        <h1 className="text-foreground text-start text-2xl font-bold">{t(`${K}.title`)}</h1>
        <p className="text-muted-foreground text-start text-sm">{t(`${K}.subtitle`)}</p>
      </header>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sow-address">{t(`${K}.addressLabel`)}</Label>
        {/* No dir="auto" — inherit the flow's conventional dir so it aligns right in ar. */}
        <Textarea
          id="sow-address"
          value={draft.address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          rows={2}
          placeholder={t(`${K}.addressPlaceholder`)}
          className="text-start"
        />
      </div>

      <LocationField draft={draft} onUpdate={onUpdate} t={t} />
      <SowPhotoUpload onChange={(photos) => onUpdate({ photos })} />

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          onClick={onContinue}
          disabled={draft.address.trim().length === 0}
          className="h-12 flex-1 rounded-full text-base font-semibold"
        >
          {t(`${K}.continue`)}
        </Button>
        <Button variant="ghost" onClick={onBack} className="h-12 rounded-full">
          {t(`${K}.back`)}
        </Button>
      </div>
    </div>
  );
}

function LocationField({
  draft,
  onUpdate,
  t,
}: {
  draft: PublishDraft;
  onUpdate: (partial: Partial<PublishDraft>) => void;
  t: (key: string) => string;
}) {
  const hasPin = typeof draft.latitude === 'number' && typeof draft.longitude === 'number';
  return (
    <div className="flex flex-col gap-2">
      <span className="text-foreground text-start text-sm font-medium">{t(`${K}.mapLabel`)}</span>
      <AddressMap
        lat={draft.latitude}
        lng={draft.longitude}
        onPick={(latitude, longitude, address) =>
          onUpdate({ latitude, longitude, ...(address ? { address } : {}) })
        }
      />
      {hasPin ? (
        <span dir="ltr" className="text-muted-foreground text-start text-xs tabular-nums">
          {draft.latitude!.toFixed(5)}, {draft.longitude!.toFixed(5)}
        </span>
      ) : null}
    </div>
  );
}
