import { beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import type { Project } from '../schemas/project';

import { JobOfferItem } from './job-offer-item';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

const PROJECT: Project = {
  id: 1,
  serviceNameEn: 'Renovation',
  title: 'Update admin building facade',
  description: 'A contractor is needed to renovate the exterior facade.',
  budget: 200000,
  address: 'Jeddah, Al Safa',
  timeRequiredDays: 84,
  bidsCloseAt: new Date(Date.now() + 10 * 86_400_000).toISOString(),
  status: 'PENDING',
};

describe('JobOfferItem', () => {
  it('renders the category badge, title, description, deadline and meta', () => {
    renderWithProviders(<JobOfferItem project={PROJECT} />);
    expect(screen.getByText('Renovation')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /update admin building facade/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/a contractor is needed/i)).toBeInTheDocument();
    expect(screen.getByText(/project duration: 12 weeks/i)).toBeInTheDocument();
    expect(screen.getByText(/budget: 200k/i)).toBeInTheDocument();
    expect(screen.getByText(/10 days left/i)).toBeInTheDocument();
  });

  it('falls back to a generic title + service badge, hides absent deadline/budget', () => {
    renderWithProviders(<JobOfferItem project={{ id: 2, description: 'No category here.' }} />);
    expect(screen.getByRole('heading', { name: /^project$/i })).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.queryByText(/days left/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/budget:/i)).not.toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(<JobOfferItem project={PROJECT} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
