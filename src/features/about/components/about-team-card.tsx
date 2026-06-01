import Image from 'next/image';

type Props = { name: string; role: string };

/**
 * Figma 654:4748 — one Team member card.
 * Photo image-fill under a full-card frosted-glass overlay (backdrop-blur; the Figma's
 * rgba(255,255,255,0.01) tint is imperceptible, so the effect is the blur alone), with the
 * name + role anchored to the lower area in white. Aspect 305:428 kept; width is responsive.
 */
export function AboutTeamCard({ name, role }: Props) {
  return (
    <figure className="relative aspect-[305/428] w-full max-w-[305px] overflow-hidden rounded-xl">
      <Image
        src="/images/team/member-placeholder.jpg"
        alt=""
        fill
        sizes="(min-width: 1024px) 305px, (min-width: 640px) 45vw, 90vw"
        className="object-cover"
      />
      <div aria-hidden className="absolute inset-0 backdrop-blur-[40px]" />
      <figcaption className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-4 px-4 text-center">
        <span dir="auto" className="text-2xl font-medium text-white">
          {name}
        </span>
        <span dir="auto" className="text-sm text-white/80">
          {role}
        </span>
      </figcaption>
    </figure>
  );
}
