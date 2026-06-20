import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { addProjectImages } from './add-project-images';

function jpeg(name: string): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type: 'image/jpeg' });
}

const OWNER_EDIT = {
  project: {
    description: 'Villa\n\nFull finishing',
    budget: 100000,
    address: 'Riyadh',
    files: ['old.jpg'],
  },
  phases: [{ id: 1, phaseNumber: 1, description: 'Foundations', timeSpentDays: 14 }],
};

describe('addProjectImages', () => {
  it('uploads the new photos as `images` via the owner-edit PUT and returns the count', async () => {
    let sent: FormData | null = null;
    server.use(
      http.get('*/projects/:id/owner-edit', () => HttpResponse.json(OWNER_EDIT)),
      http.put('*/projects/:id/owner-edit', async ({ request }) => {
        sent = await request.formData();
        return HttpResponse.json({ ok: true });
      }),
    );

    const count = await addProjectImages(7, [jpeg('a.jpg'), jpeg('b.jpg')]);
    const body = sent as unknown as FormData;

    expect(count).toBe(2);
    expect(body.getAll('images').map((f) => (f as File).name)).toEqual(['a.jpg', 'b.jpg']);
    // The project's existing images round-trip so the full-update PUT keeps them.
    expect(body.getAll('existingPhotos').map(String)).toContain('old.jpg');
  });

  it('returns 0 and makes no request when there are no photos', async () => {
    // No handlers registered: any stray request would error, so this proves none is made.
    await expect(addProjectImages(7, [])).resolves.toBe(0);
  });

  it('rejects when the owner-edit PUT fails (caller treats it as best-effort)', async () => {
    server.use(
      http.get('*/projects/:id/owner-edit', () => HttpResponse.json(OWNER_EDIT)),
      http.put('*/projects/:id/owner-edit', () => new HttpResponse(null, { status: 400 })),
    );
    await expect(addProjectImages(7, [jpeg('a.jpg')])).rejects.toThrow();
  });
});
