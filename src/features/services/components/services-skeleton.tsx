'use client';

export function ServicesSkeleton() {
  return (
    <div className="bg-card border-border flex flex-col gap-2 rounded-2xl border p-3 shadow-sm">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 rounded-xl p-3">
          <span className="flex items-center gap-3">
            <span className="bg-muted size-5 shrink-0 animate-pulse rounded-full" />
            <span className="bg-muted h-4 w-40 animate-pulse rounded" />
          </span>
          <span className="bg-muted size-8 shrink-0 animate-pulse rounded-lg" />
        </div>
      ))}
    </div>
  );
}
