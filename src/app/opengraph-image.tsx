import { ImageResponse } from 'next/og';

/**
 * Default Open Graph image — used for any page that doesn't define its own.
 * Shows up on Twitter / Slack / WhatsApp / LinkedIn link previews.
 *
 * Per-page OG images can be added by creating `opengraph-image.tsx` inside
 * a specific route (e.g. `app/technicians/[id]/opengraph-image.tsx`).
 *
 * Brand-color exception: `next/og` uses Satori, which doesn't read Tailwind
 * tokens or CSS variables. Hex values here approximate the runtime tokens.
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Bonyad — verified construction technicians in Saudi Arabia';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: 80,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 128,
          fontWeight: 700,
          letterSpacing: -2,
          lineHeight: 1,
        }}
      >
        Bonyad
      </div>
      <div
        style={{
          fontSize: 36,
          opacity: 0.85,
          maxWidth: 900,
          lineHeight: 1.3,
        }}
      >
        Verified construction and home-service technicians in Saudi Arabia
      </div>
    </div>,
    { ...size },
  );
}
