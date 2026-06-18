import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { type PhotoUploadResponseBody } from '../schemas/portfolio';

/**
 * Upload one project image and return its hosted URL. Mirrors the iOS upload
 * (PortfolioModels.swift:1013, AddPastProjectView.swift:394) — POST (multipart, field
 * `file`) /portfolios/projects/upload-photo → `{ photoUrl }`. `apiClient` passes the
 * `FormData` through untouched so fetch writes the multipart boundary, and the proxy
 * re-streams it with the Bearer attached. The form calls this once per picked image,
 * then sends the collected URLs to add/update-project. Response field is normalised
 * (`photoUrl ?? imageUrl ?? url`).
 */
export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const data = await apiClient.post<PhotoUploadResponseBody>(API_ENDPOINTS.PORTFOLIO.UPLOAD_PHOTO, {
    body: form,
  });
  const url = data.photoUrl ?? data.imageUrl ?? data.url;
  if (!url) throw new Error('Upload did not return a photo URL');
  return url;
}

/** Upload several images in order, returning their URLs (skips any that fail-fast throws). */
export async function uploadPhotos(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadPhoto(file));
  }
  return urls;
}
