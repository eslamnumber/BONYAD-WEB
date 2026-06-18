'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { SettingsAmbientGlow } from '@/components/layout';
import { SegmentedTabs } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { type Locale } from '@/types/locale';

import { conventionalDir } from '../lib/support-format';

import { RequestsPanel } from './requests-panel';
import { TicketsPanel } from './tickets-panel';

type Tab = 'tickets' | 'conversations';

/**
 * Back-to-profile link in **conventional direction** (this screen overrides the inverted
 * map, so the shared `SettingsBackLink` — tuned for the inverted map — would point the wrong
 * way). Chevron leads at the reading-start and points back; the flip is computed from
 * `conventionalDir` (the `rtl:`/`ltr:` variants also match the inverted `<html dir>`, so they
 * misfire under this screen's local dir override).
 */
function BackLink({ label, locale }: { label: string; locale: Locale }) {
  return (
    <nav className="flex w-full items-center justify-start">
      <Link
        href={ROUTES.DASHBOARD_SETTINGS}
        className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-2 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        <ChevronLeftIcon
          className={`size-3 shrink-0 ${conventionalDir(locale) === 'rtl' ? '-scale-x-100' : ''}`}
          aria-hidden
        />
        {label}
      </Link>
    </nav>
  );
}

/**
 * Support center (`/dashboard/settings/support`) — both roles. Mirrors the iOS two-tab
 * support centre (original web design): a **Tickets** system (threaded, admin-replied,
 * status-filtered) and a **Conversations** system (chat requests filtered by state → live
 * MQTT conversation with the assigned agent). Full-width flush screen; client island.
 *
 * **Direction override:** this screen renders in the conventional mapping (en→ltr, ar→rtl)
 * via `dir={conventionalDir(locale)}` on the root + each portalled modal — a deliberate,
 * scoped exception to the project's inverted `LOCALE_DIRECTION`, per product request.
 */
export function SupportScreen() {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const [tab, setTab] = useState<Tab>('tickets');

  const tabs = [
    { value: 'tickets' as const, label: t('support.tabs.tickets') },
    { value: 'conversations' as const, label: t('support.tabs.conversations') },
  ];

  return (
    <div
      dir={conventionalDir(locale)}
      className="relative isolate flex w-full flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:gap-8"
    >
      <SettingsAmbientGlow />
      <BackLink label={t('support.back')} locale={locale} />

      <header>
        <h1 className="text-foreground text-start text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('support.title')}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-start text-sm">{t('support.subtitle')}</p>
      </header>

      <SegmentedTabs
        options={tabs}
        value={tab}
        onChange={setTab}
        ariaLabel={t('support.tabs.aria')}
      />

      {tab === 'tickets' ? <TicketsPanel locale={locale} /> : <RequestsPanel locale={locale} />}
    </div>
  );
}
