import { ApiError } from '@/lib/api-client';

import { normalizeSpecialties, type Portfolio, type PortfolioProject } from '../schemas/portfolio';

export const portfolioQueryKey = () => ['portfolio', 'my'] as const;
export const portfolioProjectsQueryKey = () => ['portfolio', 'projects'] as const;

/**
 * True when the backend has no route for this path — either a 404, or Spring's
 * "No static resource …" fallback returned as a 500. Both mean "not found here", so
 * the portfolio fetchers treat them as "no portfolio / empty list" (and try the
 * legacy fallback) rather than a hard error. This backend serves `/portfolios/me`
 * but 500s on `/portfolios/my` ("No static resource api/portfolios/my").
 */
export function isMissingRoute(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (err.status === 404) return true;
  const body = err.body as { error?: string; message?: string } | null;
  const reason = `${body?.error ?? ''} ${body?.message ?? ''}`.toLowerCase();
  return reason.includes('no static resource');
}

function num(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

/** Fields that identify a real portfolio even when the backend omits a top-level `id`. */
const PORTFOLIO_FIELDS = [
  'id',
  'businessName',
  'specialties',
  'bio',
  'tagline',
  'userName',
  'pastProjects',
  'projects',
  'city',
  'yearsActive',
];

/**
 * Unwrap the `/portfolios/me|my` body into the portfolio entity, or null if there
 * genuinely isn't one. The backend may return the portfolio **directly**, **wrapped**
 * (`{ portfolio }` / `{ data } ` / `{ result }`), or as a check envelope
 * (`{ exists, portfolio }`). An object that carries any portfolio field counts as
 * "exists" — relying on a top-level numeric `id` alone wrongly showed the create panel
 * for users who already have a portfolio (→ POST /create then "already exists").
 */
export function unwrapPortfolioEntity(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  const r = data as Record<string, unknown>;
  if (r.exists === false) return null;

  const inner = r.portfolio ?? r.data ?? r.result;
  const entity = (inner && typeof inner === 'object' ? inner : r) as Record<string, unknown>;
  const looksLikePortfolio = PORTFOLIO_FIELDS.some((k) => entity[k] !== undefined);
  return looksLikePortfolio ? entity : null;
}

/** Fold one raw backend project (v1 `PastProject` or v2 `PortfolioProject`) into the UI shape. */
export function normalizeProject(raw: unknown): PortfolioProject {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: Number(r.id),
    title: typeof r.title === 'string' ? r.title : '',
    description: str(r.description),
    startDate: str(r.startDate),
    endDate: str(r.endDate),
    photos: Array.isArray(r.photos)
      ? r.photos.filter((p): p is string => typeof p === 'string')
      : [],
    clientName: str(r.clientName),
    projectValue: num(r.projectValue),
    location: str(r.location),
    isPublic: typeof r.isPublic === 'boolean' ? r.isPublic : undefined,
  };
}

/** Fold a list of raw projects (tolerating a `{ projects }`/`{ pastProjects }` envelope). */
export function extractProjects(raw: unknown): PortfolioProject[] {
  const list = Array.isArray(raw)
    ? raw
    : ((raw as { projects?: unknown[]; pastProjects?: unknown[] })?.projects ??
      (raw as { pastProjects?: unknown[] })?.pastProjects ??
      []);
  return (Array.isArray(list) ? list : [])
    .map(normalizeProject)
    .filter((p) => Number.isFinite(p.id));
}

/**
 * Normalise the raw `/portfolios/my` body into the {@link Portfolio} UI type:
 * coerce `id`, normalise `specialties` (array OR comma-string), and fold any embedded
 * project list. Mirrors the iOS custom `Portfolio` decoder.
 */
export function normalizePortfolio(raw: unknown): Portfolio {
  const r = (raw ?? {}) as Record<string, unknown>;
  const projects = extractProjects(r.projects ?? r.pastProjects);
  return {
    id: Number(r.id),
    userId: num(r.userId),
    businessName: str(r.businessName),
    tagline: str(r.tagline),
    bio: str(r.bio),
    yearsActive: num(r.yearsActive),
    yearsOfExperience: num(r.yearsOfExperience),
    phoneNumber: str(r.phoneNumber),
    email: str(r.email),
    website: str(r.website),
    city: str(r.city),
    specialties: normalizeSpecialties(r.specialties),
    published: typeof r.published === 'boolean' ? r.published : undefined,
    isPublic: typeof r.isPublic === 'boolean' ? r.isPublic : undefined,
    projectsCount: num(r.projectsCount),
    userName: str(r.userName),
    userProfileImage: str(r.userProfileImage),
    projects,
    createdAt: str(r.createdAt),
    updatedAt: str(r.updatedAt),
  };
}
