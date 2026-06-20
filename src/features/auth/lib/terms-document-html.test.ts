import { describe, expect, it } from 'vitest';

import { buildTermsDocument, type TermsDocColors } from './terms-document-html';

const COLORS: TermsDocColors = {
  surface: 'oklch(1 0 0)',
  text: 'oklch(0.14 0 0)',
  muted: 'oklch(0.5 0 0)',
  border: 'oklch(0.92 0 0)',
  link: 'oklch(0.45 0.12 250)',
  heading: 'oklch(0.14 0 0)',
};

describe('buildTermsDocument', () => {
  it('wraps the body in a complete document carrying the content language + direction', () => {
    const html = buildTermsDocument({
      bodyHtml: '<h1>Terms</h1><p>Body.</p>',
      dir: 'ltr',
      lang: 'en',
      colors: COLORS,
    });
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('lang="en"');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('<h1>Terms</h1><p>Body.</p>');
  });

  it('renders Arabic right-to-left and injects the resolved theme colours', () => {
    const html = buildTermsDocument({
      bodyHtml: '<p>نص</p>',
      dir: 'rtl',
      lang: 'ar',
      colors: COLORS,
    });
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('lang="ar"');
    expect(html).toContain(COLORS.surface);
    expect(html).toContain(COLORS.link);
  });

  it('keeps links inert so the document cannot navigate', () => {
    const html = buildTermsDocument({
      bodyHtml: '<a href="x">l</a>',
      dir: 'ltr',
      lang: 'en',
      colors: COLORS,
    });
    expect(html).toMatch(/a\{[^}]*pointer-events:none/);
  });
});
