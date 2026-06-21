import { beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import type { SketchFloor } from '../../api/sketch-types';

import { FloorSelector } from './floor-selector';

const FLOORS: SketchFloor[] = [
  { id: 'g', name_en: 'Ground', name_ar: 'الأرضي' },
  { id: 'f', name_en: 'First', name_ar: 'الأول' },
];

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('FloorSelector', () => {
  it('lists "All floors" plus every storey and reports the picked index', () => {
    const onChange = vi.fn();
    renderWithProviders(<FloorSelector floors={FLOORS} value={null} onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'All floors' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Ground' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'First' }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('falls back to numbered labels and can reset to all floors', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <FloorSelector floors={[{ id: 'a' }, { id: 'b' }]} value={0} onChange={onChange} />,
    );

    expect(screen.getByRole('button', { name: 'Floor 1' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'All floors' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('renders nothing for a single-floor design', () => {
    renderWithProviders(
      <FloorSelector floors={[{ id: 'only' }]} value={null} onChange={vi.fn()} />,
    );

    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
