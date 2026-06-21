'use client';

import { useMemo } from 'react';

import { buildSvgDocument } from '../../lib/build-svg-document';

type Props = { svg: string; title: string };

/**
 * Render a backend floor-plan SVG inside a `sandbox=""` iframe (no scripts, no
 * same-origin) — the safe way to show untrusted markup. The plan sits on white
 * regardless of theme (architectural plans are white documents).
 *
 * `pointer-events-none` is essential: this frame fills the variant's select
 * `<button>`, and an iframe is its own browsing context that would otherwise
 * swallow the tap — leaving the design un-selectable (so the 3D build never
 * unlocks). With pointer events off, the tap passes through to the button.
 */
export function SvgFloorFrame({ svg, title }: Props) {
  const srcDoc = useMemo(() => buildSvgDocument(svg), [svg]);
  return (
    <iframe
      title={title}
      srcDoc={srcDoc}
      sandbox=""
      loading="lazy"
      className="pointer-events-none h-full w-full border-0 bg-white"
    />
  );
}
