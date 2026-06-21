import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { TechnicianSetupScreen } from './technician-setup-screen';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace, prefetch: vi.fn() }),
  usePathname: () => '/setup',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

const PLAN = { id: 1, nameEn: 'Starter', nameAr: 'مبتدئ', price: 0, bidsPerWeek: 3 };
const CATEGORY = { id: 10, nameEn: 'Plumbing', nameAr: 'سباكة', isCategory: true };
const SUBCATEGORY = { id: 101, nameEn: 'Pipe repair', nameAr: 'إصلاح المواسير' };

function readHandlers() {
  return [
    http.get('*/subscriptions/categories', () => HttpResponse.json([PLAN])),
    http.get('*/services/categories', () => HttpResponse.json([CATEGORY])),
    http.get('*/services/:categoryId/subcategories', () => HttpResponse.json([SUBCATEGORY])),
  ];
}

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('TechnicianSetupScreen', () => {
  it('runs plan → services → review → finish and redirects to the dashboard', async () => {
    const calls: { services?: unknown; subscribe?: unknown; completed?: boolean } = {};
    server.use(
      ...readHandlers(),
      http.post('*/technician/services/add', async ({ request }) => {
        calls.services = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
      http.post('*/users/subscribe', async ({ request }) => {
        calls.subscribe = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
      http.put('*/onboarding/:userId/complete', () => {
        calls.completed = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderWithProviders(<TechnicianSetupScreen />);

    // Step 1 — choose the plan, advance.
    fireEvent.click(await screen.findByRole('button', { name: /Starter/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 2 — expand the category, pick the leaf service, advance.
    fireEvent.click(await screen.findByRole('button', { name: /Plumbing/, expanded: false }));
    fireEvent.click(await screen.findByRole('button', { name: /Pipe repair/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 3 — review then finish.
    expect(await screen.findByText('Pipe repair')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Finish setup' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/dashboard'));
    expect(calls.services).toEqual({ serviceIds: [101] });
    expect(calls.subscribe).toEqual({ subscriptionCategoryId: 1 });
    expect(calls.completed).toBe(true);
  });

  it('lets a technician choose a whole category without picking any subservices', async () => {
    const calls: { services?: unknown } = {};
    server.use(
      ...readHandlers(),
      http.post('*/technician/services/add', async ({ request }) => {
        calls.services = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
      http.post('*/users/subscribe', () => new HttpResponse(null, { status: 204 })),
      http.put('*/onboarding/:userId/complete', () => new HttpResponse(null, { status: 204 })),
    );
    renderWithProviders(<TechnicianSetupScreen />);

    // Step 1 — plan.
    fireEvent.click(await screen.findByRole('button', { name: /Starter/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 2 — tick the category itself; never expand into subservices.
    fireEvent.click(await screen.findByRole('button', { name: /Select all services in Plumbing/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 3 — the category is reviewed and its ID submitted (no subservice IDs).
    expect(await screen.findByText('Plumbing')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Finish setup' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/dashboard'));
    expect(calls.services).toEqual({ serviceIds: [10] });
  });

  it('surfaces the localized finish error when a call fails', async () => {
    server.use(
      ...readHandlers(),
      http.post('*/technician/services/add', () =>
        HttpResponse.json({ messageEn: 'Could not save services' }, { status: 400 }),
      ),
    );
    renderWithProviders(<TechnicianSetupScreen />);

    fireEvent.click(await screen.findByRole('button', { name: /Starter/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(await screen.findByRole('button', { name: /Plumbing/, expanded: false }));
    fireEvent.click(await screen.findByRole('button', { name: /Pipe repair/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Finish setup' }));

    expect(await screen.findByText('Could not save services')).toBeInTheDocument();
  });

  it('locks a new category once the plan category cap is reached', async () => {
    server.use(
      http.get('*/subscriptions/categories', () =>
        HttpResponse.json([{ id: 1, nameEn: 'Solo', price: 0, bidsPerWeek: 3, maxCategories: 1 }]),
      ),
      http.get('*/services/categories', () =>
        HttpResponse.json([
          { id: 10, nameEn: 'Plumbing', isCategory: true },
          { id: 20, nameEn: 'Electrical', isCategory: true },
        ]),
      ),
      http.get('*/services/:categoryId/subcategories', ({ params }) =>
        HttpResponse.json(
          Number(params.categoryId) === 10
            ? [{ id: 101, nameEn: 'Pipe repair' }]
            : [{ id: 201, nameEn: 'Wiring' }],
        ),
      ),
    );
    renderWithProviders(<TechnicianSetupScreen />);

    fireEvent.click(await screen.findByRole('button', { name: /Solo/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Engage Plumbing — that uses the plan's only category slot.
    fireEvent.click(await screen.findByRole('button', { name: /Plumbing/, expanded: false }));
    fireEvent.click(await screen.findByRole('button', { name: /Pipe repair/ }));

    // Electrical would be a second category → its service is locked.
    fireEvent.click(screen.getByRole('button', { name: /Electrical/, expanded: false }));
    expect(await screen.findByRole('button', { name: /Wiring/ })).toBeDisabled();
  });
});
