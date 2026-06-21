import type { ReactNode } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SketchCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/**
 * One titled section card for the sketch form — a heading, an optional hint, then
 * the control. Keeps the form sections visually consistent.
 */
export function SketchCard({ title, description, children, className }: SketchCardProps) {
  return (
    <Card className={cn('rounded-2xl transition-shadow hover:shadow-md', className)}>
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-base font-semibold">{title}</h2>
          {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
        </div>
        {children}
      </div>
    </Card>
  );
}
