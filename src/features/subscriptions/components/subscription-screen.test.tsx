import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen, within } from '@/testing/render';

import { SubscriptionScreen } from './subscription-screen';

const SUB_URL = '*/users/subscription';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('SubscriptionScreen', () => {
  it('renders the active plan, details, and weekly bid usage (default handlers)', async () => {
    renderWithProviders(<SubscriptionScreen />);

    expect(await screen.findByText('Growth')).toBeInTheDocument();
    // Detail grid
    expect(screen.getByText('13 days')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    // Bid-usage signature meter (loaded by a separate, non-critical query)
    expect(await screen.findByText('Weekly bid usage')).toBeInTheDocument();
    expect(screen.getByText('12 of 20 left')).toBeInTheDocument();
    // Back link to the profile hub (same as the My-info screen)
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'href',
      '/dashboard/settings',
    );
  });

  it('shows the empty state when there is no active subscription (404)', async () => {
    server.use(http.get(SUB_URL, () => new HttpResponse(null, { status: 404 })));
    renderWithProviders(<SubscriptionScreen />);

    expect(await screen.findByText('No active subscription')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse plans' })).toBeInTheDocument();
  });

  it('shows the error state with a retry on a non-404 failure', async () => {
    server.use(http.get(SUB_URL, () => HttpResponse.json({ messageEn: 'Boom' }, { status: 500 })));
    renderWithProviders(<SubscriptionScreen />);

    expect(await screen.findByText("Couldn't load your subscription")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('cancels the subscription and flips to the empty state with a success banner', async () => {
    renderWithProviders(<SubscriptionScreen />);
    await screen.findByText('Growth');

    // Open the confirmation modal from the cancel action.
    screen.getByRole('button', { name: 'Cancel subscription' }).click();
    const dialog = await screen.findByRole('dialog');

    // After cancel, the re-fetch should report no active subscription.
    server.use(http.get(SUB_URL, () => new HttpResponse(null, { status: 404 })));
    within(dialog).getByRole('button', { name: 'Cancel subscription' }).click();

    expect(await screen.findByText('Your subscription has been cancelled.')).toBeInTheDocument();
    expect(await screen.findByText('No active subscription')).toBeInTheDocument();
  });
});
