'use client';

import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { Button, Input, Modal, ModalHeader } from '@/components/ui';

import { useHireableTechnicians, useHireSupervisor } from '../../api';
import type { HireableTechnician } from '../../schemas/supervisor';

/** Match a technician against the search box (name / company / phone), like the iOS picker. */
function matches(tech: HireableTechnician, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [tech.name, tech.companyName, tech.phoneNumber].some((v) =>
    (v ?? '').toLowerCase().includes(needle),
  );
}

/**
 * The customer's "hire a supervisor" picker (iOS `HireSupervisorPickerView`, original
 * web design). Lists hireable technicians (search by name/company/phone) and hires the
 * chosen one (POST /projects/:id/supervisor). On success the modal closes and the
 * projects list refetches (the row flips to "pending"). Inherits the document
 * direction (the customer flow uses the inverted map — no `dir` override).
 */
export function HireSupervisorModal({
  projectId,
  onClose,
}: {
  projectId: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const [query, setQuery] = useState('');
  const { data, isPending, isError } = useHireableTechnicians(true);
  const hire = useHireSupervisor();
  const list = (data ?? []).filter((tech) => matches(tech, query));
  const onHire = (technicianId: number) =>
    hire.mutate({ projectId, technicianId }, { onSuccess: onClose });

  return (
    <Modal open onClose={onClose} labelledBy={titleId} className="max-w-[520px]">
      <ModalHeader
        titleId={titleId}
        title={t('dashboard.supervision.customer.picker.title')}
        closeLabel={t('common.close')}
        onClose={onClose}
      />
      <div className="flex flex-col gap-4 p-6">
        <p dir="auto" className="text-muted-foreground text-start text-sm leading-6">
          {t('dashboard.supervision.customer.picker.subtitle')}
        </p>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('dashboard.supervision.customer.picker.search')}
          aria-label={t('dashboard.supervision.customer.picker.search')}
          className="text-end"
        />
        {hire.isError ? (
          <p role="alert" className="text-destructive text-end text-sm">
            {t('dashboard.supervision.customer.picker.error')}
          </p>
        ) : null}
        <PickerBody
          list={list}
          isPending={isPending}
          isError={isError}
          onHire={onHire}
          hiringId={hire.isPending ? hire.variables?.technicianId : undefined}
        />
      </div>
    </Modal>
  );
}

type BodyProps = {
  list: HireableTechnician[];
  isPending: boolean;
  isError: boolean;
  onHire: (id: number) => void;
  hiringId: number | undefined;
};

function PickerBody({ list, isPending, isError, onHire, hiringId }: BodyProps) {
  const { t } = useTranslation();
  if (isPending) return <LoadingState label={t('common.loading')} />;
  if (isError) {
    return (
      <ErrorState
        title={t('dashboard.supervision.customer.picker.loadError.title')}
        description={t('dashboard.supervision.customer.picker.loadError.body')}
      />
    );
  }
  if (list.length === 0) {
    return <EmptyState title={t('dashboard.supervision.customer.picker.empty')} />;
  }
  return (
    <ul className="flex max-h-[22rem] flex-col gap-2 overflow-y-auto">
      {list.map((tech) => (
        <TechnicianRow
          key={tech.id}
          tech={tech}
          onHire={onHire}
          busy={hiringId !== undefined}
          hiring={hiringId === tech.id}
        />
      ))}
    </ul>
  );
}

function TechnicianRow({
  tech,
  onHire,
  busy,
  hiring,
}: {
  tech: HireableTechnician;
  onHire: (id: number) => void;
  busy: boolean;
  hiring: boolean;
}) {
  const { t } = useTranslation();
  const displayName =
    tech.companyName || tech.name || t('dashboard.supervision.bids.unknownTechnician');
  return (
    <li className="border-border flex items-center justify-between gap-3 rounded-xl border p-3">
      <Button variant="outline" size="sm" disabled={busy} onClick={() => onHire(tech.id)}>
        {hiring
          ? t('dashboard.supervision.customer.picker.hiring')
          : t('dashboard.supervision.customer.picker.hireAction')}
      </Button>
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex min-w-0 flex-col items-end gap-0.5">
          <span className="text-foreground max-w-[12rem] truncate text-sm font-semibold">
            <bdi>{displayName}</bdi>
          </span>
          {tech.phoneNumber ? (
            <span className="text-muted-foreground text-xs">
              <bdi>{tech.phoneNumber}</bdi>
            </span>
          ) : null}
        </div>
        <Avatar name={displayName} src={tech.profileImage ?? undefined} className="size-10" />
      </div>
    </li>
  );
}
