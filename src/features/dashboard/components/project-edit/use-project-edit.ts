'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useUpdateProject } from '../../api/update-project';
import { ownerEditFormSchema, type OwnerEditFormValues } from '../../schemas/owner-edit';

/**
 * Form state + submit handler for the project-edit form. Validates with
 * {@link ownerEditFormSchema} (RHF) and saves via {@link useUpdateProject} (which
 * maps to the strict PUT payload). A failed save surfaces a translated root error;
 * `onSaved` fires on success so the screen can navigate back.
 */
export function useProjectEdit(
  projectId: number,
  defaultValues: OwnerEditFormValues,
  onSaved: () => void,
) {
  const form = useForm<OwnerEditFormValues>({
    resolver: zodResolver(ownerEditFormSchema),
    defaultValues,
  });
  const mutation = useUpdateProject();

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      { id: projectId, values },
      {
        onSuccess: () => onSaved(),
        onError: () =>
          form.setError('root', { message: 'dashboard.projectEdit.errors.saveFailed' }),
      },
    );
  });

  return { form, onSubmit, isPending: mutation.isPending };
}
