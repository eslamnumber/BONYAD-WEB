import { Check } from 'lucide-react';

/** The rounded check indicator shared by the category select control and the subcategory
 *  chip — decorative (`aria-hidden`); the surrounding button carries the pressed state. */
export function SelectionBox({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
      }`}
    >
      {selected ? <Check className="size-3.5" /> : null}
    </span>
  );
}
