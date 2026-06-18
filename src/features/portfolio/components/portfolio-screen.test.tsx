import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { PortfolioScreen } from './portfolio-screen';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  server.resetHandlers();
});

describe('PortfolioScreen', () => {
  it('renders the manager with the portfolio identity + projects', async () => {
    renderWithProviders(<PortfolioScreen />);

    expect(await screen.findByText('Burj Finishing Co.')).toBeInTheDocument();
    expect(screen.getByText('Finishing')).toBeInTheDocument();
    expect(await screen.findByText('Villa finishing — Al Narjis')).toBeInTheDocument();
  });

  it('shows the create panel when no portfolio exists yet (404 on both endpoints)', async () => {
    server.use(
      http.get('*/portfolios/me', () => HttpResponse.json({}, { status: 404 })),
      http.get('*/portfolios/my', () => HttpResponse.json({}, { status: 404 })),
    );
    renderWithProviders(<PortfolioScreen />);

    expect(await screen.findByText('Create your portfolio')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create portfolio' })).toBeInTheDocument();
  });

  it('adds a specialty chip via the + button (Controller-wired field)', async () => {
    server.use(
      http.get('*/portfolios/me', () => HttpResponse.json({}, { status: 404 })),
      http.get('*/portfolios/my', () => HttpResponse.json({}, { status: 404 })),
    );
    renderWithProviders(<PortfolioScreen />);

    const input = await screen.findByLabelText('Specialties');
    fireEvent.change(input, { target: { value: 'Tiling' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add specialty' }));

    expect(await screen.findByText('Tiling')).toBeInTheDocument();
  });

  it('shows an error + retry when the portfolio fails to load', async () => {
    server.use(http.get('*/portfolios/me', () => HttpResponse.json({}, { status: 500 })));
    renderWithProviders(<PortfolioScreen />);

    expect(await screen.findByText("Couldn't load your portfolio")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('opens the add-project modal from "Add work"', async () => {
    renderWithProviders(<PortfolioScreen />);

    fireEvent.click(await screen.findByRole('button', { name: 'Add work' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add a project')).toBeInTheDocument();
    expect(screen.getByLabelText('Project title')).toBeInTheDocument();
  });

  it('opens the edit-project modal pre-filled from the card', async () => {
    renderWithProviders(<PortfolioScreen />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    expect(await screen.findByText('Edit project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Villa finishing — Al Narjis')).toBeInTheDocument();
  });

  it('confirms a project delete', async () => {
    renderWithProviders(<PortfolioScreen />);

    const card = await screen.findByText('Villa finishing — Al Narjis');
    expect(card).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Delete Villa finishing/ }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete project' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('opens the edit-portfolio modal from "Edit info"', async () => {
    renderWithProviders(<PortfolioScreen />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit info' }));
    expect(await screen.findByText('Edit portfolio')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Burj Finishing Co.')).toBeInTheDocument();
  });
});
