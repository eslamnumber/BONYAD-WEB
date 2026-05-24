/**
 * Mirrors Blog + PaginatedBlogResponse from website-bonyad/src/types/blog.ts.
 * Permissive — every field except `id` is optional so future backend additions
 * don't surface as "Something went wrong" the day a new column appears.
 *
 * The legacy app stores `title` / `summary` / `content` as single (non-localised)
 * strings, so there is no nameEn/nameAr split. Display them as-is.
 */
export type BlogAuthor = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
};

export type Blog = {
  id: number;
  title?: string;
  summary?: string;
  content?: string;
  author?: BlogAuthor;
  status?: string;
  images?: string[];
  documents?: string[];
  tags?: string[];
  views?: number;
  isMine?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedBlogResponse = {
  content?: Blog[];
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
  size?: number;
};
