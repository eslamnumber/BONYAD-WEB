export type JsonLdProps = {
  /** schema.org JSON object (e.g. `{ '@context': 'https://schema.org', '@type': 'Organization', ... }`). */
  data: Record<string, unknown> | Record<string, unknown>[];
  /**
   * @deprecated Not applied. A `<script type="application/ld+json">` is a data
   * block, not executable JS, so CSP `script-src` does not govern it and it needs
   * no nonce. Rendering one caused a hydration mismatch once the CSP middleware
   * went live (browsers strip the `nonce` attribute after parse). Kept optional
   * so existing call sites compile; safe to drop from callers later.
   */
  nonce?: string;
};

/**
 * Renders a `<script type="application/ld+json">` tag with HTML-escaped JSON content.
 *
 * Why the escape pass:
 *   `JSON.stringify` alone is unsafe inside a `<script>` tag. A field containing
 *   `</script>` (or HTML special chars) would break out of the script and become
 *   live HTML — i.e. stored XSS via any user-controlled field (technician bio,
 *   blog content, review text).
 *
 * See docs/security-headers.md + docs/seo-and-ai-readability.md.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data);
  const safe = escape(json);
  // No `nonce`: a JSON-LD data block is not executable JS, so CSP `script-src`
  // does not apply. Emitting a nonce here only created a server/client hydration
  // mismatch (the browser strips the attribute after parse).
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safe }} />;
}

// Unicode line + paragraph separators are constructed via `new RegExp` so the
// raw U+2028 / U+2029 characters never appear in source — JS engines treat
// those as line terminators inside regex literals, which breaks parsing.
const LINE_SEPARATOR_RE = new RegExp('\\u2028', 'g');
const PARAGRAPH_SEPARATOR_RE = new RegExp('\\u2029', 'g');

function escape(s: string): string {
  return s
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LINE_SEPARATOR_RE, '\\u2028')
    .replace(PARAGRAPH_SEPARATOR_RE, '\\u2029');
}
