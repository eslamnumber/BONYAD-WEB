import { Skeleton } from '@/components/ui';

/** Loading placeholder mirroring the hero + 3 stat tiles + invite form layout. */
export function ReferralSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8" aria-hidden>
      <Skeleton className="h-44 w-full rounded-3xl" />
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
