import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Blog } from '../schemas/blog';

export const blogQueryKey = (id: number | string) => ['blog', String(id)] as const;

export async function getBlog(id: number | string): Promise<Blog> {
  const path = API_ENDPOINTS.BLOGS.DETAILS.replace(':id', String(id));
  return apiClient.get<Blog>(path);
}

export function useBlog(id: number | string | undefined) {
  return useQuery({
    queryKey: blogQueryKey(id ?? ''),
    queryFn: () => getBlog(id as number | string),
    enabled: id !== undefined && id !== '',
    staleTime: 1000 * 60 * 30,
  });
}
