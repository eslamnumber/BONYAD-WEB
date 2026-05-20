/**
 * API endpoint paths — mirrors website-bonyad/src/config/api.ts.
 * No endpoint string literal may appear outside this file.
 * Dynamic segments use `:param` convention; replace at call-site.
 */
export const API_ENDPOINTS = {
  USERS: {
    REGISTER: '/users/register',
  },
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    FORGOT_PASSWORD_RESEND: '/auth/forgot-password/resend',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    VALIDATE_TOKEN: '/auth/validate-token',
  },
} as const;
