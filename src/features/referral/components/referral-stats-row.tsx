'use client';

import type { ComponentType, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';

import { PersonIcon, SendIcon, StarIcon } from '@/components/icons';

import type { ReferralStats } from '../types/referral';

type Tile = { key: string; Icon: ComponentType<SVGProps<SVGSVGElement>>; value: number };

/** One funnel metric — icon, big count, short label. */
function StatTile({ tile, label }: { tile: Tile; label: string }) {
  return (
    <div className="bg-card border-border flex flex-col gap-2 rounded-2xl border p-3 shadow-sm sm:p-4">
      <tile.Icon className="text-primary size-4 shrink-0" aria-hidden />
      <span className="text-foreground text-2xl font-bold tabular-nums">{tile.value}</span>
      <span className="text-muted-foreground text-xs leading-tight">{label}</span>
    </div>
  );
}

/**
 * The refer-a-friend funnel — invited → joined → rewarded, as three compact tiles.
 * Counts come straight from the stats payload (missing fields read as 0). Labels are
 * static so they carry no `dir="auto"`; the count is `tabular-nums` for steady width.
 */
export function ReferralStatsRow({ stats }: { stats: ReferralStats }) {
  const { t } = useTranslation();
  const tiles: Tile[] = [
    { key: 'invited', Icon: SendIcon, value: stats.total_invited ?? 0 },
    { key: 'signedUp', Icon: PersonIcon, value: stats.signed_up ?? 0 },
    { key: 'converted', Icon: StarIcon, value: stats.converted ?? 0 },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {tiles.map((tile) => (
        <StatTile key={tile.key} tile={tile} label={t(`referral.stats.${tile.key}`)} />
      ))}
    </div>
  );
}
