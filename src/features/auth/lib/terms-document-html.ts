/**
 * Resolved theme colours injected into the sandboxed document. The iframe is an
 * isolated origin (no `allow-same-origin`), so it can't read the app's CSS tokens —
 * the caller reads them off the live theme and passes the computed values here, so
 * the document still traces to Bonyad tokens and follows light/dark automatically.
 */
export type TermsDocColors = {
  surface: string;
  text: string;
  muted: string;
  border: string;
  link: string;
  heading: string;
};

type BuildArgs = {
  /** The backend HTML body for the active language. */
  bodyHtml: string;
  /** Intrinsic document direction (follows the content language, not the UI mapping). */
  dir: 'ltr' | 'rtl';
  /** Document language tag. */
  lang: 'ar' | 'en';
  colors: TermsDocColors;
};

/**
 * "Paper document" stylesheet for the contract viewer. No fonts are loaded inside
 * the isolated frame (a system stack covers Latin + Arabic); links are rendered but
 * made inert (`pointer-events:none`) on top of the sandbox already blocking
 * navigation — a belt-and-braces version of the iOS locked-down WKWebView.
 */
function documentCss(c: TermsDocColors): string {
  return [
    '*{box-sizing:border-box}',
    'html,body{margin:0}',
    `body{background:${c.surface};color:${c.text};`,
    "font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans Arabic',sans-serif;",
    'font-size:15px;line-height:1.75;padding:4px 2px;-webkit-text-size-adjust:100%}',
    `h1,h2,h3,h4{color:${c.heading};line-height:1.3;font-weight:600;margin:1.5em 0 .6em}`,
    'h1{font-size:1.35rem}h2{font-size:1.15rem}h3{font-size:1.02rem}',
    'p,li{margin:0 0 .9em}ul,ol{padding-inline-start:1.4em;margin:0 0 .9em}',
    `a{color:${c.link};text-decoration:underline;pointer-events:none}`,
    'img{max-width:100%;height:auto}strong,b{font-weight:600}',
    `small,.muted{color:${c.muted}}`,
    `hr{border:0;border-top:1px solid ${c.border};margin:1.6em 0}`,
    'table{border-collapse:collapse;width:100%;margin:0 0 1em}',
    `td,th{border:1px solid ${c.border};padding:6px 8px;text-align:start}`,
    'body>:first-child{margin-top:0}body>:last-child{margin-bottom:0}',
  ].join('');
}

/**
 * Wrap a backend Terms HTML body into a complete, self-contained document for an
 * isolated sandboxed iframe (`srcDoc`). The body HTML is first-party (Bonyad
 * admin-authored) but still rendered with no script execution — the sandbox blocks
 * scripts, same-origin, and top-navigation; the CSP nonce-less `script-src` blocks
 * inline scripts as a second layer.
 */
export function buildTermsDocument({ bodyHtml, dir, lang, colors }: BuildArgs): string {
  return (
    `<!doctype html><html lang="${lang}" dir="${dir}"><head>` +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    `<style>${documentCss(colors)}</style>` +
    `</head><body>${bodyHtml}</body></html>`
  );
}
