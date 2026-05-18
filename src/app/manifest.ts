import { type MetadataRoute } from 'next';

/**
 * Web app manifest — surfaces "Add to home screen" on mobile + installable PWA
 * on desktop. Icons reference the generated Next.js routes (icon.tsx + apple-icon.tsx).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bonyad',
    short_name: 'Bonyad',
    description:
      'A marketplace connecting customers in Saudi Arabia with verified construction and home-service technicians.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
