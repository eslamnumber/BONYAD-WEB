import { ROUTES } from '@/config/routes';

export const NAV_LINKS = [
  { route: ROUTES.CONTACT, key: 'contact' as const },
  { route: ROUTES.BLOG, key: 'blog' as const },
  { route: ROUTES.ABOUT, key: 'about' as const },
  { route: ROUTES.HELP, key: 'howItWorks' as const },
  { route: ROUTES.SERVICES, key: 'services' as const, hasDropdown: true },
];
