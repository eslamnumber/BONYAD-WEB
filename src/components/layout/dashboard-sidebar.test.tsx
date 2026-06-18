import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor, within } from '@/testing/render';

import { DashboardSidebar } from './dashboard-sidebar';

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

function setUser(role: string, name = 'Ibrahim Saleh') {
  useAuthStore.setState({ user: { id: 1, role, name }, isAuthenticated: true });
}

describe('DashboardSidebar role-awareness', () => {
  it('renders the customer nav + account menu for a USER', () => {
    setUser('USER');
    renderWithProviders(<DashboardSidebar />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Offers' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Job offers' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Payments' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
  });

  it('renders the technician nav with a static (non-menu) profile for other roles', () => {
    setUser('TECHNICIAN', 'Sara');
    renderWithProviders(<DashboardSidebar />);

    expect(screen.getByRole('link', { name: 'Job offers' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Payments' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Offers' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Account menu' })).not.toBeInTheDocument();
    expect(screen.getByText('Service provider')).toBeInTheDocument();
  });

  it('treats a lowercase "user" role as a customer (case-insensitive)', () => {
    setUser('user', 'Ali');
    renderWithProviders(<DashboardSidebar />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
  });

  it('opens the account menu with sign-out + language actions', async () => {
    setUser('USER');
    renderWithProviders(<DashboardSidebar />);

    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));

    expect(await screen.findByRole('menuitem', { name: 'Sign out' })).toBeInTheDocument();
    // en locale → the language row offers Arabic.
    expect(screen.getByRole('menuitem', { name: 'العربية' })).toBeInTheDocument();
  });

  it('asks for confirmation before signing out, and cancel dismisses it', async () => {
    setUser('USER');
    renderWithProviders(<DashboardSidebar />);

    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Sign out' }));

    // The confirmation dialog opens — no logout has fired yet (unhandled POST would error).
    const dialog = await screen.findByRole('dialog', { name: 'Sign out' });
    expect(within(dialog).getByText('Are you sure you want to sign out of your account?'));

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('clears the session via the logout route when confirmed', async () => {
    let called = false;
    server.use(
      http.post('*/api/auth/logout', () => {
        called = true;
        return HttpResponse.json({ ok: true });
      }),
    );
    setUser('USER');
    renderWithProviders(<DashboardSidebar />);

    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Sign out' }));
    const dialog = await screen.findByRole('dialog', { name: 'Sign out' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(called).toBe(true));
  });
});
