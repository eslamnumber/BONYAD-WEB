'use client';

import { Camera, Loader2 } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { Toast } from '@/components/feedback/toast';

import { useAvatarUpload } from './use-avatar-upload';

const K = 'profile.identity.photo';

type Tone = 'light' | 'default';

type Props = {
  name?: string;
  src?: string;
  /** Avatar sizing / ring classes — set by the host card. */
  className?: string;
  /** Camera badge palette: `light` for the dark identity banner, default for cards. */
  tone?: Tone;
};

const BADGE_TONE: Record<Tone, string> = {
  light: 'bg-white/90 text-primary ring-primary',
  default: 'bg-primary text-primary-foreground ring-card',
};

/** Camera / spinner affordance pinned to the avatar's inline-end corner. */
function CameraBadge({ tone, busy }: { tone: Tone; busy: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute end-0 bottom-0 flex size-7 items-center justify-center rounded-full shadow-sm ring-2 transition-transform motion-safe:group-hover:scale-110 ${BADGE_TONE[tone]}`}
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
    </span>
  );
}

/**
 * Avatar that doubles as the change-photo control. The whole avatar is one button
 * (a comfortably large touch target) with a camera badge at the inline-end corner;
 * clicking opens a hidden file picker, the image is validated + uploaded (see
 * {@link useAvatarUpload}), and on success every avatar re-reads the new image and a
 * top-of-screen {@link Toast} confirms it. Validation/network errors sit inline; the
 * button is icon-only so it carries an `aria-label` (rule 13).
 */
export function EditableAvatar({ name, src, className, tone = 'default' }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { onPick, isPending, error, updated, dismissUpdated } = useAvatarUpload();

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        aria-label={t(`${K}.change`)}
        aria-busy={isPending}
        className="focus-visible:outline-ring group relative rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Avatar name={name} src={src} className={className} />
        <CameraBadge tone={tone} busy={isPending} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={onPick}
      />
      {error ? (
        <p dir="auto" role="alert" className="text-destructive text-start text-xs font-medium">
          {error}
        </p>
      ) : null}
      <Toast open={updated} message={t(`${K}.updated`)} onClose={dismissUpdated} />
    </div>
  );
}
