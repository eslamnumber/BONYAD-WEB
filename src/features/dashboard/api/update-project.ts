import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { formValuesToPayload } from '../lib/owner-edit-mapping';
import { type OwnerEditFormValues } from '../schemas/owner-edit';

/**
 * Save an owner's pending-project edits. Mirrors the RN call site
 * website-bonyad/src/screens/projects/general/OwnerProjectEditScreen.tsx
 * (`handleSave`, JSON branch) — PUT /projects/:id/owner-edit. The body is built
 * and validated by {@link formValuesToPayload} (strict {@link ownerEditPayloadSchema},
 * hard rule 1). Photo *editing* is deferred — existing images are round-tripped so
 * they survive. Browser calls go through `/api/proxy/*`, which attaches the token.
 */
export async function updateProject(id: number, values: OwnerEditFormValues): Promise<void> {
  const body = formValuesToPayload(values);
  const path = API_ENDPOINTS.PROJECTS.OWNER_EDIT.replace(':id', String(id));
  await apiClient.put<unknown>(path, { body });
}

export type UpdateProjectVars = { id: number; values: OwnerEditFormValues };

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateProjectVars>({
    mutationFn: ({ id, values }) => updateProject(id, values),
    // Edits change the detail + owner-edit caches; drop every projects query.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}
