import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { renderWithProviders, screen } from '@/testing/render';

import { HomeBrowse } from './home-browse';

const CARD_TITLES = [
  'Material Supply',
  'Supervision',
  'Property Management',
  'Consultation',
  'Large-Scale Projects',
];

describe('HomeBrowse', () => {
  it('renders the section heading', () => {
    renderWithProviders(<HomeBrowse locale="en" />);
    expect(
      screen.getByRole('heading', { level: 2, name: /Find the right service/i }),
    ).toBeInTheDocument();
  });

  it('renders all 5 service card headings', () => {
    renderWithProviders(<HomeBrowse locale="en" />);
    for (const title of CARD_TITLES) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
    }
  });

  it('renders a "View more" link for each card', () => {
    renderWithProviders(<HomeBrowse locale="en" />);
    expect(screen.getAllByRole('link', { name: 'View more' })).toHaveLength(5);
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<HomeBrowse locale="en" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
