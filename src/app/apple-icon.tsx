import { ImageResponse } from 'next/og';

/**
 * Apple touch icon — used when a user "Add to Home Screen" on iOS Safari.
 * Same brand exception as `icon.tsx` (Satori can't read CSS variables).
 */

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
        fontSize: 110,
        fontWeight: 700,
        fontFamily: 'system-ui, sans-serif',
        borderRadius: 36,
      }}
    >
      B
    </div>,
    { ...size },
  );
}
