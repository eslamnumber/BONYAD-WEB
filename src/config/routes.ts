/**
 * Centralized route paths. Components and `next/link` `href` props MUST come
 * from here — no raw path strings in JSX.
 *
 * Static paths are plain strings. Dynamic paths are factory functions so the
 * type system enforces param shape.
 */

export const ROUTES = {
  // Public marketing surface
  HOME: '/',
  FOR_PROS: '/for-pros',
  SERVICES: '/services',
  SERVICE_CATEGORY: (slug: string) => `/services/${slug}`,
  TECHNICIANS: '/technicians',
  TECHNICIAN_DETAIL: (id: string) => `/technicians/${id}`,
  BLOG: '/blog',
  BLOG_POST: (slug: string) => `/blog/${slug}`,
  HELP: '/help',
  HELP_ARTICLE: (id: string) => `/help/${id}`,
  FAQ: '/faq',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  ABOUT: '/about',

  // Auth (not yet implemented — placeholders for nav links)
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-otp',
  RESET_PASSWORD: '/reset-password',

  // Authenticated app surface (not yet implemented)
  APP_HOME: '/app',
  APP_PROFILE: '/app/profile',
  DASHBOARD: '/dashboard',
} as const;
