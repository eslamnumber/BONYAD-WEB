'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Toast } from '@/components/feedback/toast';
import { SettingsAmbientGlow, SettingsBackLink } from '@/components/layout';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { type Locale } from '@/types/locale';

import { useMyServices } from '../api';

import { AddServiceModal } from './add-service-modal';
import { ServiceList } from './service-list';
import { ServicesHeader } from './services-header';

export type ToastTone = 'success' | 'error';
export type ShowToast = (message: string, tone?: ToastTone) => void;

/** Local transient toast state for add / remove confirmations. */
function useServiceToast() {
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const show: ShowToast = (message, tone = 'success') => setToast({ message, tone });
  return { toast, show, close: () => setToast(null) };
}

/**
 * My Services (`/dashboard/settings/services`) — the technician's offered services,
 * with add (picker modal) and per-row remove. Reached from the profile hub's
 * technician-only "Services" row. App-default inverted direction mapping; shared
 * settings chrome (`SettingsBackLink` / `SettingsAmbientGlow`) so it lines up with
 * the rest of the settings sub-screens. Client island — the `(app)` layout supplies
 * the sidebar.
 */
export function ServicesScreen() {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const [addOpen, setAddOpen] = useState(false);
  const { toast, show, close } = useServiceToast();

  const myServices = useMyServices();
  const services = myServices.data ?? [];
  const ownedIds = services.map((s) => s.id);

  return (
    <div className="relative isolate flex w-full flex-1 flex-col px-4 py-8 sm:px-6">
      <SettingsAmbientGlow />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 lg:gap-8">
        <SettingsBackLink href={ROUTES.DASHBOARD_SETTINGS} label={t('services.back')} />

        <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-end sm:justify-between">
          <ServicesHeader count={services.length} />
          <Button type="button" onClick={() => setAddOpen(true)} className="shrink-0">
            {t('services.add.cta')}
          </Button>
        </header>

        <ServiceList
          services={services}
          isPending={myServices.isPending}
          isError={myServices.isError}
          locale={locale}
          onRetry={() => void myServices.refetch()}
          onAdd={() => setAddOpen(true)}
          onToast={show}
        />
      </div>

      <AddServiceModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        locale={locale}
        ownedIds={ownedIds}
        onToast={show}
      />

      <Toast open={!!toast} message={toast?.message ?? ''} tone={toast?.tone} onClose={close} />
    </div>
  );
}
