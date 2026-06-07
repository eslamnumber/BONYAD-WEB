import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { sendMessageWithFile } from './send-message-with-file';

const ENDPOINT = '*/chat/send-with-file';

function imageFile(name = 'photo.png') {
  return new File([new Uint8Array([1, 2, 3])], name, { type: 'image/png' });
}

describe('sendMessageWithFile', () => {
  it('posts multipart FormData with the file + caption and returns the message', async () => {
    let captured: FormData | undefined;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        captured = await request.formData();
        return HttpResponse.json({ id: 7, roomId: 'room-1', fileUrl: '/uploads/photo.png' });
      }),
    );

    const result = await sendMessageWithFile({
      roomId: 'room-1',
      receiverId: 42,
      file: imageFile(),
      content: 'look at this',
    });

    expect(captured?.get('receiverId')).toBe('42');
    expect(captured?.get('content')).toBe('look at this');
    const sent = captured?.get('file');
    expect(sent).toBeInstanceOf(File);
    expect((sent as File).name).toBe('photo.png');
    expect(result).toEqual({ id: 7, roomId: 'room-1', fileUrl: '/uploads/photo.png' });
  });

  it('falls back to the [Attachment] placeholder when no caption is given', async () => {
    let captured: FormData | undefined;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        captured = await request.formData();
        return HttpResponse.json({ id: 8 });
      }),
    );

    await sendMessageWithFile({ roomId: 'room-1', receiverId: 42, file: imageFile() });

    expect(captured?.get('content')).toBe('[Attachment]');
    expect(captured?.has('projectId')).toBe(false);
  });

  it('trims the caption and forwards projectId when present', async () => {
    let captured: FormData | undefined;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        captured = await request.formData();
        return HttpResponse.json({ id: 9 });
      }),
    );

    await sendMessageWithFile({
      roomId: 'room-1',
      receiverId: 42,
      file: imageFile(),
      content: '  hi  ',
      projectId: 5,
    });

    expect(captured?.get('content')).toBe('hi');
    expect(captured?.get('projectId')).toBe('5');
  });

  it('throws ApiError on a 4xx from the backend', async () => {
    server.use(
      http.post(ENDPOINT, () =>
        HttpResponse.json({ messageEn: 'Too big.', errorCode: 'FILE_TOO_LARGE' }, { status: 413 }),
      ),
    );

    const err = await sendMessageWithFile({
      roomId: 'r',
      receiverId: 1,
      file: imageFile(),
    }).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(413);
    expect((err as ApiError).errorCode).toBe('FILE_TOO_LARGE');
  });
});
