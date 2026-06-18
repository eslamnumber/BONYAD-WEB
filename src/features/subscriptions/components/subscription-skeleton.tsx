import { Skeleton } from '@/components/ui';

const CARD = 'bg-card border-border flex flex-col gap-5 rounded-2xl border p-5 shadow-sm sm:p-6';
const CELLS = ['a', 'b', 'c', 'd'];

function CellSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {CELLS.map((id) => (
        <div key={id} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

/** Loading placeholder shaped like the active card + bid-usage card. */
export function SubscriptionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className={CARD}>
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-px w-full" />
        <CellSkeletons />
      </div>
      <div className={CARD}>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-2 w-full rounded-full" />
        <CellSkeletons />
      </div>
    </div>
  );
}
