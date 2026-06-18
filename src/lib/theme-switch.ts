import { flushSync } from 'react-dom';

type ViewTransition = { ready: Promise<unknown>; finished: Promise<unknown> };
type ViewTransitionDoc = {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

/**
 * Toggle the theme with an expanding-circle reveal that sweeps **from the
 * bottom-right corner of the screen to the top-left** — the single source for
 * every theme toggle (header, auth header, sidebar menu, profile screen).
 *
 * The new theme is painted on top of the old one and clip-path-revealed as a
 * circle anchored at the bottom-right corner; its radius grows to the full
 * viewport diagonal so the last point reached is the opposite (top-left)
 * corner. Driven inside a View Transition so the snapshot is captured for us;
 * `flushSync` commits next-themes' class change synchronously so the "new"
 * snapshot already reflects the target theme.
 *
 * Progressive enhancement — no View Transitions support (Firefox) or
 * `prefers-reduced-motion` → applies instantly, same end state. The CSS that
 * disables the default cross-fade lives behind `[data-theme-shift]` in
 * globals.css. See docs/theming.md §Animated theme transition.
 */
export function switchTheme(applyTheme: () => void): void {
  const root = document.documentElement;
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const start = (document as unknown as ViewTransitionDoc).startViewTransition;

  if (!start || prefersReduced) {
    applyTheme();
    return;
  }

  // Anchor the reveal at the bottom-right corner; grow to the viewport diagonal
  // so the circle's edge finishes at the top-left corner.
  const x = window.innerWidth;
  const y = window.innerHeight;
  const endRadius = Math.hypot(window.innerWidth, window.innerHeight);

  root.dataset.themeShift = '';
  const transition = start.call(document, () => flushSync(applyTheme));

  transition.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        {
          duration: 600,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      ),
    )
    .catch(() => undefined);

  transition.finished.finally(() => {
    delete root.dataset.themeShift;
  });
}
