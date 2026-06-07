import { beforeAll, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { ProjectsToolbar } from './projects-toolbar';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('ProjectsToolbar', () => {
  it('renders the eight status tabs with the active one selected', () => {
    renderWithProviders(<ProjectsToolbar active="all" onSelect={vi.fn()} />);
    expect(screen.getAllByRole('tab')).toHaveLength(8);
    expect(screen.getByRole('tab', { name: /^all$/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /completed/i })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('calls onSelect with the tab key when a tab is clicked', () => {
    const onSelect = vi.fn();
    renderWithProviders(<ProjectsToolbar active="all" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('tab', { name: /in progress/i }));
    expect(onSelect).toHaveBeenCalledWith('inProgress');
  });

  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(<ProjectsToolbar active="all" onSelect={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
