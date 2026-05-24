import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';
import { normalizePhoneForApi } from '@/lib/saudi-phone';

import {
  contactRequestSchema,
  type ContactFormValues,
  type ContactResponse,
} from '../schemas/contact.schema';

export async function submitContact(values: ContactFormValues): Promise<ContactResponse> {
  const body = contactRequestSchema.parse({
    email: values.email.trim(),
    phoneNumber: normalizePhoneForApi(values.phone),
    title: values.title.trim(),
    description: values.description.trim(),
  });
  return apiClient.post<ContactResponse>(API_ENDPOINTS.CONTACT.SUBMIT, { body });
}

export function useSubmitContact() {
  return useMutation<ContactResponse, Error, ContactFormValues>({ mutationFn: submitContact });
}
