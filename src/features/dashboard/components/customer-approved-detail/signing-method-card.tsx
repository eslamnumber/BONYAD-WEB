'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MailIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { type ProjectDetail } from '../../schemas/project';
import { type ProjectPhase } from '../../schemas/project-phase';

import { ReviewPhasesModal } from './review-phases-modal';
import { SigningMethodOption } from './signing-method-option';

const METHODS = ['email', 'nafath', 'absher'] as const;
type Method = (typeof METHODS)[number];

type Props = { project: ProjectDetail; phases: ProjectPhase[] };

/**
 * "Choose signing method" card (Figma node 1485:8810) — the left column of the
 * customer's APPROVED screen. A radio group of three methods (email is wired to
 * /signatures; Nafath/Absher are selectable but route through the same flow until
 * their endpoints ship), an info note, then two CTAs: "Approve phases" opens the
 * review-phases modal (which runs approve-all + signatures), "Request modification"
 * deep-links to the chat with the assigned provider.
 */
export function SigningMethodCard({ project, phases }: Props) {
  const [method, setMethod] = useState<Method>('email');
  const [reviewOpen, setReviewOpen] = useState(false);

  const technicianId = project.assignedTechnicianId;
  const modifyHref =
    typeof technicianId === 'number'
      ? ROUTES.DASHBOARD_MESSAGE_FOR(technicianId, { projectId: project.id })
      : ROUTES.DASHBOARD_MESSAGES;

  return (
    <section className="bg-card border-border flex w-full flex-col gap-6 rounded-xl border p-8 shadow-[0px_4px_10px_rgba(0,0,0,0.03)]">
      <Header />
      <MethodOptions method={method} onSelect={setMethod} />
      <Note />
      <CardActions onApprove={() => setReviewOpen(true)} modifyHref={modifyHref} />
      <ReviewPhasesModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        project={project}
        phases={phases}
      />
    </section>
  );
}

function Header() {
  const { t } = useTranslation();
  return (
    <header className="flex w-full flex-col items-end gap-2 text-end">
      <h2 className="text-foreground text-2xl font-medium">
        {t('dashboard.customerApproved.signing.title')}
      </h2>
      <p className="text-foreground/60 text-sm">
        {t('dashboard.customerApproved.signing.subtitle')}
      </p>
    </header>
  );
}

function MethodOptions({ method, onSelect }: { method: Method; onSelect: (m: Method) => void }) {
  const { t } = useTranslation();
  return (
    <div
      role="radiogroup"
      aria-label={t('dashboard.customerApproved.signing.methodLabel')}
      className="flex w-full flex-col gap-3"
    >
      {METHODS.map((m) => (
        <SigningMethodOption
          key={m}
          value={m}
          selected={method === m}
          onSelect={(v) => onSelect(v as Method)}
          title={t(`dashboard.customerApproved.signing.${m}.title`)}
          description={t(`dashboard.customerApproved.signing.${m}.desc`)}
        >
          <MethodIcon method={m} />
        </SigningMethodOption>
      ))}
    </div>
  );
}

function Note() {
  const { t } = useTranslation();
  return (
    <p className="bg-info/10 text-info rounded-lg p-3 text-end text-[13px] leading-[1.4]">
      {t('dashboard.customerApproved.signing.note')}
    </p>
  );
}

function CardActions({ onApprove, modifyHref }: { onApprove: () => void; modifyHref: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={onApprove}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring flex w-full items-center justify-center rounded-lg p-3 text-[15px] font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-90"
      >
        {t('dashboard.customerApproved.signing.approve')}
      </button>
      <Link
        href={modifyHref}
        className="border-brand-dark-navy text-brand-dark-navy focus-visible:outline-ring motion-safe:hover:bg-field-surface flex w-full items-center justify-center rounded-lg border p-3 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t('dashboard.customerApproved.signing.requestModification')}
      </Link>
    </div>
  );
}

/** Per-method icon: the email glyph (currentColor) or a brand logo (logos never mirror). */
function MethodIcon({ method }: { method: Method }) {
  if (method === 'email') {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg">
        <MailIcon className="text-brand-dark-navy size-6" aria-hidden />
      </span>
    );
  }
  const src = method === 'nafath' ? '/images/signing/nafath.png' : '/images/signing/absher.jpg';
  return (
    <span className="bg-field-surface flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg">
      <Image src={src} alt="" width={44} height={44} className="size-full object-contain p-1.5" />
    </span>
  );
}
