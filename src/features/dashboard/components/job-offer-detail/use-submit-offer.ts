'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type UseFormReturn, useForm } from 'react-hook-form';

import { ApiError } from '@/lib/api-client';

import { useCreateBid } from '../../api/create-bid';
import {
  submitOfferFormSchema,
  toCreateBidRequest,
  type SubmitOfferFormValues,
} from '../../schemas/submit-offer.schema';

/** Maps backend bid field names to the form's field names for inline error display. */
const SERVER_FIELD_MAP: Record<string, keyof SubmitOfferFormValues> = {
  proposedBudget: 'proposedBudget',
  estimatedDurationDays: 'durationMonths',
  comment: 'comment',
};

/** Form state + submit handler for the submit-offer card; posts via `useCreateBid`. */
export function useSubmitOffer(projectId: number) {
  const form = useForm<SubmitOfferFormValues>({
    resolver: zodResolver(submitOfferFormSchema),
    defaultValues: { proposedBudget: '', durationMonths: '', comment: '' },
  });
  const mutation = useCreateBid();

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(toCreateBidRequest(values, projectId), {
      onSuccess: () => form.reset(),
      onError: (err) => applyServerError(form, err),
    }),
  );

  return { form, onSubmit, isPending: mutation.isPending, isSuccess: mutation.isSuccess };
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
