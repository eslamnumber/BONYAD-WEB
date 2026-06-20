import { http, HttpResponse } from 'msw';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { GET, POST } from './route';

function ctx(path: string[]) {
  return { params: Promise.resolve({ path }) };
}

function req(url: string, token?: string) {
  const r = new NextRequest(url);
  if (token) r.cookies.set('bonyad-token', token);
  return r;
}

describe('proxy route — GET', () => {
  it('attaches the cookie token as a Bearer header and returns the backend JSON', async () => {
    let auth: string | null = null;
    server.use(
      http.get('*/projects', ({ request }) => {
        auth = request.headers.get('authorization');
        return HttpResponse.json([{ id: 1 }]);
      }),
    );
    const res = await GET(req('http://localhost/api/proxy/projects', 'tok'), ctx(['projects']));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 1 }]);
    expect(auth).toBe('Bearer tok');
  });

  it('clears the session cookie on a 401 from the backend', async () => {
    server.use(
      http.get('*/projects', () =>
        HttpResponse.json({ errorCode: 'UNAUTHORIZED' }, { status: 401 }),
      ),
    );
    const res = await GET(req('http://localhost/api/proxy/projects', 'tok'), ctx(['projects']));
    expect(res.status).toBe(401);
    expect(res.headers.get('set-cookie')).toContain('bonyad-token=');
  });
});

describe('proxy route — POST x-www-form-urlencoded', () => {
  it('forwards a urlencoded body verbatim (POST /signatures) instead of dropping it', async () => {
    let received: URLSearchParams | undefined;
    let contentType: string | null = null;
    server.use(
      http.post('*/signatures', async ({ request }) => {
        contentType = request.headers.get('content-type');
        received = new URLSearchParams(await request.text());
        return HttpResponse.json({ id: 7 }, { status: 201 });
      }),
    );

    const request = new NextRequest('http://localhost/api/proxy/signatures', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ projectId: '102', language: 'AR' }).toString(),
    });
    request.cookies.set('bonyad-token', 'tok');

    const res = await POST(request, ctx(['signatures']));

    expect(res.status).toBe(200);
    expect(contentType).toContain('application/x-www-form-urlencoded');
    expect(received?.get('projectId')).toBe('102');
    expect(received?.get('language')).toBe('AR');
  });
});

describe('proxy route — POST multipart', () => {
  it('forwards a multipart file upload with the Bearer token attached', async () => {
    let received: FormData | undefined;
    let auth: string | null = null;
    server.use(
      http.post('*/chat/send-with-file', async ({ request }) => {
        auth = request.headers.get('authorization');
        received = await request.formData();
        return HttpResponse.json({ id: 11, fileUrl: '/uploads/p.png' });
      }),
    );

    const fd = new FormData();
    fd.append('receiverId', '42');
    fd.append('content', '[Attachment]');
    fd.append(
      'file',
      new File([new Uint8Array([1, 2, 3])], 'p.png', { type: 'image/png' }),
      'p.png',
    );
    const request = new NextRequest('http://localhost/api/proxy/chat/send-with-file', {
      method: 'POST',
      body: fd,
    });
    request.cookies.set('bonyad-token', 'tok');

    const res = await POST(request, ctx(['chat', 'send-with-file']));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 11, fileUrl: '/uploads/p.png' });
    expect(auth).toBe('Bearer tok');
    expect(received?.get('receiverId')).toBe('42');
    expect((received?.get('file') as File).name).toBe('p.png');
  });
});
