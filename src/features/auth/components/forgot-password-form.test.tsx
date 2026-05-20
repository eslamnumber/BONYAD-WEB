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

  it('navigates to /verify-otp with phone param on successful submission', async () => {
    renderWithProviders(<ForgotPasswordForm labels={labels} accountRole="USER" />);
    fireEvent.change(screen.getByRole('textbox', { name: /enter your mobile number/i }), {
      target: { value: '0500000000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/verify-otp'));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('0500000000'));
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
