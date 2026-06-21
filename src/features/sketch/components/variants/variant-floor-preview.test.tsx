import { beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import type { SketchFloorSvg } from '../../api/sketch-types';

import { VariantFloorPreview } from './variant-floor-preview';

/** Two storeys with distinct SVG markers so a floor switch is observable. */
const GROUND: SketchFloorSvg = { id: 'g', svg: '<svg id="ground"></svg>', rooms_count: 3 };
const FIRST: SketchFloorSvg = { id: 'f', svg: '<svg id="first"></svg>', rooms_count: 2 };
const TWO_FLOORS: SketchFloorSvg[] = [GROUND, FIRST];

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

function renderPreview(floors: SketchFloorSvg[]) {
  const onSelect = vi.fn();
  const utils = renderWithProviders(
    <VariantFloorPreview
      floors={floors}
      name="Modern villa"
      selected={false}
      onSelect={onSelect}
    />,
  );
  return { ...utils, onSelect };
}

describe('VariantFloorPreview', () => {
  it('renders the plan click-through so the tap selects the variant (not swallowed by the iframe)', () => {
    const { container, onSelect } = renderPreview(TWO_FLOORS);

    // The fix: the plan iframe must not capture the pointer, or the variant can
    // never be selected and the 3D build stays locked.
    expect(container.querySelector('iframe')?.className).toContain('pointer-events-none');

    fireEvent.click(screen.getByRole('button', { name: /Select this design/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows a switcher for every floor and swaps the previewed plan', () => {
    const { container } = renderPreview(TWO_FLOORS);

    expect(screen.getByRole('button', { name: 'Floor 1' })).toBeInTheDocument();
    const floor2 = screen.getByRole('button', { name: 'Floor 2' });
    expect(container.querySelector('iframe')?.getAttribute('srcdoc')).toContain('ground');

    fireEvent.click(floor2);
    expect(container.querySelector('iframe')?.getAttribute('srcdoc')).toContain('first');
  });

  it('hides the switcher for a single-floor design', () => {
    renderPreview([GROUND]);

    expect(screen.queryByRole('group', { name: /Switch floor/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Floor 1' })).not.toBeInTheDocument();
  });
});
