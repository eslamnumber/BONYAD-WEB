import Image from 'next/image';

import type { BlogAuthor } from '../schemas/blog';

type Props = {
  author: BlogAuthor | undefined;
  avatarUrl: string | undefined;
  avatarFallback: string;
};

function initialsOf(name: string | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function BlogAuthorChip({ author, avatarUrl, avatarFallback }: Props) {
  const name = author?.name ?? '';
  return (
    <div className="flex items-center gap-2">
      <p className="text-muted-foreground text-sm leading-5 font-semibold">{name}</p>
      <div className="bg-muted relative size-7 shrink-0 overflow-hidden rounded-full">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={avatarFallback}
            width={28}
            height={28}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <span
            aria-label={avatarFallback}
            className="text-muted-foreground absolute inset-0 flex items-center justify-center text-xs font-semibold"
          >
            {initialsOf(name)}
          </span>
        )}
      </div>
    </div>
  );
}
