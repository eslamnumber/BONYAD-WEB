import { type ReactNode } from 'react';

/** Full-height centered status line for the job-offer detail loading / error / empty states. */
export function JobOfferStatus({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-1 items-center justify-center px-4 py-12">
      <p className="text-foreground/60 text-base" dir="auto">
        {children}
      </p>
    </div>
  );
}
