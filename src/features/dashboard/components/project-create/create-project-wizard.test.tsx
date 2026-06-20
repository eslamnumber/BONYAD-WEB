import { zodResolver } from '@hookform/resolvers/zod';
import { http, HttpResponse } from 'msw';
import { useForm } from 'react-hook-form';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import {
  createProjectFormSchema,
  defaultCreateProjectValues,
  type CreateProjectFormValues,
} from '../../schemas/create-project-form';

import { CreateProjectWizard } from './create-project-wizard';
import { StepAssignment } from './step-assignment';
import { StepBudget } from './step-budget';
import { StepLocation } from './step-location';
import { StepPhases } from './step-phases';
import { StepReview } from './step-review';
import { WizardProgressBar } from './wizard-progress-bar';
import { editGroupEnd } from './wizard-state';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/dashboard/projects/new',
  useSearchParams: () => new URLSearchParams(),
}));

/** A throwaway RHF instance so each step can be exercised in isolation. */
function useTestForm() {
  return useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: defaultCreateProjectValues(),
  });
}

function BudgetHarness() {
  return <StepBudget form={useTestForm()} />;
}
function PhasesHarness() {
  return <StepPhases form={useTestForm()} />;
}
function AssignmentHarness() {
  return <StepAssignment form={useTestForm()} />;
}
function LocationHarness() {
  return <StepLocation form={useTestForm()} />;
}
function ReviewHarness({ onEdit }: { onEdit: (step: number) => void }) {
  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      ...defaultCreateProjectValues(),
      serviceCategoryId: '1',
      projectName: 'Villa',
      description: 'A villa build',
      budget: '5000',
    },
  });
  return <StepReview form={form} onEdit={onEdit} />;
}

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

// Component code runs in jsdom and fetches through the same-origin proxy
// (`/api/proxy/*`), so the picker + category lookups need wildcard handlers
// (the default handlers are bound to the absolute backend URL).
beforeEach(() => {
  server.use(
    http.get('*/services/categories', () =>
      HttpResponse.json([{ id: 1, nameEn: 'Construction', nameAr: 'البناء' }]),
    ),
    http.get('*/users/technicians', () =>
      HttpResponse.json([{ id: 1, name: 'خالد اليوسف', averageRating: 4.9 }]),
    ),
    http.get('*/regions', () => HttpResponse.json([{ id: 1, nameEn: 'Riyadh', nameAr: 'الرياض' }])),
  );
});

describe('WizardProgressBar', () => {
  it('renders six segments and fills from the inline-end (flex-row-reverse)', () => {
    const { container } = renderWithProviders(<WizardProgressBar currentStep={1} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '2');
    expect(bar).toHaveAttribute('aria-valuemax', '6');
    expect(bar.className).toContain('flex-row-reverse');
    expect(container.querySelectorAll('span')).toHaveLength(6);
  });
});

describe('StepBudget', () => {
  it('shows timeline + budget + the no-budget toggle, which disables the budget field', () => {
    renderWithProviders(<BudgetHarness />);
    expect(screen.getByLabelText('Timeline')).toBeInTheDocument();
    const budget = screen.getByLabelText('Expected budget');
    expect(budget).not.toBeDisabled();
    fireEvent.click(screen.getByLabelText('No specified budget'));
    expect(budget).toBeDisabled();
  });
});

describe('StepPhases', () => {
  it('appends and removes phase rows', () => {
    renderWithProviders(<PhasesHarness />);
    expect(screen.getByText('Phase 1')).toBeInTheDocument();
    expect(screen.queryByText('Phase 2')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add phase' }));
    expect(screen.getByText('Phase 2')).toBeInTheDocument();
    // With more than one phase every row is removable; drop the last.
    const removeButtons = screen.getAllByRole('button', { name: 'Remove phase' });
    fireEvent.click(removeButtons[removeButtons.length - 1] as HTMLElement);
    expect(screen.queryByText('Phase 2')).not.toBeInTheDocument();
  });
});

describe('StepAssignment', () => {
  it('opens the technician picker on direct assignment and records the choice', async () => {
    renderWithProviders(<AssignmentHarness />);
    fireEvent.click(screen.getByRole('radio', { name: /Direct assignment/i }));

    expect(await screen.findByText('Choose a technician')).toBeInTheDocument();
    const chooseButtons = await screen.findAllByRole('button', { name: 'Choose' });
    expect(chooseButtons.length).toBeGreaterThan(0);
    fireEvent.click(chooseButtons[0] as HTMLElement);

    expect(await screen.findByText(/Selected:/)).toBeInTheDocument();
    expect(screen.queryByText('Choose a technician')).not.toBeInTheDocument();
  });
});

describe('StepLocation', () => {
  it('lists regions from /regions and records the picked city', async () => {
    renderWithProviders(<LocationHarness />);
    const cityTrigger = screen.getByText('Choose the city').closest('button');
    await waitFor(() => expect(cityTrigger).toBeEnabled());
    fireEvent.click(cityTrigger as HTMLElement);
    fireEvent.click(await screen.findByRole('option', { name: 'Riyadh' }));
    expect(screen.getByText('Riyadh')).toBeInTheDocument();
  });
});

describe('StepReview', () => {
  it('renders a card per section, resolves the category, and edits jump to the right step', async () => {
    const onEdit = vi.fn();
    renderWithProviders(<ReviewHarness onEdit={onEdit} />);

    expect(screen.getByRole('heading', { name: 'Project information' })).toBeInTheDocument();
    expect(screen.getByText('Budget & timeline')).toBeInTheDocument();
    expect(screen.getByText('Villa')).toBeInTheDocument();
    // The budget amount renders the Saudi Riyal glyph (sr-only "SAR"), not a text suffix.
    expect(screen.getByText('5000')).toBeInTheDocument();
    expect(screen.getByText('SAR')).toBeInTheDocument();
    // Category id 1 resolves to its name from the mocked /services/categories.
    expect(await screen.findByText('Construction')).toBeInTheDocument();

    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    expect(editButtons).toHaveLength(5);
    fireEvent.click(editButtons[0] as HTMLElement);
    expect(onEdit).toHaveBeenCalledWith(0);
  });
});

/** Drive a fresh wizard through all six content steps and land on the review summary. */
async function reachReview() {
  renderWithProviders(<CreateProjectWizard />);
  const categoryTrigger = screen.getByText('Choose a category').closest('button');
  await waitFor(() => expect(categoryTrigger).toBeEnabled());
  fireEvent.click(categoryTrigger as HTMLElement);
  fireEvent.click(await screen.findByRole('option', { name: 'Construction' }));
  fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'Villa' } });
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'A villa build.' } });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());
  const next = () => fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  next();
  await screen.findByText('Budget & timeline');
  next();
  await screen.findByText('Deliverables (optional)');
  next();
  await screen.findByText('Project phases (optional)');
  next();
  await screen.findByText('Assignment method');
  next();
  await screen.findByText('Offer deadline (optional)');
  next();
  await screen.findByRole('heading', { name: 'Review project' });
}

describe('editGroupEnd', () => {
  it('maps each step to itself except assignment (4), which extends through location (5)', () => {
    expect(editGroupEnd(0)).toBe(0);
    expect(editGroupEnd(1)).toBe(1);
    expect(editGroupEnd(4)).toBe(5);
    expect(editGroupEnd(5)).toBe(5);
  });
});

describe('CreateProjectWizard', () => {
  it('advances through every step to the review summary and shows Create', async () => {
    await reachReview();
    expect(screen.getByRole('button', { name: 'Create project' })).toBeInTheDocument();
    expect(screen.getByText('Villa')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '6');
  });

  it('edit-from-review returns to the summary on Save instead of stepping onward', async () => {
    await reachReview();
    // Edit the budget card (2nd) → jumps to the budget step, not a forward Next.
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1] as HTMLElement);
    expect(await screen.findByText('Budget & timeline')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Expected budget'), { target: { value: '7500' } });
    // The primary button now reads "Save" and returns straight to the summary.
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('heading', { name: 'Review project' })).toBeInTheDocument();
    expect(screen.getByText(/7500/)).toBeInTheDocument();
  });

  it('edit-from-review walks the assignment+location card before returning', async () => {
    await reachReview();
    // The assignment+details card (5th) edits step 4, then Next walks to step 5.
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[4] as HTMLElement);
    expect(await screen.findByText('Assignment method')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Offer deadline (optional)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('heading', { name: 'Review project' })).toBeInTheDocument();
  });

  it('gates Next until project info is complete, then advances to budget (progress 2/6)', async () => {
    renderWithProviders(<CreateProjectWizard />);
    // Next is disabled until the step-0 required fields are filled.
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    const categoryTrigger = screen.getByText('Choose a category').closest('button');
    await waitFor(() => expect(categoryTrigger).toBeEnabled());
    fireEvent.click(categoryTrigger as HTMLElement);
    fireEvent.click(await screen.findByRole('option', { name: 'Construction' }));
    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'Villa' } });

    // No field uses dir="auto" — trailing dots are handled by leading-punctuation copy.
    const description = screen.getByLabelText('Description');
    expect(description).not.toHaveAttribute('dir', 'auto');
    fireEvent.change(description, {
      target: { value: 'A detailed description of the villa project.' },
    });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Budget & timeline')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  });
});
