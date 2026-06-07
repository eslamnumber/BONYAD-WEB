import { beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import { JobOfferBreadcrumb } from './job-offer-breadcrumb';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('JobOfferBreadcrumb', () => {
  it('renders the current page and a link back to the job-offers list', () => {
    renderWithProviders(<JobOfferBreadcrumb />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('Project details')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Job offers' })).toHaveAttribute('href', '/dashboard');
  });

  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(<JobOfferBreadcrumb />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
