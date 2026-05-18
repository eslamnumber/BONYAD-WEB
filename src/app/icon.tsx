import { ImageResponse } from 'next/og';

/**
 * Browser favicon — generated dynamically at request time.
 *
 * Note: inline styles with hardcoded colors are the standard pattern here.
 * `next/og` uses Satori for image rendering — Tailwind classes and CSS variables
 * are NOT available. Brand colors are approximated as fixed hex values; refine
 * once the Figma brand palette is final.
 */

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 700,
        fontFamily: 'system-ui, sans-serif',
        borderRadius: 6,
      }}
    >
      B
    </div>,
    { ...size },
  );
}
