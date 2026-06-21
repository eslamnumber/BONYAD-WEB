'use client';

import { useEffect } from 'react';

import { resolveWidgetHost, widgetScriptUrl } from '../../lib/hyperpay-widget';

type WpwlGlobal = { wpwlOptions?: unknown };

/**
 * Mount the OPP COPYandPAY widget: set `wpwlOptions` (locale), inject
 * `paymentWidgets.js` from the mode-resolved host, and clean up the script + the nodes
 * it injects on unmount. The script is added by our (nonce-trusted) bundle → allowed
 * under the prod CSP `strict-dynamic`; the `/payment` route also allow-lists
 * `*.oppwa.com` for connect/style/font/frame (see `src/middleware.ts`).
 */
export function useHyperPayWidget(
  checkoutId: string | null,
  mode: string | null,
  locale: string,
): void {
  useEffect(() => {
    if (!checkoutId) return;
    const w = window as unknown as WpwlGlobal;
    // `plain` renders bare fields we fully theme via `payment-widget.css` (vs the
    // OPP `card` preset). RTL follows the locale.
    w.wpwlOptions = { locale: locale.startsWith('ar') ? 'ar' : 'en', style: 'plain' };
    const script = document.createElement('script');
    script.src = widgetScriptUrl(resolveWidgetHost(mode), checkoutId);
    script.async = true;
    // Guarded so a non-DOM/SSR-ish environment that can't load the external script
    // (e.g. happy-dom under test) doesn't throw out of the effect.
    try {
      document.body.appendChild(script);
    } catch {
      /* script injection unavailable — nothing to mount. */
    }
    return () => {
      script.remove();
      delete w.wpwlOptions;
      document.querySelectorAll('[class^="wpwl-"]').forEach((node) => node.remove());
    };
  }, [checkoutId, mode, locale]);
}
