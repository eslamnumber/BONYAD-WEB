import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { VerifyOtpForm } from './verify-otp-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/verify-otp',
  useSearchParams: () => new URLSearchParams(),
}));

const labels = {
  otpAriaLabel: 'Enter the verification code',
  submitButton: 'Verify',
  resendCode: 'Resend code',
  resendAriaLabel: 'Resend verification code',
  didNotReceiveCode: "Didn't receive the code?",
  successMessage: 'Verified successfully',
  roleCustomer: 'User',
  roleProfessional: 'Service Provider',
  roleToggleAriaLabel: 'Select your account type',
  errors: { genericError: 'Something went wrong. Please try again.' },
};

function fillOtp(code: string) {
  code.split('').forEach((digit, i) => {
    const input = screen.getByRole('textbox', { name: new RegExp(`digit ${i + 1}`, 'i') });
    fireEvent.change(input, { target: { value: digit } });
  });
}

describe('VerifyOtpForm', () => {
  it('renders OTP boxes and submit button', () => {
    renderWithProviders(<VerifyOtpForm labels={labels} phone="0500000000" accountRole="USER" />);
    expect(screen.getByRole('group', { name: /enter the verification code/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^verify$/i })).toBeInTheDocument();
  });

  it('renders resend button initially disabled', () => {
    renderWithProviders(<VerifyOtpForm labels={labels} phone="0500000000" accountRole="USER" />);
    expect(screen.getByRole('button', { name: /resend verification code/i })).toBeDisabled();
  });

  it('shows a validation error when submitting an empty OTP', async () => {
    renderWithProviders(<VerifyOtpForm labels={labels} phone="0500000000" accountRole="USER" />);
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('shows success message after successful verification', async () => {
    renderWithProviders(<VerifyOtpForm labels={labels} phone="0500000000" accountRole="USER" />);
    fillOtp('1234');
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/verified successfully/i);
    });
  });

  it('shows error on invalid OTP (401)', async () => {
    server.use(
      http.post('*/auth/verify-otp', () =>
        HttpResponse.json({ message: 'Invalid OTP' }, { status: 401 }),
      ),
    );
    renderWithProviders(<VerifyOtpForm labels={labels} phone="0500000000" accountRole="USER" />);
    fillOtp('0000');
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <VerifyOtpForm labels={labels} phone="0500000000" accountRole="USER" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
