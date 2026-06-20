export { LoginForm } from './components/login-form';
export { LoginClient } from './components/login-client';
export { LoginPage } from './components/login-page';
export { ForgotPasswordPage } from './components/forgot-password-page';
export { VerifyOtpPage } from './components/verify-otp-page';
export { ResetPasswordPage } from './components/reset-password-page';
export { RegisterPage } from './components/register-page';
export { ChangePasswordForm } from './components/change-password-form';
export { ChangePhoneForm } from './components/change-phone-form';
export { getAuthHeaderLabels } from './get-auth-header-labels';

// Session foundation
export { AuthProvider } from './components/auth-provider';
export { LogoutConfirmModal } from './components/logout-confirm-modal';
export { useLogout, logoutUser } from './api/logout';
/** Server-side Terms recording — consumed by the `/api/auth/verify-otp` route handler. */
export { approveTerms } from './api/approve-terms';
export {
  loginRequestSchema,
  toLoginResult,
  PENDING_VERIFICATION_CODE,
} from './schemas/login.schema';
export type { LoginResult, LoginResponse } from './schemas/login.schema';
