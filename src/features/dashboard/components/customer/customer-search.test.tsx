import { http, HttpResponse } from 'msw';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { CustomerSearch } from './customer-search';

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

// Mirrors the MSW /services sample: categories (displayOrder 1-4) + subcategories.
const SERVICES = [
  { id: 1, nameEn: 'Construction', nameAr: 'البناء', isCategory: true, displayOrder: 1 },
  {
    id: 2,
    nameEn: 'Interior design',
    nameAr: 'التصميم الداخلي',
    isCategory: true,
    displayOrder: 2,
  },
  { id: 11, nameEn: 'Finishing contractor', nameAr: 'مقاول تشطيبات', isCategory: false },
  { id: 13, nameEn: 'Demolition contractor', nameAr: 'مقاول هدم', isCategory: false },
];

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

beforeEach(() => {
  pushMock.mockClear();
  window.localStorage.clear();
  server.use(http.get('*/services', () => HttpResponse.json(SERVICES)));
});

function focusInput() {
  renderWithProviders(<CustomerSearch />);
  fireEvent.focus(screen.getByRole('combobox'));
}

describe('CustomerSearch', () => {
  it('shows suggested categories (top of /services) on focus', async () => {
    focusInput();
    expect(await screen.findByRole('button', { name: 'Construction' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Interior design' })).toBeInTheDocument();
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
  });

  it('renders ranked service matches once the user types', async () => {
    focusInput();
    await screen.findByRole('button', { name: 'Construction' });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'contractor' } });

    expect(await screen.findByRole('button', { name: 'Finishing contractor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Demolition contractor' })).toBeInTheDocument();
    // Non-matching categories are gone.
    expect(screen.queryByRole('button', { name: 'Construction' })).not.toBeInTheDocument();
  });

  it('shows the empty state when nothing matches', async () => {
    focusInput();
    await screen.findByRole('button', { name: 'Construction' });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzzzz' } });

    expect(await screen.findByText('No matching services')).toBeInTheDocument();
  });

  it('clears the query and returns to suggestions via the clear control', async () => {
    focusInput();
    await screen.findByRole('button', { name: 'Construction' });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'contractor' } });
    await screen.findByRole('button', { name: 'Finishing contractor' });

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(await screen.findByRole('button', { name: 'Construction' })).toBeInTheDocument();
  });

  it('submits to the results route (and persists the recent search) on Enter', async () => {
    focusInput();
    await screen.findByRole('button', { name: 'Construction' });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'plumbing' } });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });

    expect(pushMock).toHaveBeenCalledWith('/technicians?q=plumbing');
    expect(window.localStorage.getItem('bonyad:dashboard:recent-searches')).toContain('plumbing');
  });

  it('submits the matched term when a result is clicked', async () => {
    focusInput();
    await screen.findByRole('button', { name: 'Construction' });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'contractor' } });

    fireEvent.click(await screen.findByRole('button', { name: 'Finishing contractor' }));

    expect(pushMock).toHaveBeenCalledWith('/technicians?q=Finishing%20contractor');
  });

  it('has no a11y violations with the dropdown open', async () => {
    const { container } = renderWithProviders(<CustomerSearch />);
    fireEvent.focus(screen.getByRole('combobox'));
    await screen.findByRole('button', { name: 'Construction' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
