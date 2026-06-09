'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type UseFormReturn, useForm } from 'react-hook-form';

import { ApiError } from '@/lib/api-client';

import { useSubmitBid } from '../../api/create-bid';
import {
  submitOfferFormSchema,
  toCreateBidRequest,
  type SubmittedOffer,
  type SubmitOfferFormValues,
} from '../../schemas/submit-offer.schema';

const EMPTY_VALUES: SubmitOfferFormValues = { proposedBudget: '', durationWeeks: '', comment: '' };

/** Maps backend bid field names to the form's field names for inline error display. */
const SERVER_FIELD_MAP: Record<string, keyof SubmitOfferFormValues> = {
  proposedBudget: 'proposedBudget',
  estimatedDurationDays: 'durationWeeks',
  comment: 'comment',
};

type Options = {
  /** Pre-fills the form (e.g. when re-opened via "Edit offer"). */
  defaultValues?: SubmitOfferFormValues;
  /** When editing, the bid to withdraw before posting the new one (delete-then-create). */
  replaceBidId?: number;
  /** Called once the bid POSTs successfully, so the panel can show the status card. */
  onSubmitted?: (offer: SubmittedOffer) => void;
};

/** Form state + submit handler for the submit-offer card; posts via `useSubmitBid`. */
export function useSubmitOffer(projectId: number, options: Options = {}) {
  const form = useForm<SubmitOfferFormValues>({
    resolver: zodResolver(submitOfferFormSchema),
    defaultValues: options.defaultValues ?? EMPTY_VALUES,
  });
  const mutation = useSubmitBid();

  const onSubmit = form.handleSubmit((values) => {
    const request = toCreateBidRequest(values, projectId);
    mutation.mutate(
      { request, replaceBidId: options.replaceBidId },
      {
        onSuccess: (data) =>
          options.onSubmitted?.({
            id: data.id,
            values,
            request,
            status: data.status,
            createdAt: data.createdAt,
          }),
        onError: (err) => applyServerError(form, err),
      },
    );
  });

  return { form, onSubmit, isPending: mutation.isPending };
}

function applyServerError(form: UseFormReturn<SubmitOfferFormValues>, err: unknown): void {
  if (err instanceof ApiError && err.fieldErrors) {
    let mapped = false;
    for (const [key, message] of Object.entries(err.fieldErrors)) {
      const field = SERVER_FIELD_MAP[key];
      if (field) {
        form.setError(field, { message });
        mapped = true;
      }
    }
    if (mapped) return;
  }
  form.setError('root', { message: 'dashboard.jobOffer.form.errorGeneric' });
}
