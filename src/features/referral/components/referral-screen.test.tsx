import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { ReferralScreen } from './referral-screen';

const STATS_URL = '*/users/me/referrals/stats';
const LIST_URL = '*/users/me/referrals';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('ReferralScreen', () => {
  it('renders the wallet balance, invite field, and grouped invitations (default handlers)', async () => {
    const { container } = renderWithProviders(<ReferralScreen />);

    // Natural-direction override (requested): English reads LTR, not the project's
    // inverted en→rtl mapping.
    expect(container.querySelector('div[dir]')?.getAttribute('dir')).toBe('ltr');
    // Reward wallet hero
    expect(await screen.findByText('150')).toBeInTheDocument();
    // Invite field
    expect(screen.getByLabelText('Invite by phone number')).toBeInTheDocument();
    // Grouped list: a converted friend + a pending invitation phone
    expect(screen.getByText('Lina Ahmed')).toBeInTheDocument();
    expect(screen.getByText('598765432')).toBeInTheDocument();
    expect(screen.getByText('Earned 50 SAR')).toBeInTheDocument();
  });

  it('shows only the invite field (no list) when there is no referral activity (404)', async () => {
    server.use(http.get(LIST_URL, () => new HttpResponse(null, { status: 404 })));
    renderWithProviders(<ReferralScreen />);

    expect(await screen.findByLabelText('Invite by phone number')).toBeInTheDocument();
    expect(screen.queryByText('Your invitations')).not.toBeInTheDocument();
  });

  it('shows the error state with a retry on a non-404 failure', async () => {
    server.use(
      http.get(STATS_URL, () => HttpResponse.json({ messageEn: 'Boom' }, { status: 500 })),
    );
    renderWithProviders(<ReferralScreen />);

    expect(await screen.findByText("Couldn't load your rewards")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('sends an invite and shows the success line with the invited number', async () => {
    renderWithProviders(<ReferralScreen />);
    const input = await screen.findByLabelText('Invite by phone number');

    fireEvent.change(input, { target: { value: '512345678' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    // Default handler echoes invited_phone: 511122233
    expect(await screen.findByText('Invitation sent to 511122233.')).toBeInTheDocument();
  });

  it('renders RTL in Arabic (natural direction)', async () => {
    await i18n.changeLanguage('ar');
    try {
      const { container } = renderWithProviders(<ReferralScreen />);
      expect(container.querySelector('div[dir]')?.getAttribute('dir')).toBe('rtl');
      // Let the three queries settle inside act() (list title = "Your invitations" in ar).
      await screen.findByText('دعواتك');
    } finally {
      await i18n.changeLanguage('en');
    }
  });
});
