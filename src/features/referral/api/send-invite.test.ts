import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { InviteError, sendInvite } from './send-invite';

const INVITE_URL = '*/users/me/referral/invite';

describe('sendInvite', () => {
  it('returns the parsed invite result and sends the normalised national phone body', async () => {
    let received: unknown;
    server.use(
      http.post(INVITE_URL, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ success: true, invited_phone: '512345678', sms_sent: true });
      }),
    );

    // A pasted +966 form must reach the backend as the national `5XXXXXXXX` body.
    const result = await sendInvite({ phoneNumber: '+966512345678' });

    expect(received).toEqual({ phoneNumber: '512345678' });
    expect(result).toEqual({ invitedPhone: '512345678', smsSent: true });
  });

  it('maps a success:false body (HTTP 200) to a typed InviteError with its code', async () => {
    server.use(
      http.post(INVITE_URL, () =>
        HttpResponse.json({ success: false, error_code: 'ALREADY_USER', message: 'Existing user' }),
      ),
    );
    const err = await sendInvite({ phoneNumber: '512345678' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(InviteError);
    expect((err as InviteError).code).toBe('ALREADY_USER');
  });

  it('maps a 4xx error_code body to the matching InviteError code', async () => {
    server.use(
      http.post(INVITE_URL, () =>
        HttpResponse.json({ success: false, error_code: 'RATE_LIMIT' }, { status: 429 }),
      ),
    );
    const err = await sendInvite({ phoneNumber: '512345678' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(InviteError);
    expect((err as InviteError).code).toBe('RATE_LIMIT');
  });

  it('falls back to a GENERIC InviteError when the failure carries no known code', async () => {
    server.use(http.post(INVITE_URL, () => new HttpResponse(null, { status: 500 })));
    const err = await sendInvite({ phoneNumber: '512345678' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(InviteError);
    expect((err as InviteError).code).toBe('GENERIC');
  });

  it('rejects a non-Saudi number before it reaches the network', async () => {
    await expect(sendInvite({ phoneNumber: '12345' })).rejects.toThrow();
  });
});
