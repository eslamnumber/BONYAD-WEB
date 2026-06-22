'use client';

import { useTranslation } from 'react-i18next';

import { useMyContracts } from '../api';
import type { MyContract } from '../schemas/my-contract';

/**
 * "العقود" panel on the dashboard — every contract the signed-in user is party to,
 * from GET /contracts/my. Role-agnostic, so the same component renders on both the
 * SP and customer dashboards. RTL-first: content anchors to the inline-end; the
 * project title uses `text-end` (no dir="auto", per job-offer-item) and the
 * technician/meta uses `dir="auto"` spans. Read-only — opening the PDF is a link.
 */
export function ContractsSection() {
  const { t } = useTranslation();
  const { data, isPending, isError } = useMyContracts();
  const contracts = data ?? [];

  return (
    <section className="bg-card border-border flex w-full flex-col items-end gap-5 rounded-2xl border p-5 shadow-sm">
      <h2 className="text-card-foreground w-full text-end text-lg font-semibold">
        {t('dashboard.home.contracts.title')}
      </h2>
      <Body isPending={isPending} isError={isError} contracts={contracts} />
    </section>
  );
}

function Body({
  isPending,
  isError,
  contracts,
}: {
  isPending: boolean;
  isError: boolean;
  contracts: MyContract[];
}) {
  const { t } = useTranslation();
  if (isPending) return <Skeleton />;
  if (isError) {
    return (
      <p className="text-card-foreground/60 w-full py-8 text-center text-sm">
        {t('dashboard.home.contracts.error')}
      </p>
    );
  }
  if (contracts.length === 0) return <Empty />;
  return (
    <ul className="flex w-full flex-col gap-3">
      {contracts.map((contract) => (
        <Row key={contract.id} contract={contract} />
      ))}
    </ul>
  );
}

function Row({ contract }: { contract: MyContract }) {
  const { t } = useTranslation();
  const signed = Boolean(contract.signedAt || contract.signedDocumentUrl);
  const title =
    contract.project?.title ||
    contract.project?.description ||
    t('dashboard.home.contracts.untitled', { id: contract.id });
  const docUrl = contract.signedDocumentUrl || contract.originalDocumentUrl;

  return (
    <li className="border-border flex w-full flex-col gap-3 rounded-xl border p-4">
      <div className="flex w-full items-start gap-3">
        <p className="text-card-foreground min-w-0 flex-1 truncate text-end text-base font-medium">
          {title}
        </p>
        <StatusBadge signed={signed} />
      </div>
      {contract.technician?.name ? (
        <p className="text-card-foreground/60 w-full text-end text-sm" dir="auto">
          {contract.technician.name}
        </p>
      ) : null}
      {docUrl ? (
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-job-accent w-full text-end text-sm font-medium hover:underline"
        >
          {t('dashboard.home.contracts.viewDocument')}
        </a>
      ) : null}
    </li>
  );
}

function StatusBadge({ signed }: { signed: boolean }) {
  const { t } = useTranslation();
  const className = signed
    ? 'bg-status-approved-soft text-status-approved'
    : 'bg-status-progress-soft text-status-progress';
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${className}`}
    >
      {t(`dashboard.home.contracts.status.${signed ? 'signed' : 'pending'}`)}
    </span>
  );
}

function Empty() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col items-center gap-2 py-10 text-center">
      <p className="text-card-foreground text-base font-medium">
        {t('dashboard.home.contracts.empty')}
      </p>
      <p className="text-card-foreground/60 max-w-[360px] text-sm">
        {t('dashboard.home.contracts.emptyHint')}
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex w-full flex-col gap-3" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="bg-muted h-20 w-full animate-pulse rounded-xl" />
      ))}
    </div>
  );
}
