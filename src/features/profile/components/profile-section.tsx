import Link from 'next/link';
import { type ComponentType, type ReactNode, type SVGProps } from 'react';

import { ChevronLeftIcon } from '@/components/icons';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type Tone = 'default' | 'danger';

const CHIP: Record<Tone, string> = {
  default: 'bg-primary/10 text-primary',
  danger: 'bg-destructive/10 text-destructive',
};

/** Labelled card grouping a set of rows (account / preferences / danger zone). */
export function ProfileSection({
  label,
  tone = 'default',
  className,
  children,
}: {
  label: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <h2
        className={`mb-2.5 px-1 text-end text-xs font-medium tracking-wide ${tone === 'danger' ? 'text-destructive' : 'text-muted-foreground'}`}
      >
        {label}
      </h2>
      <div
        className={`bg-card divide-border divide-y rounded-2xl border shadow-sm ${tone === 'danger' ? 'border-destructive/40' : 'border-border'}`}
      >
        {children}
      </div>
    </section>
  );
}

/** Visual row: leading icon chip + title/subtitle + a trailing slot. */
export function ProfileRowShell({
  Icon,
  title,
  subtitle,
  trailing,
  tone = 'default',
}: {
  Icon: IconComponent;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {trailing}
      <span className="min-w-0 flex-1">
        <span
          className={`block text-end text-sm font-medium ${tone === 'danger' ? 'text-destructive' : 'text-foreground'}`}
        >
          {title}
        </span>
        {subtitle ? (
          <span className="text-muted-foreground mt-0.5 block text-end text-xs">{subtitle}</span>
        ) : null}
      </span>
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${CHIP[tone]}`}
      >
        <Icon className="size-5" aria-hidden />
      </span>
    </div>
  );
}

/**
 * Intentionally non-interactive row — the same shell, greyed out, with no drill-in
 * chevron and no Link, so the entry stays visible but can't be opened.
 */
export function ProfileDisabledRow({
  Icon,
  title,
  subtitle,
  tone,
}: {
  Icon: IconComponent;
  title: string;
  subtitle?: string;
  tone?: Tone;
}) {
  return (
    <div aria-disabled className="block cursor-not-allowed rounded-xl opacity-60">
      <ProfileRowShell Icon={Icon} title={title} subtitle={subtitle} tone={tone} />
    </div>
  );
}

/** Navigation row — wraps the shell in a Link with a forward (drill-in) chevron. */
export function ProfileLinkRow({
  href,
  Icon,
  title,
  subtitle,
  tone,
}: {
  href: string;
  Icon: IconComponent;
  title: string;
  subtitle?: string;
  tone?: Tone;
}) {
  return (
    <Link
      href={href}
      className="focus-visible:outline-ring motion-safe:hover:bg-muted/60 block rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <ProfileRowShell
        Icon={Icon}
        title={title}
        subtitle={subtitle}
        tone={tone}
        trailing={
          <ChevronLeftIcon
            className="text-muted-foreground/50 size-3 shrink-0 rtl:-scale-x-100"
            aria-hidden
          />
        }
      />
    </Link>
  );
}
