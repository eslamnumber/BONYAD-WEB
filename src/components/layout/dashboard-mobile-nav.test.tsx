import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { DashboardMobileNav } from './dashboard-mobile-nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

function setUser(role = 'USER', name = 'Ibrahim Saleh') {
  useAuthStore.setState({ user: { id: 1, role, name }, isAuthenticated: true });
}

describe('DashboardMobileNav', () => {
  it('keeps the side panel collapsed until the toggle is pressed', () => {
    setUser();
    renderWithProviders(<DashboardMobileNav />);

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
  });

  it('opens the side panel as a dropdown when the toggle is pressed', () => {
    setUser();
    renderWithProviders(<DashboardMobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
  });

  it('closes the panel when a tab is chosen', () => {
    setUser();
    renderWithProviders(<DashboardMobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.click(screen.getByRole('link', { name: 'Home' }));

    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });
});
