import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/testing/render';

import { JsonLd } from './json-ld';

describe('JsonLd', () => {
  it('renders a <script type="application/ld+json"> tag', () => {
    const { container } = renderWithProviders(
      <JsonLd
        data={{ '@context': 'https://schema.org', '@type': 'Organization', name: 'Bonyad' }}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it('forwards the CSP nonce attribute', () => {
    const { container } = renderWithProviders(<JsonLd data={{}} nonce="test-nonce-abc" />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.getAttribute('nonce')).toBe('test-nonce-abc');
  });

  it('HTML-escapes a </script> sequence inside string content (XSS guard)', () => {
    const evil = { description: '</script><script>alert(1)</script>' };
    const { container } = renderWithProviders(<JsonLd data={evil} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const html = script?.innerHTML ?? '';
    // Raw `</script>` must NEVER appear inside the script body.
    expect(html).not.toContain('</script>');
    // The < and > must be encoded as < / >.
    expect(html).toContain('\\u003c/script');
  });

  it('HTML-escapes ampersands', () => {
    const data = { name: 'A & B' };
    const { container } = renderWithProviders(<JsonLd data={data} />);
    const html = container.querySelector('script[type="application/ld+json"]')?.innerHTML ?? '';
    expect(html).not.toContain(' & ');
    expect(html).toContain('\\u0026');
  });
});
