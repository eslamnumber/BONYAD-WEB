export type JsonLdProps = {
  /** schema.org JSON object (e.g. `{ '@context': 'https://schema.org', '@type': 'Organization', ... }`). */
  data: Record<string, unknown> | Record<string, unknown>[];
  /** CSP nonce — pass `await getRequestNonce()` from a Server Component. */
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
export function JsonLd({ data, nonce }: JsonLdProps) {
  const json = JSON.stringify(data);
  const safe = escape(json);
  return (
    <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: safe }} />
  );
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
