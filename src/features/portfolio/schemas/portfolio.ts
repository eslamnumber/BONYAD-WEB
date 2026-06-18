import { z } from 'zod';

/**
 * A technician portfolio. Permissive TS type (CLAUDE rule 1 — never strict-parse a
 * backend response). Mirrors the iOS `Portfolio` (PortfolioModels.swift:12); only
 * `id` is hard-required there, so everything else is optional here. `specialties`
 * arrives as a `string[]` OR a comma-separated `string` — normalised by
 * {@link normalizeSpecialties} in the fetcher.
 */
export type Portfolio = {
  id: number;
  userId?: number;
  businessName?: string;
  tagline?: string;
  bio?: string;
  yearsActive?: number;
  yearsOfExperience?: number;
  phoneNumber?: string;
  email?: string;
  website?: string;
  city?: string;
  specialties: string[];
  published?: boolean;
  isPublic?: boolean;
  projectsCount?: number;
  userName?: string;
  userProfileImage?: string;
  /** Either backend shape (v2 `projects` / v1 `pastProjects`) folds into this. */
  projects?: PortfolioProject[];
  pastProjects?: PortfolioProject[];
  createdAt?: string;
  updatedAt?: string;
};

/**
 * One past project in the gallery. The UI shape, unifying the iOS v1 `PastProject`
 * and v2 `PortfolioProject` (they share these field names). Permissive.
 */
export type PortfolioProject = {
  id: number;
  title: string;
  description?: string;
  /** ISO `YYYY-MM-DD`. */
  startDate?: string;
  endDate?: string;
  photos: string[];
  clientName?: string;
  projectValue?: number;
  location?: string;
  isPublic?: boolean;
};

/** Split a comma-separated specialties string (or pass an array through). */
export function normalizeSpecialties(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** Response of POST /portfolios/projects/upload-photo. Permissive — two field names exist. */
export type PhotoUploadResponseBody = {
  photoUrl?: string;
  imageUrl?: string;
  url?: string;
};

/** Create the portfolio (POST /portfolios/create). Strict (CLAUDE rule 1). */
export const createPortfolioRequestSchema = z.object({
  businessName: z.string().trim().min(1).optional(),
  bio: z.string().trim().min(1).optional(),
  tagline: z.string().trim().min(1).optional(),
  yearsActive: z.number().int().nonnegative().optional(),
  city: z.string().trim().min(1).optional(),
  specialties: z.array(z.string().trim().min(1)).default([]),
  isPublic: z.boolean().default(true),
});

/** Input shape — `specialties`/`isPublic` are optional (the schema defaults them). */
export type CreatePortfolioRequest = z.input<typeof createPortfolioRequestSchema>;

/** Edit basic info (PATCH /portfolios/me, partial). Strict. */
export const updatePortfolioRequestSchema = z.object({
  businessName: z.string().trim().min(1).optional(),
  bio: z.string().trim().min(1).optional(),
  tagline: z.string().trim().min(1).optional(),
  yearsActive: z.number().int().nonnegative().optional(),
  specialties: z.array(z.string().trim().min(1)).optional(),
  published: z.boolean().optional(),
});

export type UpdatePortfolioRequest = z.infer<typeof updatePortfolioRequestSchema>;

/**
 * Add / update a past project (POST /portfolios/projects/add · PUT
 * /portfolios/projects/:id). Strict. PUT is a full replace, so `photos` carries the
 * combined kept-URLs + newly-uploaded list. Mirrors the iOS Add/Edit forms.
 */
export const projectInputSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  photos: z.array(z.string().url()).default([]),
  clientName: z.string().trim().min(1).optional(),
  projectValue: z.number().positive().optional(),
  location: z.string().trim().min(1).optional(),
  isPublic: z.boolean().default(true),
});

/** Input shape — `photos`/`isPublic` are optional (the schema defaults them). */
export type ProjectInput = z.input<typeof projectInputSchema>;
