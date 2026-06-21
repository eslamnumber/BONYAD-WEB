/**
 * Wrap a backend-provided SVG floor-plan string in a minimal HTML document that
 * scales the plan to fit its frame. Rendered inside a `sandbox=""` iframe (the most
 * restrictive sandbox — no scripts, no same-origin), so the untrusted SVG can never
 * run code or navigate. `<script>` tags are stripped as defence-in-depth. Mirrors
 * the terms-document srcDoc pattern.
 */
export function buildSvgDocument(svg: string): string {
  const safe = svg.replace(/<script[\s\S]*?<\/script\s*>/gi, '');
  const style =
    'html,body{margin:0;height:100%;background:transparent;display:flex;align-items:center;justify-content:center}svg{max-width:100%;max-height:100%;height:auto;width:auto}';
  return `<!doctype html><html><head><meta charset="utf-8"><style>${style}</style></head><body>${safe}</body></html>`;
}
