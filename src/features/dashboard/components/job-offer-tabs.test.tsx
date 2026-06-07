import { beforeAll, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { JobOfferTabs } from './job-offer-tabs';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('JobOfferTabs', () => {
  it('renders three tabs with the active one selected', () => {
    renderWithProviders(<JobOfferTabs active="bestForYou" onSelect={vi.fn()} panelId="p" />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tab', { name: /best for you/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: /newest/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelect with the tab key when a tab is clicked', () => {
    const onSelect = vi.fn();
    renderWithProviders(<JobOfferTabs active="bestForYou" onSelect={onSelect} panelId="p" />);
    fireEvent.click(screen.getByRole('tab', { name: /newest/i }));
    expect(onSelect).toHaveBeenCalledWith('newest');
  });

  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(
      <>
        <JobOfferTabs active="bestForYou" onSelect={vi.fn()} panelId="p" />
        <div id="p" role="tabpanel" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
