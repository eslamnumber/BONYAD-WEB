import type { UseQueryResult } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { type TermsAndConditions } from '../schemas/terms.schema';

import { TermsModal } from './terms-modal';

type Q = UseQueryResult<TermsAndConditions | null>;

const query = (over: Partial<Q>): Q =>
  ({ data: null, isPending: false, isError: false, refetch: vi.fn(), ...over }) as unknown as Q;

const TERMS: TermsAndConditions = {
  id: 17,
  version: '1.2',
  contentEn: '<h1>Heading</h1><p>Sample English terms body.</p>',
  contentAr: '<p>نص عربي</p>',
};

function open(q: Q) {
  return renderWithProviders(<TermsModal open onClose={vi.fn()} locale="en" query={q} />);
}

describe('TermsModal', () => {
  it('renders the loaded document in a fully-sandboxed iframe with the body + version', async () => {
    open(query({ data: TERMS }));
    const frame = (await screen.findByTitle(/terms & conditions document/i)) as HTMLIFrameElement;
    expect(frame.getAttribute('sandbox')).toBe('');
    expect(frame.getAttribute('srcdoc')).toContain('Sample English terms body.');
    expect(screen.getByText(/version 1\.2/i)).toBeInTheDocument();
  });

  it('shows the unavailable state when there are no active terms', () => {
    open(query({ data: null }));
    expect(screen.getByText(/terms aren't available yet/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/terms & conditions document/i)).not.toBeInTheDocument();
  });

  it('offers a retry that refetches on error', () => {
    const refetch = vi.fn();
    open(query({ isError: true, refetch: refetch as Q['refetch'] }));
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalledOnce();
  });
});
