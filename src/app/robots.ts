import { type MetadataRoute } from 'next';

import { env } from '@/config/env';

/**
 * Dynamic robots.txt — uses `env.NEXT_PUBLIC_SITE_URL` so it self-updates per environment.
 *
 * AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) are explicitly allowed so
 * Bonyad becomes citable in AI search results. Authenticated paths are blocked
 * for everyone. See docs/seo-and-ai-readability.md §4.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      {
        userAgent: '*',
        disallow: ['/api/', '/app/', '/login', '/register', '/forgot-password', '/reset-password'],
      },
    ],
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    host: env.NEXT_PUBLIC_SITE_URL,
  };
}
