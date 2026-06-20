import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { type ComponentType, type ReactNode, type SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type Tone = 'default' | 'danger';

const TEXT_TONE: Record<Tone, string> = {
  default: 'text-foreground',
  danger: 'text-destructive',
};

/**
 * A titled group — an optional section heading + a single rounded card that
 * divides its rows. Mirrors the Figma "Section Header → Card" structure; the
 * danger group omits the heading. The first group on the page passes `as="h1"`.
 */
export function ProfileSection({
  label,
  as: Heading = 'h2',
  children,
}: {
  label?: string;
  as?: 'h1' | 'h2';
  children: ReactNode;
}) {
  return (
    <section>
      {label ? (
        <Heading className="text-foreground mb-3 px-1 text-end text-lg font-semibold tracking-tight">
          {label}
        </Heading>
      ) : null}
      <div className="bg-card border-border divide-border divide-y rounded-2xl border shadow-sm">
        {children}
      </div>
    </section>
  );
}

/**
 * One profile row — a plain outline icon pinned to the inline-end with its label
 * beside it, and an optional control (value / chevron / toggle / badge) at the
 * inline-start. Single line, 64px tall to match the Figma row. No colored chip.
 */
export function ProfileRowShell({
  Icon,
  label,
  control,
  tone = 'default',
}: {
  Icon: IconComponent;
  label: string;
  control?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="flex min-h-16 items-center gap-3 px-4">
      {control ? <span className="flex shrink-0 items-center gap-2">{control}</span> : null}
      <span className={`min-w-0 flex-1 text-end text-sm font-medium ${TEXT_TONE[tone]}`}>
        {label}
      </span>
      <Icon
        className={`size-5 shrink-0 ${tone === 'danger' ? 'text-destructive' : 'text-muted-foreground'}`}
        aria-hidden
      />
    </div>
  );
}

/** Static info row — label + a trailing value / badge, no navigation. */
export function ProfileInfoRow({
  Icon,
  label,
  control,
}: {
  Icon: IconComponent;
  label: string;
  control: ReactNode;
}) {
  return <ProfileRowShell Icon={Icon} label={label} control={control} />;
}

/** Drill-in chevron pinned to the inline-start (points along the reading flow). */
function DrillChevron() {
  return (
    <ChevronLeft
      className="text-muted-foreground/50 size-4 shrink-0 rtl:-scale-x-100"
      aria-hidden
    />
  );
}

/** Navigation row — wraps the shell in a Link with a drill-in chevron. */
export function ProfileLinkRow({
  href,
  Icon,
  label,
  leading,
  tone,
}: {
  href: string;
  Icon: IconComponent;
  label: string;
  /** Optional node shown next to the chevron at the inline-start (e.g. a value badge). */
  leading?: ReactNode;
  tone?: Tone;
}) {
  return (
    <Link
      href={href}
      className="focus-visible:outline-ring motion-safe:hover:bg-muted/60 block rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <ProfileRowShell
        Icon={Icon}
        label={label}
        tone={tone}
        control={
          <>
            <DrillChevron />
            {leading}
          </>
        }
      />
    </Link>
  );
}

/** Non-interactive (coming-soon) row — greyed, no link, no chevron. */
export function ProfileDisabledRow({
  Icon,
  label,
  tone,
}: {
  Icon: IconComponent;
  label: string;
  tone?: Tone;
}) {
  return (
    <div aria-disabled className="cursor-not-allowed opacity-60">
      <ProfileRowShell Icon={Icon} label={label} tone={tone} />
    </div>
  );
}
