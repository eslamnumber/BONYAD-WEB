import { http, HttpResponse } from 'msw';

/**
 * Refer-a-friend handlers (the `/users/me/referral(s)` + `/users/me/wallet` group).
 * Defaults model a happy path: a funnel with activity, a 150 SAR reward wallet, one
 * converted referral + one pending invitation, and a successful invite. Individual
 * tests override per case via `server.use(...)`. Paths use a leading wildcard so the
 * same-origin proxy URL used in happy-dom matches (see the cards/auth handler
 * convention).
 */
export const referralHandlers = [
  http.get('*/users/me/referrals/stats', () =>
    HttpResponse.json({
      total_invited: 8,
      signed_up: 5,
      converted: 3,
      pending: 2,
      wallet_balance: 150,
      next_tier_at: 5,
      next_tier_reward: 100,
    }),
  ),
  http.get('*/users/me/wallet', () =>
    HttpResponse.json({ user_id: 444, balance: 150, currency: 'SAR' }),
  ),
  http.get('*/users/me/referrals', () =>
    HttpResponse.json({
      referrals: [
        {
          id: 1,
          referred: { id: 9, name: 'Lina Ahmed', phone_number: '512345678' },
          status: 'CONVERTED',
          reward_tier: { id: 1, threshold: 1, reward_amount: 50 },
          converted_at: '2026-06-10T00:00:00.000',
        },
      ],
      invitations: [{ id: 2, invited_phone: '598765432', status: 'PENDING', sms_sent: true }],
    }),
  ),
  http.post('*/users/me/referral/invite', () =>
    HttpResponse.json({
      success: true,
      invitation_id: 3,
      invited_phone: '511122233',
      sms_sent: true,
    }),
  ),
];
