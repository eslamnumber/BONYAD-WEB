import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { LoginForm } from './login-form';

const routerPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
}));

const labels = {
  phoneLabel: 'Mobile number',
  phonePlaceholder: 'Mobile number',
  phoneAriaLabel: 'Enter your mobile number',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Password',
  passwordAriaLabel: 'Enter your password',
  togglePasswordVisibility: 'Toggle password visibility',
  forgotPassword: 'Forgot password?',
  submitButton: 'Log in',
  errors: {
    invalidCredentials: 'Invalid phone number or password',
    genericError: 'Something went wrong. Please try again.',
  },
};

describe('LoginForm', () => {
  it('renders phone field, password field, and submit button', () => {
    renderWithProviders(<LoginForm labels={labels} userRole="USER" />);
    expect(screen.getByRole('textbox', { name: /enter your mobile number/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    renderWithProviders(<LoginForm labels={labels} userRole="USER" />);
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderWithProviders(<LoginForm labels={labels} userRole="USER" />);
    const passwordInput = screen.getByLabelText(/enter your password/i);
    const toggleBtn = screen.getByRole('button', { name: /toggle password visibility/i });
    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows a validation error when submitting empty phone', async () => {
    renderWithProviders(<LoginForm labels={labels} userRole="USER" />);
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('shows invalid credentials error on 401 API response', async () => {
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 }),
      ),
    );
    renderWithProviders(<LoginForm labels={labels} userRole="USER" />);
    fireEvent.change(screen.getByRole('textbox', { name: /enter your mobile number/i }), {
      target: { value: '0500000000' },
    });
    fireEvent.change(screen.getByLabelText(/enter your password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid phone number or password/i)).toBeInTheDocument();
    });
  });

  it('shows the localized backend message on a 400 with messageEn/messageAr', async () => {
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json(
          {
            messageEn: 'Account not found.',
            messageAr: 'الحساب غير موجود.',
            errorCode: 'ACCOUNT_NOT_FOUND',
          },
          { status: 400 },
        ),
      ),
    );
    renderWithProviders(<LoginForm labels={labels} userRole="USER" />);
    fireEvent.change(screen.getByRole('textbox', { name: /enter your mobile number/i }), {
      target: { value: '0500000000' },
    });
    fireEvent.change(screen.getByLabelText(/enter your password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText(/account not found\./i)).toBeInTheDocument();
    });
  });

  it('routes to verify-otp when backend returns USER_ALREADY_EXISTS_PENDING (400)', async () => {
    routerPush.mockClear();
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json(
          {
            messageEn: 'Account pending verification.',
            messageAr: 'الحساب في انتظار التحقق.',
            errorCode: 'USER_ALREADY_EXISTS_PENDING',
          },
          { status: 400 },
        ),
      ),
    );
    renderWithProviders(<LoginForm labels={labels} userRole="USER" />);
    fireEvent.change(screen.getByRole('textbox', { name: /enter your mobile number/i }), {
      target: { value: '0500000000' },
    });
    fireEvent.change(screen.getByLabelText(/enter your password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith(
        expect.stringMatching(/^\/verify-otp\?.*phone=500000000.*role=USER.*source=login/),
      );
    });
  });

  it('routes to verify-otp on a 200 pending-verification message', async () => {
    routerPush.mockClear();
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json({ message: 'Account pending verification — OTP sent.' }, { status: 200 }),
      ),
    );
    renderWithProviders(<LoginForm labels={labels} userRole="TECHNICIAN" />);
    fireEvent.change(screen.getByRole('textbox', { name: /enter your mobile number/i }), {
      target: { value: '501234567' },
    });
    fireEvent.change(screen.getByLabelText(/enter your password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith(
        expect.stringMatching(/^\/verify-otp\?.*phone=501234567.*role=TECHNICIAN/),
      );
    });
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<LoginForm labels={labels} userRole="USER" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
