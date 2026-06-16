import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { ROUTES } from '@/config/routes';
import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { renderWithProviders, screen } from '@/testing/render';

import { CustomerWelcomeHero } from './customer-welcome-hero';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('CustomerWelcomeHero', () => {
  it('greets the user by first name only', () => {
    useAuthStore.setState({
      user: { id: 1, role: 'USER', name: 'Ibrahim Saleh' },
      isAuthenticated: true,
    });
    renderWithProviders(<CustomerWelcomeHero />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Welcome, Ibrahim!');
    expect(heading).toHaveTextContent("Let's start creating your first project.");
  });

  it('falls back to a name-less greeting when the user has no name', () => {
    useAuthStore.setState({ user: { id: 1, role: 'USER' }, isAuthenticated: true });
    renderWithProviders(<CustomerWelcomeHero />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Welcome!');
    expect(heading).not.toHaveTextContent('Welcome,');
  });

  it('links the CTAs to the projects + how-it-works routes', () => {
    renderWithProviders(<CustomerWelcomeHero />);

    expect(screen.getByRole('link', { name: 'Start your project now' })).toHaveAttribute(
      'href',
      ROUTES.DASHBOARD_PROJECTS,
    );
    expect(screen.getByRole('link', { name: 'How does the platform work?' })).toHaveAttribute(
      'href',
      ROUTES.HOW_IT_WORKS,
    );
  });

  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(<CustomerWelcomeHero />);
    // `region` disabled: the landmark wrapper is supplied by the page, not this leaf.
    expect(await axe(container, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
