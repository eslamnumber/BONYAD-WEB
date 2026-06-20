import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { uploadProfileImage } from './upload-profile-image';

function file(name = 'me.jpg') {
  return new File([new Uint8Array([1, 2, 3])], name, { type: 'image/jpeg' });
}

describe('uploadProfileImage', () => {
  it('POSTs multipart with a `profileImage` field and returns the new path', async () => {
    let fieldName = '';
    server.use(
      http.post('*/users/update-profile-image', async ({ request }) => {
        const form = await request.formData();
        fieldName = form.has('profileImage') ? 'profileImage' : '';
        return HttpResponse.json({ profileImage: 'https://cdn/new.jpg' });
      }),
    );
    expect(await uploadProfileImage(file())).toBe('https://cdn/new.jpg');
    expect(fieldName).toBe('profileImage');
  });

  it('returns undefined when the response omits profileImage', async () => {
    server.use(http.post('*/users/update-profile-image', () => HttpResponse.json({ ok: true })));
    expect(await uploadProfileImage(file())).toBeUndefined();
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.post('*/users/update-profile-image', () =>
        HttpResponse.json(
          { messageEn: 'Too big', messageAr: 'كبير جدًا', errorCode: 'SIZE' },
          { status: 400 },
        ),
      ),
    );
    const err = await uploadProfileImage(file()).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).errorCode).toBe('SIZE');
  });
});
