import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

export type ProjectAttachment = {
  id?: number;
  projectId?: number;
  fileUrl?: string;
  fileName?: string;
};

function attachmentsPath(projectId: number): string {
  return API_ENDPOINTS.AI.ATTACHMENTS.replace(':id', String(projectId));
}

/** Upload one project photo (multipart, iOS `ProjectAttachmentService.uploadAttachment`). */
export async function uploadAttachment(
  projectId: number,
  file: File,
  source = 'manual',
): Promise<ProjectAttachment> {
  const form = new FormData();
  form.append('file', file, file.name);
  form.append('source', source);
  return apiClient.post<ProjectAttachment>(attachmentsPath(projectId), { body: form });
}

/**
 * Upload every selected photo, best-effort (iOS runs uploads detached in the
 * background — a failed upload never blocks the success screen). Returns the count
 * that succeeded.
 */
export async function uploadAttachments(projectId: number, files: File[]): Promise<number> {
  let uploaded = 0;
  for (const file of files) {
    try {
      await uploadAttachment(projectId, file);
      uploaded += 1;
    } catch {
      // best-effort — skip a failed upload.
    }
  }
  return uploaded;
}
