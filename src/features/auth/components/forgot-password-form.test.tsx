import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { ForgotPasswordForm } from './forgot-password-form';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/forgot-password',
  useSearchParams: () => new URLSearchParams(),
}));

const labels = {
  phoneLabel: 'Mobile number',
  phonePlaceholder: 'Mobile number',
  phoneAriaLabel: 'Enter your mobile number',
  submitButton: 'Send verification code',
  roleCustomer: 'User',
  roleProfessional: 'Service Provider',
  roleToggleAriaLabel: 'Select your account type',
  errors: { genericError: 'Something went wrong. Please try again.' },
};

describe('ForgotPasswordForm', () => {
  it('renders phone field and submit button', () => {
    renderWithProviders(<ForgotPasswordForm labels={labels} accountRole="USER" />);
    expect(screen.getByRole('textbox', { name: /enter your mobile number/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send verification code/i })).toBeInTheDocument();
  });

  it('shows a validation error when submitting an empty phone number', async () => {
    renderWithProviders(<ForgotPasswordForm labels={labels} accountRole="USER" />);
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('navigates to /reset-password with phone param on successful submission', async () => {
    renderWithProviders(<ForgotPasswordForm labels={labels} accountRole="USER" />);
    fireEvent.change(screen.getByRole('textbox', { name: /enter your mobile number/i }), {
      target: { value: '0500000000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/reset-password'));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('phone=500000000'));
    });
  });

  it('forwards the selected role (technician) to the reset-password route', async () => {
    renderWithProviders(<ForgotPasswordForm labels={labels} accountRole="USER" />);
    fireEvent.click(screen.getByRole('button', { name: /service provider/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /enter your mobile number/i }), {
      target: { value: '0500000000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('role=TECHNICIAN'));
    });
  });

  it('shows generic error on API failure', async () => {
    server.use(
      http.post('*/auth/forgot-password', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    );
    renderWithProviders(<ForgotPasswordForm labels={labels} accountRole="USER" />);
    fireEvent.change(screen.getByRole('textbox', { name: /enter your mobile number/i }), {
      target: { value: '0500000000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <ForgotPasswordForm labels={labels} accountRole="USER" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
