import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { ContractDownloadButton } from './contract-download-button';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ContractDownloadButton', () => {
  it('pre-generates the PDF, enables, and opens the returned URL on click', async () => {
    const opened: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      opened.push(this.href);
    });
    server.use(
      http.post('*/contracts/test/generate-pdf', () =>
        HttpResponse.json({ downloadUrl: 'https://cdn.example.com/c/102.pdf' }),
      ),
    );
    renderWithProviders(<ContractDownloadButton projectId={102} technicianId={9} />);

    // findByRole with this name resolves only once the label flips from "Preparing…".
    const btn = await screen.findByRole('button', { name: 'Download contract (PDF)' });
    await waitFor(() => expect(btn).toBeEnabled());

    fireEvent.click(btn);
    expect(opened).toContain('https://cdn.example.com/c/102.pdf');
  });

  it('is disabled when no technician is assigned (cannot generate)', () => {
    renderWithProviders(<ContractDownloadButton projectId={102} technicianId={null} />);
    expect(screen.getByRole('button', { name: 'Download contract (PDF)' })).toBeDisabled();
  });

  it('shows a retryable error when generation fails', async () => {
    server.use(
      http.post('*/contracts/test/generate-pdf', () =>
        HttpResponse.json({ messageEn: 'Project not in signing stage.' }, { status: 409 }),
      ),
    );
    renderWithProviders(<ContractDownloadButton projectId={102} technicianId={9} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't prepare the pdf/i);
  });
});
