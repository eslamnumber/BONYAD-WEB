import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import { PaymentWidgetView } from './payment-widget-view';

const nav = vi.hoisted(() => ({ search: '' }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(nav.search),
}));
// The widget hook injects the external paymentWidgets.js (a browser-only side effect);
// stub it so this view test focuses on the rendered form / states.
vi.mock('./use-hyperpay-widget', () => ({ useHyperPayWidget: () => undefined }));

const VALID =
  'checkoutId=CHK_1&mode=TEST&type=phase&projectId=5&phaseId=12&paymentType=FULL&amount=25000';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

beforeEach(() => {
  nav.search = '';
});

describe('PaymentWidgetView', () => {
  it('renders the COPYandPAY mount form pointed back at the project page', () => {
    nav.search = VALID;
    const { container } = renderWithProviders(<PaymentWidgetView />);

    expect(screen.getByRole('heading', { name: 'Secure card payment' })).toBeInTheDocument();
    const form = container.querySelector('form.paymentWidgets');
    expect(form).not.toBeNull();
    expect(form?.getAttribute('data-brands')).toContain('MADA');
    expect(form?.getAttribute('action')).toContain('/dashboard/projects/5');
  });

  it('shows the expired-session state when the checkout context is missing', () => {
    nav.search = '';
    renderWithProviders(<PaymentWidgetView />);
    expect(screen.getByRole('heading', { name: 'Payment session expired' })).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    nav.search = VALID;
    const { container } = renderWithProviders(<PaymentWidgetView />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
