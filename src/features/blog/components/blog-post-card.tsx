import Link from 'next/link';

import { pickBadgeClasses } from './badge-color';
import { type BlogCardVM } from './blog-card-vm';

type BlogPostCardProps = { card: BlogCardVM };

export function BlogPostCard({ card }: BlogPostCardProps) {
  return (
    <Link
      href={card.href}
      className="group bg-card border-border flex h-full w-full flex-col gap-4 overflow-hidden rounded-[4px] border p-4 transition-shadow duration-200 motion-safe:hover:shadow-sm"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[2px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.imageSrc}
          alt={card.title}
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <div className="flex w-full flex-1 flex-col items-end gap-4 p-2 text-end">
        <span
          className={`inline-flex items-center justify-center rounded-full px-[10px] py-1 text-base font-bold ${pickBadgeClasses(card.badgeTag)}`}
        >
          {card.badgeLabel}
        </span>
        <h3 className="text-foreground w-full text-2xl leading-7 font-medium">{card.title}</h3>
        {card.summary ? (
          <p className="text-foreground/60 w-full text-base">{card.summary}</p>
        ) : null}
      </div>
    </Link>
  );
}
