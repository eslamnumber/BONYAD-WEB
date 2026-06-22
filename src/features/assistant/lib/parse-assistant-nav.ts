import { resolveNavTarget } from './assistant-nav-map';

/**
 * A piece of a bot reply: either plain text or an in-app navigation link parsed out
 * of an `[NAV:token]` / `[NAV:token:param]` marker (RN `aiChatBotService` syntax).
 */
export type NavSegment =
  | { type: 'text'; value: string }
  | { type: 'nav'; href: string; labelKey: string; param?: string };

/** `[NAV:screenName]` or `[NAV:screenName:params]` — case-insensitive, dots/slashes allowed. */
const NAV_RE = /\[\s*NAV\s*:\s*([\w./-]+)(?::([^\]]+))?\]/gi;

/**
 * Split a reply into text + link segments. Recognised tokens become `nav` segments
 * (rendered as real in-app links); unrecognised markers are stripped to nothing so a
 * raw `[NAV:foo]` never leaks into the UI and no broken link is shown. A reply with
 * no markers returns a single text segment.
 */
export function parseAssistantNav(text: string): NavSegment[] {
  const segments: NavSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(NAV_RE)) {
    const [full, rawToken, param] = match;
    const start = match.index ?? 0;
    if (start > lastIndex) segments.push({ type: 'text', value: text.slice(lastIndex, start) });

    const target = rawToken ? resolveNavTarget(rawToken) : null;
    if (target) {
      segments.push({
        type: 'nav',
        href: target.href,
        labelKey: target.labelKey,
        ...(param?.trim() ? { param: param.trim() } : {}),
      });
    }
    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) segments.push({ type: 'text', value: text.slice(lastIndex) });
  return segments;
}

/** Convenience: does this reply contain at least one resolvable in-app link? */
export function hasNavLink(segments: NavSegment[]): boolean {
  return segments.some((s) => s.type === 'nav');
}
