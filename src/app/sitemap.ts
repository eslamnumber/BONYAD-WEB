import { type MetadataRoute } from 'next';

import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';

/**
 * Dynamic sitemap.
 *
 * Lists ONLY routes that currently resolve to a real page — advertising a URL
 * that 404s causes "Submitted URL not found" errors in Search Console and wastes
 * crawl budget. Re-add SERVICES / TECHNICIANS / HELP / FAQ / PRIVACY / TERMS here
 * the moment each page ships (their links already live in nav/footer as
 * intentional placeholders). Dynamic entries (blog posts, technician profiles)
 * get appended once those features fetch real data.
 * Multilingual EN/AR is served from the same URL via cookie — no per-locale URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const now = new Date();

  return [
    { url: `${base}${ROUTES.HOME}`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    {
      url: `${base}${ROUTES.FOR_PROS}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}${ROUTES.HOW_IT_WORKS}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    { url: `${base}${ROUTES.BLOG}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    {
      url: `${base}${ROUTES.CONTACT}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    { url: `${base}${ROUTES.ABOUT}`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];
}
