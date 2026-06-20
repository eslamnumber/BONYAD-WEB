import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { uploadAttachment, uploadAttachments } from './upload-attachment';

function jpeg(name: string): File {
  return new File(['data'], name, { type: 'image/jpeg' });
}

describe('uploadAttachment', () => {
  it('posts multipart with file + source fields to the project attachments path', async () => {
    let fileName: unknown = null;
    let source: unknown = null;
    server.use(
      http.post('*/v1/projects/7/attachments', async ({ request }) => {
        const form = await request.formData();
        fileName = (form.get('file') as File)?.name;
        source = form.get('source');
        return HttpResponse.json({ id: 1, projectId: 7, fileName: 'a.jpg' });
      }),
    );

    const res = await uploadAttachment(7, jpeg('a.jpg'));
    expect(fileName).toBe('a.jpg');
    expect(source).toBe('manual');
    expect(res.id).toBe(1);
  });
});

describe('uploadAttachments', () => {
  it('uploads each file best-effort and returns the success count', async () => {
    server.use(
      http.post('*/v1/projects/7/attachments', async ({ request }) => {
        const form = await request.formData();
        return (form.get('file') as File)?.name === 'bad.jpg'
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json({ id: 1 });
      }),
    );

    const count = await uploadAttachments(7, [jpeg('ok.jpg'), jpeg('bad.jpg')]);
    expect(count).toBe(1);
  });
});
