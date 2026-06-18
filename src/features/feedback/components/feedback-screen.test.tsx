import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { FeedbackScreen } from './feedback-screen';

const mine = (body: Parameters<typeof HttpResponse.json>[0]) =>
  http.get('*/app-feedback/mine', () => HttpResponse.json(body));

beforeAll(async () => {
  await i18n.changeLanguage('en');
  useAuthStore.setState({ user: { id: 1, role: 'USER', name: 'Sara' }, isAuthenticated: true });
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('FeedbackScreen', () => {
  it('renders the heading and a submitted feedback card (default handler)', async () => {
    renderWithProviders(<FeedbackScreen />);

    expect(screen.getByRole('heading', { name: 'My feedback', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Dark mode please')).toBeInTheDocument();
    expect(screen.getByText('Reviewed')).toBeInTheDocument();
    expect(screen.getByText('Suggestion')).toBeInTheDocument();
    expect(screen.getByText('Note from the team')).toBeInTheDocument();
  });

  it('shows the empty state when there is no feedback', async () => {
    server.use(mine({ success: true, count: 0, feedback: [] }));
    renderWithProviders(<FeedbackScreen />);

    expect(await screen.findByText('No feedback yet')).toBeInTheDocument();
  });

  it('opens the compose modal and gates submit on a non-blank message', async () => {
    renderWithProviders(<FeedbackScreen />);
    await screen.findByText('Dark mode please');

    fireEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
    expect(await screen.findByRole('heading', { name: 'Send feedback' })).toBeInTheDocument();

    const submit = screen.getByRole('button', { name: 'Submit' });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Great app!' } });
    expect(submit).toBeEnabled();
  });
});
