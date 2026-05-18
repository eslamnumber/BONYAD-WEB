import { type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn('bg-muted rounded-md motion-safe:animate-pulse', className)}
      {...props}
    />
  );
}
