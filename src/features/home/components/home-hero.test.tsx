import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { renderWithProviders, screen } from '@/testing/render';

import { HomeHero } from './home-hero';

describe('HomeHero', () => {
  it('renders the main heading with translated text', () => {
    renderWithProviders(<HomeHero locale="en" />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Build your project/i }),
    ).toBeInTheDocument();
  });

  it('renders the primary and secondary CTA links', () => {
    renderWithProviders(<HomeHero locale="en" />);
    expect(screen.getByRole('link', { name: 'Get started' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse services' })).toBeInTheDocument();
  });

  it('renders Arabic heading when locale is ar', () => {
    renderWithProviders(<HomeHero locale="ar" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBeTruthy();
    expect(heading.textContent).not.toBe('home.hero.headline');
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<HomeHero locale="en" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
