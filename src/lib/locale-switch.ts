import { LOCALE_COOKIE_NAME } from '@/config/constants';
import { i18n } from '@/lib/i18n';
import { LOCALE_DIRECTION, LOCALE_TAG, type Locale } from '@/types/locale';

type ViewTransitionDoc = {
  startViewTransition?: (callback: () => void) => { finished: Promise<unknown> };
};

/**
 * Switch the UI locale with an animated direction flip — the single source for
 * every language toggle (header, sidebar menu, profile screen).
 *
 * `<html dir>` is normally set server-side, so a plain refresh flips the layout
 * abruptly. Here we apply `dir` / `lang` / i18n / cookie **synchronously inside a
 * View Transition** so the browser tweens the layout mirror: the sidebar slides
 * to the opposite edge and the content re-anchors. Then we refresh the RSC tree
 * for any server-rendered copy. Progressive enhancement — no View Transitions
 * support (Firefox) or `prefers-reduced-motion` → applies instantly, same end
 * state. See docs/i18n-and-rtl.md §Direction mapping.
 */
export function switchLocale(next: Locale, refresh: () => void): void {
  const apply = () => {
    const root = document.documentElement;
    // Push direction for the View Transition (CSS reads `data-locale-shift`).
    root.dataset.localeShift = LOCALE_DIRECTION[next];
    root.dir = LOCALE_DIRECTION[next];
    root.lang = LOCALE_TAG[next];
    void i18n.changeLanguage(next);
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  };

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const start = (document as unknown as ViewTransitionDoc).startViewTransition;

  if (start && !prefersReduced) {
    start.call(document, apply).finished.finally(() => {
      // Marker is for the transition only — clear it so a later theme switch
      // doesn't match the locale push animation.
      delete document.documentElement.dataset.localeShift;
      refresh();
    });
  } else {
    apply();
    refresh();
  }
}
