import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names with conflict resolution.
 *
 * Used by every shadcn/ui component. `clsx` handles conditional class names;
 * `tailwind-merge` deduplicates conflicting utilities (e.g. `p-2 p-4` → `p-4`).
 *
 * Example:
 *   <button className={cn('rounded-md p-2', isLarge && 'p-4', className)} />
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
