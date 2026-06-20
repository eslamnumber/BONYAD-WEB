import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { EditableAvatar } from './editable-avatar';

function file(type = 'image/jpeg', name = 'me.jpg') {
  return new File([new Uint8Array([1, 2, 3])], name, { type });
}

function fileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error('file input not found');
  return input as HTMLInputElement;
}

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('EditableAvatar', () => {
  it('pops a top-of-screen toast after a successful photo upload', async () => {
    server.use(
      http.post('*/users/update-profile-image', () =>
        HttpResponse.json({ profileImage: 'https://cdn/new.jpg' }),
      ),
      http.get('*/users/profile', () => HttpResponse.json({ id: 1, name: 'Ahmed' })),
    );
    const { container } = renderWithProviders(<EditableAvatar name="Ahmed" />);

    fireEvent.change(fileInput(container), { target: { files: [file()] } });

    expect(await screen.findByRole('status')).toHaveTextContent('Your profile photo was updated.');
  });

  it('shows an inline error and uploads nothing for a non-image file', () => {
    const { container } = renderWithProviders(<EditableAvatar name="Ahmed" />);

    fireEvent.change(fileInput(container), {
      target: { files: [file('application/pdf', 'doc.pdf')] },
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Please choose an image file.');
    expect(screen.queryByRole('status')).toBeNull();
  });
});
