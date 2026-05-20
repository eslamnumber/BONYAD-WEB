import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'error';

export function FieldHint({
  children,
  tone = 'neutral',
  id,
}: {
  children: React.ReactNode;
  tone?: Tone;
  id?: string;
}) {
  if (!children) return null;
  return (
    <p
      id={id}
      role={tone === 'error' ? 'alert' : undefined}
      className={cn(
        'text-sm leading-snug',
        tone === 'error' ? 'text-destructive' : 'text-muted-foreground',
      )}
    >
      {children}
    </p>
  );
}
