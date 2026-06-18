import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { uploadPhoto, uploadPhotos } from './upload-photo';

function file(name = 'p.jpg') {
  return new File([new Uint8Array([1, 2, 3])], name, { type: 'image/jpeg' });
}

describe('uploadPhoto', () => {
  it('POSTs multipart with a `file` field and returns the photoUrl', async () => {
    let fieldName = '';
    server.use(
      http.post('*/portfolios/projects/upload-photo', async ({ request }) => {
        const form = await request.formData();
        fieldName = form.has('file') ? 'file' : '';
        return HttpResponse.json({ photoUrl: 'https://cdn/u.jpg' });
      }),
    );
    expect(await uploadPhoto(file())).toBe('https://cdn/u.jpg');
    expect(fieldName).toBe('file');
  });

  it('falls back to imageUrl / url field names', async () => {
    server.use(
      http.post('*/portfolios/projects/upload-photo', () =>
        HttpResponse.json({ imageUrl: 'https://cdn/i.jpg' }),
      ),
    );
    expect(await uploadPhoto(file())).toBe('https://cdn/i.jpg');
  });

  it('throws when the response has no URL', async () => {
    server.use(
      http.post('*/portfolios/projects/upload-photo', () => HttpResponse.json({ ok: true })),
    );
    await expect(uploadPhoto(file())).rejects.toThrow(/photo URL/);
  });

  it('throws ApiError on 400', async () => {
    server.use(
      http.post('*/portfolios/projects/upload-photo', () =>
        HttpResponse.json({ messageEn: 'Too big', errorCode: 'SIZE' }, { status: 400 }),
      ),
    );
    const err = await uploadPhoto(file()).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
  });

  it('uploadPhotos returns URLs in order', async () => {
    const urls = ['https://cdn/1.jpg', 'https://cdn/2.jpg'];
    let i = 0;
    server.use(
      http.post('*/portfolios/projects/upload-photo', () =>
        HttpResponse.json({ photoUrl: urls[i++] }),
      ),
    );
    expect(await uploadPhotos([file('1.jpg'), file('2.jpg')])).toEqual(urls);
  });
});
