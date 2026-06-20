import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { buildOwnerEditFormData, responseToFormValues } from '../lib/owner-edit-mapping';

import { getOwnerEdit } from './get-owner-edit';

/**
 * Attach photos to an already-created project the SAME way manual creation does — as
 * `images` parts the backend stores in the project's `files[]` (what the images
 * gallery renders). AI projects are created JSON-first (POST /v1/projects/from-ai),
 * so the photos are added in a second step through the owner-edit PUT (the RN
 * OwnerProjectEditScreen FormData branch). The project's current owner-edit fields are
 * loaded and round-tripped so the full-update PUT never wipes them, and the new files
 * ride along as `images`. Returns the number of photos sent (0 when there are none).
 *
 * Best-effort by contract: callers (the AI publish) swallow failures so a photo
 * upload never blocks the published project.
 */
export async function addProjectImages(
  projectId: number,
  photos: readonly File[],
): Promise<number> {
  if (photos.length === 0) return 0;
  const current = await getOwnerEdit(projectId);
  const body = buildOwnerEditFormData(responseToFormValues(current), photos);
  const path = API_ENDPOINTS.PROJECTS.OWNER_EDIT.replace(':id', String(projectId));
  await apiClient.put<unknown>(path, { body });
  return photos.length;
}
