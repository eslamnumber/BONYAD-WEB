import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import type { ProjectPhase } from '../../schemas/project-phase';

import { ChangeRequestsSection } from './change-requests-section';
import { useChangeRequestViews } from './use-change-request-views';

const PHASES: ProjectPhase[] = [
  {
    id: 1,
    phaseNumber: 1,
    title: 'Foundations',
    description: 'Footings',
    timeSpentDays: 10,
    moneySpent: 25000,
  },
];

/** The section needs screen-owned modal state — a tiny harness supplies it. */
function Harness() {
  const views = useChangeRequestViews();
  return <ChangeRequestsSection projectId={5} phases={PHASES} views={views} />;
}

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('ChangeRequestsSection — active list', () => {
  it('renders the active negotiation card and the request button', async () => {
    renderWithProviders(<Harness />);
    expect(
      await screen.findByText('Please add a waterproofing phase before tiling.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Request modification' })).toBeInTheDocument();
  });

  it('shows the empty state when there are no active requests', async () => {
    server.use(
      http.get('*/change-requests/project/:projectId/active', () => HttpResponse.json([])),
    );
    renderWithProviders(<Harness />);
    expect(await screen.findByText('No change requests yet.')).toBeInTheDocument();
  });

  it('shows the error state when the fetch fails', async () => {
    server.use(
      http.get('*/change-requests/project/:projectId/active', () =>
        HttpResponse.json({ messageEn: 'nope' }, { status: 500 }),
      ),
    );
    renderWithProviders(<Harness />);
    expect(await screen.findByText("Couldn't load change requests.")).toBeInTheDocument();
  });
});

describe('ChangeRequestsSection — create flow', () => {
  it('opens the form, posts the description + phase changes, then closes', async () => {
    let sentBody: Record<string, unknown> = {};
    server.use(
      http.post('*/change-requests/project/:projectId/request', async ({ request }) => {
        sentBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ changeRequestId: 102, status: 'PENDING' }, { status: 201 });
      }),
    );
    renderWithProviders(<Harness />);

    fireEvent.click(await screen.findByRole('button', { name: 'Request modification' }));
    const description = await screen.findByLabelText("What you'd like to change");
    fireEvent.change(description, { target: { value: 'Add a balcony' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Send request' })).not.toBeInTheDocument(),
    );
    expect(sentBody.description).toBe('Add a balcony');
  });

  it('keeps the submit button disabled until a description is entered', async () => {
    renderWithProviders(<Harness />);
    fireEvent.click(await screen.findByRole('button', { name: 'Request modification' }));
    expect(screen.getByRole('button', { name: 'Send request' })).toBeDisabled();
  });
});

describe('ChangeRequestsSection — thread + agree', () => {
  it('opens the thread and records an agreement, then closes', async () => {
    let agreed = false;
    server.use(
      http.post('*/change-requests/:id/agree', () => {
        agreed = true;
        return HttpResponse.json({ userAgreed: true, technicianAgreed: false, bothAgreed: false });
      }),
    );
    renderWithProviders(<Harness />);

    fireEvent.click(await screen.findByRole('button', { name: 'View details' }));
    expect(await screen.findByText('Negotiation')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Agree' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Agree & sign' }));

    await waitFor(() => expect(screen.queryByText('Negotiation')).not.toBeInTheDocument());
    expect(agreed).toBe(true);
  });
});
