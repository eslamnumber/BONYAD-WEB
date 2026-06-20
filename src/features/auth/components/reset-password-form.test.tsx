import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { ResetPasswordForm } from './reset-password-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/reset-password',
  useSearchParams: () => new URLSearchParams(),
}));

const labels = {
  otpLabel: 'Verification code',
  otpAriaLabel: 'Enter the verification code',
  newPasswordLabel: 'New password',
  newPasswordPlaceholder: 'New password',
  newPasswordAriaLabel: 'Enter your new password',
  confirmPasswordLabel: 'Confirm new password',
  confirmPasswordPlaceholder: 'Confirm new password',
  confirmPasswordAriaLabel: 'Re-enter your new password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  submitButton: 'Reset password',
  didNotReceiveCode: "Didn't receive the code?",
  resendCode: 'Resend code',
  resendAriaLabel: 'Resend verification code',
  successMessage: 'Your password has been reset. You can now log in.',
  errors: { genericError: 'Something went wrong. Please try again.' },
};

const STRONG = 'Str0ng!pass';

function fillOtp(code: string) {
  code.split('').forEach((digit, i) => {
    const input = screen.getByRole('textbox', { name: new RegExp(`digit ${i + 1}`, 'i') });
    fireEvent.change(input, { target: { value: digit } });
  });
}

function fillPasswords(value: string) {
  fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value } });
  fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value } });
}

function render() {
  return renderWithProviders(
    <ResetPasswordForm labels={labels} phone="500000000" accountRole="USER" />,
  );
}

describe('ResetPasswordForm', () => {
  it('renders OTP boxes, password fields and submit button', () => {
    render();
    expect(screen.getByRole('group', { name: /enter the verification code/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^reset password$/i })).toBeInTheDocument();
  });

  it('shows the success message after a valid reset', async () => {
    render();
    fillOtp('1234');
    fillPasswords(STRONG);
    fireEvent.click(screen.getByRole('button', { name: /^reset password$/i }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/your password has been reset/i);
    });
  });

  it('surfaces a backend error on an invalid OTP (401)', async () => {
    server.use(
      http.post('*/auth/reset-password', () =>
        HttpResponse.json({ messageEn: 'Invalid code' }, { status: 401 }),
      ),
    );
    render();
    fillOtp('0000');
    fillPasswords(STRONG);
    fireEvent.click(screen.getByRole('button', { name: /^reset password$/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render();
    expect(await axe(container)).toHaveNoViolations();
  });
});
