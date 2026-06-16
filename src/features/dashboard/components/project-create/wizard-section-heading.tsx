const WEAK_EDGE = /^[?.!:،؟]|[?.!:،؟]$/;

/**
 * A static label (no weak punctuation) follows the document direction with
 * `text-end`; punctuated/translated body copy gets `dir="auto"` + `text-start`
 * so the trailing `؟`/`.` stays attached and it lands on the same physical side
 * as the heading under the inverted en→rtl mapping (docs/i18n-and-rtl.md §bidi).
 */
function bidi(text: string): { dir?: 'auto'; align: string } {
  return WEAK_EDGE.test(text.trim()) ? { dir: 'auto', align: 'text-start' } : { align: 'text-end' };
}

type Props = { title: string; description?: string };

/** Per-step section heading (Figma 1394:7055 / 7670): 24px title + optional 14px description. */
export function WizardSectionHeading({ title, description }: Props) {
  const desc = description ? bidi(description) : undefined;
  return (
    <div className="flex w-full flex-col items-end gap-2">
      <h2 className="text-foreground w-full text-end text-2xl font-medium">{title}</h2>
      {description && desc ? (
        <p dir={desc.dir} className={`text-foreground/60 w-full text-sm ${desc.align}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
