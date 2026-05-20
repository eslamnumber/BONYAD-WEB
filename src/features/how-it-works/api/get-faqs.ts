import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Faq } from '../schemas/faq';

export const faqsQueryKey = () => ['faqs'] as const;

export async function getFaqs(): Promise<Faq[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.FAQS.LIST);
  if (!Array.isArray(data)) return [];
  return [...(data as Faq[])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id,
  );
}

export function useFaqs() {
  return useQuery({
    queryKey: faqsQueryKey(),
    queryFn: getFaqs,
    staleTime: 1000 * 60 * 60,
  });
}
