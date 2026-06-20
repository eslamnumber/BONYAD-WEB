import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { renderWithProviders, screen } from '@/testing/render';

import { ProfileScreen } from './profile-screen';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/settings',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

// Role-filtering is what we assert here; drive it purely from the seeded session
// role (the fetcher itself is covered by get-my-profile.test.ts).
vi.mock('../api', () => ({ useMyProfile: () => ({ data: undefined }) }));

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

function setUser(role: string) {
  useAuthStore.setState({ user: { id: 1, role, name: 'Ahmed' }, isAuthenticated: true });
}

describe('ProfileScreen role-awareness', () => {
  it('hides technician-only rows for a customer (USER)', () => {
    setUser('USER');
    renderWithProviders(<ProfileScreen />);

    expect(screen.getByText('My info')).toBeInTheDocument();
    expect(screen.getByText('Transactions & contracts')).toBeInTheDocument();
    expect(screen.queryByText('My portfolio')).not.toBeInTheDocument();
    expect(screen.queryByText('Services & subscription')).not.toBeInTheDocument();
    expect(screen.queryByText('Account type')).not.toBeInTheDocument();
  });

  it('shows the technician-only rows for a TECHNICIAN', () => {
    setUser('TECHNICIAN');
    renderWithProviders(<ProfileScreen />);

    expect(screen.getByText('My portfolio')).toBeInTheDocument();
    expect(screen.getByText('Services & subscription')).toBeInTheDocument();
    expect(screen.getByText('Account type')).toBeInTheDocument();
  });

  it('keeps not-yet-built rows visible-but-non-clickable, but links the built ones', () => {
    setUser('TECHNICIAN');
    renderWithProviders(<ProfileScreen />);

    // "Services & subscription" has no screen yet → visible label, but not a link.
    expect(screen.getByText('Services & subscription')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Services & subscription/ })).toBeNull();

    // Payment cards + Feedback ship a screen now → they are real navigation links.
    expect(screen.getByRole('link', { name: /Payment cards/ })).toHaveAttribute(
      'href',
      '/dashboard/settings/cards',
    );
    expect(screen.getByRole('link', { name: /Feedback/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /My info/ })).toBeInTheDocument();
  });

  it('renders the three section groups and the always-on controls', () => {
    setUser('USER');
    renderWithProviders(<ProfileScreen />);

    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Danger zone')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
    expect(screen.getByText('Delete account')).toBeInTheDocument();
  });
});
