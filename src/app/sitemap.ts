import { type MetadataRoute } from 'next';

import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';

/**
 * Dynamic sitemap.
 *
 * Currently lists static public routes. Will be extended with dynamic entries
 * (every technician profile, blog post, help article) once those features land.
 * Multilingual EN/AR is served from the same URL via cookie — no per-locale URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const now = new Date();

  return [
    { url: `${base}${ROUTES.HOME}`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    {
      url: `${base}${ROUTES.SERVICES}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${base}${ROUTES.TECHNICIANS}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    { url: `${base}${ROUTES.BLOG}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}${ROUTES.HELP}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}${ROUTES.FAQ}`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    {
      url: `${base}${ROUTES.CONTACT}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    { url: `${base}${ROUTES.ABOUT}`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    {
      url: `${base}${ROUTES.PRIVACY}`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    { url: `${base}${ROUTES.TERMS}`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
