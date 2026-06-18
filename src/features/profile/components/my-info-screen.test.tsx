import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { renderWithProviders, screen } from '@/testing/render';

import { MyInfoScreen } from './my-info-screen';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/settings/profile',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

// The summary reads the live profile; drive it from a fixture so we test the
// composition + role gate (the fetcher itself is covered by get-my-profile.test.ts).
vi.mock('../api', () => ({
  useMyProfile: () => ({ data: { id: 1, email: 'ahmed@example.com', phoneNumber: '0551234567' } }),
}));

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

function setUser(role: string) {
  useAuthStore.setState({ user: { id: 1, role, name: 'Ahmed' }, isAuthenticated: true });
}

describe('MyInfoScreen', () => {
  it('renders the account snapshot (status · email · phone) and all nav cards for a customer', () => {
    setUser('USER');
    renderWithProviders(<MyInfoScreen />);

    expect(screen.getByText('My info')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('ahmed@example.com')).toBeInTheDocument();
    expect(screen.getByText('0551234567')).toBeInTheDocument();

    expect(screen.getByText('Edit profile information')).toBeInTheDocument();
    expect(screen.getByText('Change phone number')).toBeInTheDocument();
    expect(screen.getByText('Change password')).toBeInTheDocument();
    expect(screen.getByText('My transactions')).toBeInTheDocument();
  });

  it('hides "My transactions" for a technician (iOS role gate)', () => {
    setUser('TECHNICIAN');
    renderWithProviders(<MyInfoScreen />);

    expect(screen.getByText('Edit profile information')).toBeInTheDocument();
    expect(screen.queryByText('My transactions')).not.toBeInTheDocument();
  });
});
