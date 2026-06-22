import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { ContractViewButton } from './contract-view-button';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('ContractViewButton', () => {
  it('opens the in-app viewer framing the same-origin stream, with a download fallback', async () => {
    server.use(
      http.post('*/contracts/test/generate-pdf', () =>
        HttpResponse.json({ downloadUrl: 'https://cdn.example.com/c/102.pdf' }),
      ),
      // happy-dom loads the iframe src; answer the same-origin stream so MSW's
      // `onUnhandledRequest: 'error'` strategy doesn't flag the framed request.
      http.get('*/api/contract-pdf', () =>
        HttpResponse.arrayBuffer(new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer as ArrayBuffer, {
          headers: { 'content-type': 'application/pdf' },
        }),
      ),
    );
    renderWithProviders(<ContractViewButton projectId={102} technicianId={9} />);

    fireEvent.click(screen.getByRole('button', { name: 'View contract' }));

    // The labelled dialog opens.
    expect(screen.getByRole('dialog', { name: 'Service contract' })).toBeInTheDocument();
    // The PDF is framed from the same-origin route — never the cross-origin backend URL
    // (the dashboard CSP would block that).
    expect(screen.getByTitle('Contract PDF')).toHaveAttribute(
      'src',
      '/api/contract-pdf?projectId=102&technicianId=9&language=EN',
    );
    // Download stays available as a fallback inside the viewer.
    expect(
      await screen.findByRole('button', { name: 'Download contract (PDF)' }),
    ).toBeInTheDocument();
  });

  it('is disabled and opens nothing when no technician is assigned', () => {
    renderWithProviders(<ContractViewButton projectId={102} technicianId={null} />);
    expect(screen.getByRole('button', { name: 'View contract' })).toBeDisabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
