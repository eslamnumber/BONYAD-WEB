'use client';

/**
 * TEMPORARY dev-only preview — NOT a product route. Renders the real captured
 * sketch scene (`public/sketch-preview-job.json`) full-viewport so the geometry
 * (walls / doors / furniture / stairs) can be reviewed without the auth-gated
 * create flow. Delete this folder + the public JSON when done.
 */

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useState } from 'react';

import type { SketchJob } from '@/features/sketch';

import sketchPreviewJob from '../../../public/sketch-preview-job.json';

const SketchScene = dynamic(() => import('@/features/sketch/components/viewer/sketch-scene'), {
  ssr: false,
});

const FLOORS: { label: string; value: number | null }[] = [
  { label: 'All', value: null },
  { label: 'Ground', value: 0 },
  { label: 'First', value: 1 },
];

export default function SketchPreviewPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [job] = useState<SketchJob | null>(() => sketchPreviewJob as unknown as SketchJob);
  const [floor, setFloor] = useState<number | null>(0);

  if (!job?.parse || !job?.scene) return null;

  const chip = (active: boolean) => ({
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid #94a3b8',
    background: active ? '#7c3aed' : '#ffffff',
    color: active ? '#ffffff' : '#0f172a',
    fontSize: 13,
    cursor: 'pointer',
  });

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <SketchScene
        parse={job.parse}
        scene={job.scene}
        isDark={resolvedTheme === 'dark'}
        visibleFloor={floor}
      />
      <div style={{ position: 'fixed', top: 10, left: 10, display: 'flex', gap: 6, zIndex: 10 }}>
        {FLOORS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setFloor(f.value)}
            style={chip(floor === f.value)}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          style={chip(false)}
        >
          {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>
    </div>
  );
}
