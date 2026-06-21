import { describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import { TextPanel } from './change-request-action-panels';

const noop = vi.fn();

function renderRespond() {
  renderWithProviders(
    <TextPanel
      kind="respond"
      value=""
      onChange={noop}
      onCancel={noop}
      onConfirm={noop}
      pending={false}
      error={null}
    />,
  );
}

/**
 * The reply field uses the locale's *writing* direction, not `dir="auto"`.
 * `dir="auto"` derives direction from the (empty) value — not the placeholder —
 * so an empty field defaults to LTR, anchoring the Arabic placeholder + caret to
 * the wrong side under the inverted `LOCALE_DIRECTION` (ar → `<html dir="ltr">`).
 */
describe('TextPanel — reply field direction', () => {
  it('writes rtl in ar so the Arabic placeholder + caret anchor to the right', async () => {
    await i18n.changeLanguage('ar');
    renderRespond();
    expect(screen.getByPlaceholderText('ردّك…')).toHaveAttribute('dir', 'rtl');
  });

  it('writes ltr in en', async () => {
    await i18n.changeLanguage('en');
    renderRespond();
    expect(screen.getByPlaceholderText('Your reply…')).toHaveAttribute('dir', 'ltr');
  });
});
