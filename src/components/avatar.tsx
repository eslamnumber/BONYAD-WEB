/**
 * Round user avatar shared across the chat surface (sidebar profile, conversation
 * rows, thread header). Renders the backend profile image as a `background-image`
 * — robust for arbitrary backend hosts (no `next/image` `remotePatterns` entry
 * needed; CSP `img-src https:` covers it) — and falls back to the name's initial
 * when there is none, mirroring the RN chat. Decorative, so `aria-hidden`. The
 * caller sets the diameter via `className` (e.g. `size-12`).
 */
function initialOf(name: string | undefined): string {
  return (name?.trim().charAt(0) || '?').toUpperCase();
}

type Props = {
  name: string | undefined;
  src?: string | null;
  className?: string;
};

export function Avatar({ name, src, className }: Props) {
  return (
    <div
      aria-hidden
      style={src ? { backgroundImage: `url("${encodeURI(src)}")` } : undefined}
      className={`bg-muted text-muted-foreground flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-cover bg-center text-sm font-semibold ${className ?? ''}`}
    >
      {src ? null : initialOf(name)}
    </div>
  );
}
