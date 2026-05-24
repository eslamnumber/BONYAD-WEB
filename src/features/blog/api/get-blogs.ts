import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Blog, PaginatedBlogResponse } from '../schemas/blog';

export type GetBlogsParams = {
  page?: number;
  size?: number;
  search?: string;
  tag?: string;
};

export const blogsQueryKey = (params: GetBlogsParams = {}) => ['blogs', params] as const;

export async function getBlogs(params: GetBlogsParams = {}): Promise<Blog[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.BLOGS.LIST, {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 10,
      search: params.search,
      tag: params.tag,
    },
  });

  const posts = extractContent(data);
  return [...posts].sort(byPublishedAtDesc);
}

function extractContent(data: unknown): Blog[] {
  if (Array.isArray(data)) return data as Blog[];
  if (data && typeof data === 'object') {
    const content = (data as PaginatedBlogResponse).content;
    if (Array.isArray(content)) return content;
  }
  return [];
}

function byPublishedAtDesc(a: Blog, b: Blog): number {
  const at = a.publishedAt ?? a.createdAt ?? '';
  const bt = b.publishedAt ?? b.createdAt ?? '';
  if (at === bt) return b.id - a.id;
  return at < bt ? 1 : -1;
}

export function useBlogs(params: GetBlogsParams = {}) {
  return useQuery({
    queryKey: blogsQueryKey(params),
    queryFn: () => getBlogs(params),
    staleTime: 1000 * 60 * 30,
  });
}
