import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders, screen } from '@/testing/render';

import { SowPhotoUpload } from './sow-photo-upload';

/**
 * Reproduces the publish-address wiring: a parent that stores the reported files in
 * state and hands SowPhotoUpload a FRESH inline onChange on every render (just like
 * `onChange={(photos) => onUpdate({ photos })}` → setDraft). Before the latest-ref fix,
 * depending on that closure re-ran the report effect each render → setState →
 * re-render → "Maximum update depth exceeded".
 */
function LoopHarness() {
  const [, setPhotos] = useState<File[]>([]);
  return <SowPhotoUpload onChange={(files) => setPhotos(files)} />;
}

describe('SowPhotoUpload', () => {
  it('reports files up without an infinite render loop when the parent re-renders', () => {
    expect(() => renderWithProviders(<LoopHarness />)).not.toThrow();
    // The add-photo control still renders (single button while no photos are selected).
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
