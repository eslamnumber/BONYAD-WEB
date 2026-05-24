// Deterministic mapping from a free-text tag to one of the three semantic
// badge color tokens defined in tokens.css. The Figma frame shows three
// editorial categories (finishing / legal / AC); the backend's `tags[]` is
// free-form so we hash the tag string to a stable color slot.

const VARIANTS = ['finish', 'legal', 'ac'] as const;
type Variant = (typeof VARIANTS)[number];

const CLASSES: Record<Variant, string> = {
  finish: 'bg-badge-finish-soft text-badge-finish',
  legal: 'bg-badge-legal-soft text-badge-legal',
  ac: 'bg-badge-ac-soft text-badge-ac',
};

function pickVariant(tag: string | undefined): Variant {
  if (!tag) return 'finish';
  let h = 0;
  for (let i = 0; i < tag.length; i++) {
    h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return VARIANTS[h % VARIANTS.length] as Variant;
}

export function pickBadgeClasses(tag: string | undefined): string {
  return CLASSES[pickVariant(tag)];
}
