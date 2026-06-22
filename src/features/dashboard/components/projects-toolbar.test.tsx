import { beforeAll, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { fireEvent, renderWithProviders, screen, within } from '@/testing/render';

import { ProjectsToolbar } from './projects-toolbar';

const DEFAULTS = {
  active: 'all',
  onSelect: vi.fn(),
  sort: 'newest',
  onSort: vi.fn(),
  sortOpen: false,
  onToggleSort: vi.fn(),
} as const;

const renderToolbar = (over: Partial<Parameters<typeof ProjectsToolbar>[0]> = {}) =>
  renderWithProviders(<ProjectsToolbar {...DEFAULTS} {...over} />);

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('ProjectsToolbar', () => {
  it('renders the status tabs with the active one selected', () => {
    renderToolbar();
    expect(screen.getAllByRole('tab')).toHaveLength(7);
    expect(screen.getByRole('tab', { name: /^all$/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /completed/i })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('calls onSelect with the tab key when a tab is clicked', () => {
    const onSelect = vi.fn();
    renderToolbar({ onSelect });
    fireEvent.click(screen.getByRole('tab', { name: /in progress/i }));
    expect(onSelect).toHaveBeenCalledWith('inProgress');
  });

  it('toggles the sort menu from the filter pill', () => {
    const onToggleSort = vi.fn();
    renderToolbar({ onToggleSort });
    const pill = screen.getByRole('button', { name: /filter/i });
    expect(pill).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.click(pill);
    expect(onToggleSort).toHaveBeenCalledTimes(1);
  });

  it('offers the price/date orderings and reports the chosen one when open', () => {
    const onSort = vi.fn();
    renderToolbar({ sortOpen: true, onSort });
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('Lowest price')).toBeInTheDocument();
    expect(within(menu).getByText('Oldest first')).toBeInTheDocument();
    fireEvent.click(within(menu).getByText('Lowest price'));
    expect(onSort).toHaveBeenCalledWith('lowPrice');
  });

  it('has no a11y violations', async () => {
    const { container } = renderToolbar();
    expect(await axe(container)).toHaveNoViolations();
  });
});
