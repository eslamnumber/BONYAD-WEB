'use client';

import { type ReactNode, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalFooter, ModalHeader } from '@/components/ui';
import { conventionalDirection, type Locale } from '@/types/locale';

import { useAddServices, useAllServices } from '../api';
import { localizedName, type Service } from '../schemas/service';

import type { ShowToast } from './services-screen';

type Props = {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  ownedIds: number[];
  onToast: ShowToast;
};

/**
 * "Add services" picker — a portalled dialog listing every available service the
 * technician doesn't yet offer (multi-select), confirming with the batch add. Uses
 * the shared inverted-map `Modal` chrome (this screen keeps the app-default mapping,
 * so no explicit `dir` is needed).
 */
function useSelection() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return { selected, toggle, reset: () => setSelected(new Set()) };
}

export function AddServiceModal({ open, onClose, locale, ownedIds, onToast }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const { selected, toggle, reset } = useSelection();
  const { data, isPending, isError, refetch } = useAllServices(open);
  const add = useAddServices();

  const available = useMemo(
    () => (data ?? []).filter((s) => !ownedIds.includes(s.id)),
    [data, ownedIds],
  );

  const handleConfirm = () => {
    if (selected.size === 0) return;
    add.mutate([...selected], {
      onSuccess: () => {
        reset();
        onClose();
        onToast(t('services.add.success', { count: selected.size }));
      },
      onError: () => onToast(t('services.add.submitError'), 'error'),
    });
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="max-w-lg">
      <ModalHeader
        titleId={titleId}
        title={t('services.add.title')}
        closeLabel={t('services.add.close')}
        onClose={onClose}
      />
      <AddServiceScroller dir={conventionalDirection(locale)}>
        <AddServiceBody
          isPending={isPending}
          isError={isError}
          available={available}
          locale={locale}
          selected={selected}
          onToggle={toggle}
          onRetry={() => void refetch()}
        />
      </AddServiceScroller>
      <AddServiceFooter
        count={selected.size}
        isAdding={add.isPending}
        onCancel={onClose}
        onConfirm={handleConfirm}
      />
    </Modal>
  );
}

function AddServiceScroller({ dir, children }: { dir: 'rtl' | 'ltr'; children: ReactNode }) {
  // Option rows scope natural reading direction; header/footer stay inverted-map.
  return (
    <div dir={dir} className="flex max-h-[60dvh] flex-col gap-2 overflow-y-auto p-4">
      {children}
    </div>
  );
}

function AddServiceFooter({
  count,
  isAdding,
  onCancel,
  onConfirm,
}: {
  count: number;
  isAdding: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ModalFooter>
      <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
        {t('services.add.cancel')}
      </Button>
      <Button
        type="button"
        onClick={onConfirm}
        disabled={count === 0 || isAdding}
        className="flex-1"
      >
        {isAdding ? t('services.add.adding') : t('services.add.confirm', { count })}
      </Button>
    </ModalFooter>
  );
}

function AddServiceBody({
  isPending,
  isError,
  available,
  locale,
  selected,
  onToggle,
  onRetry,
}: {
  isPending: boolean;
  isError: boolean;
  available: Service[];
  locale: Locale;
  selected: Set<number>;
  onToggle: (id: number) => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation();

  if (isPending) return <PickerSkeleton />;
  if (isError) return <PickerError onRetry={onRetry} />;
  if (available.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{t('services.add.empty')}</p>
    );
  }

  return (
    <>
      {available.map((service) => (
        <ServiceOption
          key={service.id}
          name={localizedName(service.nameAr, service.nameEn, locale)}
          checked={selected.has(service.id)}
          onToggle={() => onToggle(service.id)}
        />
      ))}
    </>
  );
}

function PickerSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-muted h-12 animate-pulse rounded-xl" />
      ))}
    </div>
  );
}

function PickerError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-muted-foreground text-sm">{t('services.add.error')}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        {t('services.error.retry')}
      </Button>
    </div>
  );
}

function ServiceOption({
  name,
  checked,
  onToggle,
}: {
  name: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="accent-primary size-4 shrink-0"
      />
      <span className="text-foreground text-start text-sm font-medium">{name}</span>
    </label>
  );
}
