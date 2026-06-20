import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { AccountTypeScreen } from './account-type-screen';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/settings/account-type',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

// A mutable profile + a spy mutation, swapped per test. The fetchers themselves
// are covered by verify-wathq.test.ts / switch-account-type.test.ts.
const h = vi.hoisted(() => ({
  profile: undefined as Record<string, unknown> | undefined,
  mutate: vi.fn(),
}));

vi.mock('../api', () => ({
  useMyProfile: () => ({ data: h.profile }),
  useSwitchAccountType: () => ({ mutate: h.mutate, isPending: false, error: null, reset: vi.fn() }),
  WathqNotAuthorizedError: class extends Error {},
}));

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  h.mutate.mockClear();
  useAuthStore.setState({ user: { id: 1, role: 'TECHNICIAN' }, isAuthenticated: true });
});

describe('AccountTypeScreen', () => {
  it('shows the inline "Switch to company" form for an individual account', () => {
    h.profile = { id: 1, isCompany: false, nationalId: '1122334455' };
    renderWithProviders(<AccountTypeScreen />);

    expect(screen.getByRole('heading', { name: 'Switch to company' })).toBeInTheDocument();
    expect(screen.getByText('Company name')).toBeInTheDocument();
    expect(screen.getByText('Commercial registration (CR) number')).toBeInTheDocument();
    expect(screen.getByText('National ID')).toBeInTheDocument();
    // National ID is pre-filled from the profile but editable.
    expect(screen.getByDisplayValue('1122334455')).toBeInTheDocument();
    expect(h.mutate).not.toHaveBeenCalled();
  });

  it('shows the verified company panel for a company account', () => {
    h.profile = {
      id: 1,
      isCompany: true,
      companyName: 'مؤسسة العتيبي للمقاولات',
      crNumber: '1010101010',
    };
    renderWithProviders(<AccountTypeScreen />);

    expect(screen.getByText('Company account')).toBeInTheDocument();
    expect(screen.getByText('مؤسسة العتيبي للمقاولات')).toBeInTheDocument();
    expect(screen.getByText('Wathq verified')).toBeInTheDocument();
    expect(screen.getByText('1010101010')).toBeInTheDocument();
    expect(screen.queryByText('Switch to company')).not.toBeInTheDocument();
  });

  it('switches a company account back to Individual', () => {
    h.profile = { id: 1, isCompany: true, companyName: 'X', crNumber: '1010101010' };
    renderWithProviders(<AccountTypeScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Switch to individual account' }));

    expect(h.mutate).toHaveBeenCalledTimes(1);
    expect(h.mutate).toHaveBeenCalledWith({ mode: 'individual' }, expect.anything());
  });

  it('submits the company registration with the Wathq verify payload', () => {
    h.profile = { id: 1, isCompany: false, nationalId: '1122334455' };
    renderWithProviders(<AccountTypeScreen />);

    fireEvent.change(screen.getByPlaceholderText('Enter company name'), {
      target: { value: 'مؤسسة البناء الحديث' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter CR number'), {
      target: { value: '1010101010' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Verify & switch' }));

    expect(h.mutate).toHaveBeenCalledTimes(1);
    expect(h.mutate).toHaveBeenCalledWith(
      {
        mode: 'company',
        companyName: 'مؤسسة البناء الحديث',
        crNumber: '1010101010',
        nationalId: '1122334455',
      },
      expect.anything(),
    );
  });

  it('keeps "Verify & switch" disabled until the CR number is 10 digits', () => {
    h.profile = { id: 1, isCompany: false, nationalId: '1122334455' };
    renderWithProviders(<AccountTypeScreen />);

    fireEvent.change(screen.getByPlaceholderText('Enter company name'), {
      target: { value: 'Acme' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter CR number'), {
      target: { value: '101010' },
    });

    expect(screen.getByText('The CR number must be exactly 10 digits.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify & switch' })).toBeDisabled();
  });

  // RTL rule 4 (inverted en→rtl map): the company-name field anchors to the same
  // physical edge as its end-aligned label, so it uses `text-end` and inherits the
  // document dir — NEVER `dir="auto"` (which would flip the edge per typed language).
  it('right-aligns the company-name field to its label with no dir="auto"', () => {
    h.profile = { id: 1, isCompany: false, nationalId: '1122334455' };
    renderWithProviders(<AccountTypeScreen />);

    const nameField = screen.getByPlaceholderText('Enter company name');

    expect(nameField).toHaveClass('text-end');
    expect(nameField).not.toHaveAttribute('dir');
  });
});
