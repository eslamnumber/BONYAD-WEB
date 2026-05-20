import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { RegisterForm } from './register-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/register',
  useSearchParams: () => new URLSearchParams(),
}));

const labels = {
  nameLabel: 'Full name',
  namePlaceholder: 'Full name',
  nameAriaLabel: 'Enter your full name',
  phoneLabel: 'Mobile number',
  phonePlaceholder: 'Mobile number',
  phoneAriaLabel: 'Enter your mobile number',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter password',
  passwordAriaLabel: 'Enter your password',
  confirmPasswordLabel: 'Re-enter password',
  confirmPasswordPlaceholder: 'Enter password',
  confirmPasswordAriaLabel: 'Re-enter your password',
  togglePasswordVisibility: 'Toggle password visibility',
  termsText: 'Yes, I understand and agree to the Terms of Service.',
  termsAriaLabel: 'Accept terms and conditions',
  submitButton: 'Create account',
  errors: {
    nameRequired: 'Full name is required',
    nameTooShort: 'Name must be at least 2 characters',
    phoneRequired: 'Mobile number is required',
    phoneInvalid: 'Enter a valid mobile number',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 6 characters',
    confirmPasswordRequired: 'Please confirm your password',
    passwordMismatch: 'Passwords do not match',
    phoneAlreadyRegistered: 'This phone number is already registered',
    genericError: 'Something went wrong. Please try again.',
  },
};

function fillValidForm() {
  fireEvent.change(screen.getByRole('textbox', { name: /enter your full name/i }), {
    target: { value: 'Ahmed Ali' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /enter your mobile number/i }), {
    target: { value: '512345678' },
  });
  fireEvent.change(screen.getByLabelText(/^enter your password$/i), {
    target: { value: 'pass123' },
  });
  fireEvent.change(screen.getByLabelText(/^re-enter your password$/i), {
    target: { value: 'pass123' },
  });
  fireEvent.click(screen.getByRole('checkbox'));
}

describe('RegisterForm', () => {
  it('renders all fields and submit button', () => {
    renderWithProviders(<RegisterForm labels={labels} userRole="TECHNICIAN" />);
    expect(screen.getByRole('textbox', { name: /enter your full name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /enter your mobile number/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^enter your password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^re-enter your password$/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('toggles password visibility for password field', () => {
    renderWithProviders(<RegisterForm labels={labels} userRole="USER" />);
    const passwordInput = screen.getByLabelText(/^enter your password$/i);
    const toggleBtns = screen.getAllByRole('button', { name: /toggle password visibility/i });
    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleBtns[0]!);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(toggleBtns[0]!);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles visibility for confirm password field independently', () => {
    renderWithProviders(<RegisterForm labels={labels} userRole="USER" />);
    const confirmInput = screen.getByLabelText(/^re-enter your password$/i);
    const toggleBtns = screen.getAllByRole('button', { name: /toggle password visibility/i });
    expect(confirmInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleBtns[1]!);
    expect(confirmInput).toHaveAttribute('type', 'text');
  });

  it('shows validation errors when submitting empty form', async () => {
    renderWithProviders(<RegisterForm labels={labels} userRole="USER" />);
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('shows password mismatch error when passwords differ', async () => {
    renderWithProviders(<RegisterForm labels={labels} userRole="USER" />);
    fireEvent.change(screen.getByRole('textbox', { name: /enter your full name/i }), {
      target: { value: 'Ahmed Ali' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /enter your mobile number/i }), {
      target: { value: '512345678' },
    });
    fireEvent.change(screen.getByLabelText(/^enter your password$/i), {
      target: { value: 'pass123' },
    });
    fireEvent.change(screen.getByLabelText(/^re-enter your password$/i), {
      target: { value: 'different' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows duplicate phone error on 409 API response', async () => {
    server.use(
      http.post('*/users/register', () =>
        HttpResponse.json({ message: 'Phone number already registered' }, { status: 409 }),
      ),
    );
    renderWithProviders(<RegisterForm labels={labels} userRole="USER" />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/this phone number is already registered/i)).toBeInTheDocument();
    });
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<RegisterForm labels={labels} userRole="USER" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
