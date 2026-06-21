import { ApiError } from '@/lib/api-client';

import { normalizeSpecialties, type Portfolio, type PortfolioProject } from '../schemas/portfolio';

export const portfolioQueryKey = () => ['portfolio', 'my'] as const;
export const portfolioProjectsQueryKey = () => ['portfolio', 'projects'] as const;

/** HTTP statuses that mean "no readable route at this path". */
const MISSING_ROUTE_STATUSES = new Set([404, 405]);

/** Body-text phrases that signal a routing miss when the status alone is ambiguous (e.g. a 500). */
const MISSING_ROUTE_PHRASES = ['no static resource', 'method_not_allowed'];

/** Lowercase concatenation of the error/body fields `isMissingRoute` greps. */
function missingRouteReason(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  const b = body as Record<string, unknown>;
  return [b.error, b.message, b.status].filter(Boolean).join(' ').toLowerCase();
}

/**
 * True when the backend has no readable route for this path — either a 404, a 405
 * (path exists for PATCH/POST but not GET — e.g. a deployment that has
 * `PATCH /portfolios/me` for the builder-draft save but not the newer
 * `GET /portfolios/me` load handler), or Spring's "No static resource …" fallback
 * returned as a 500. All three mean "not readable here", so the portfolio fetchers
 * treat them as "no portfolio / empty list" (and try the legacy fallback) rather
 * than a hard error. This backend serves `/portfolios/me` but a partial deployment
 * can 405 on GET while still accepting PATCH — the `/my` fallback then resolves.
 */
export function isMissingRoute(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (MISSING_ROUTE_STATUSES.has(err.status)) return true;
  const reason = missingRouteReason(err.body);
  return MISSING_ROUTE_PHRASES.some((phrase) => reason.includes(phrase));
}

function num(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

/**
 * Fields that identify a real portfolio even when the backend omits a top-level `id`.
 * The first group covers the legacy full-portfolio shape (`/my`, `/create`, the iOS
 * contract). The `BUILDER_DRAFT_FIELDS` group covers backend-updated's
 * {@link https://example/PortfolioMeResponse `PortfolioMeResponse`} returned by
 * `/portfolios/me` — a builder-draft body (`{ draft, isPublic, publicHtmlUrl, pdfUrl,
 * lastPublishedAt }`) that has none of the legacy fields but absolutely represents an
 * existing portfolio. Without recognising those, `/me`'s 200-with-draft was being
 * discarded as "no portfolio" → create panel → POST /create → "already exists" deadlock.
 */
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

/** Fields on the `/me` builder-draft response that signal a portfolio row exists. */
const BUILDER_DRAFT_FIELDS = ['draft', 'isPublic', 'publicHtmlUrl', 'pdfUrl', 'lastPublishedAt'];

/**
 * Unwrap the `/portfolios/me|my` body into the portfolio entity, or null if there
 * genuinely isn't one. The backend may return the portfolio **directly**, **wrapped**
 * (`{ portfolio }` / `{ data } ` / `{ result }`), or as a check envelope
 * (`{ exists, portfolio }`). An object that carries any portfolio field counts as
 * "exists" — relying on a top-level numeric `id` alone wrongly showed the create panel
 * for users who already have a portfolio (→ POST /create then "already exists").
 *
 * The `/me` builder-draft shape is recognised too: any non-null `draft`/`isPublic`/
 * `publicHtmlUrl`/`pdfUrl`/`lastPublishedAt` field counts as "a portfolio exists, even
 * if it only has builder state". An all-null draft body (the user truly has no row)
 * still returns null — `null`/`undefined` values are ignored by the detection.
 */
export function unwrapPortfolioEntity(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  const r = data as Record<string, unknown>;
  if (r.exists === false) return null;

  const inner = r.portfolio ?? r.data ?? r.result;
  const entity = (inner && typeof inner === 'object' ? inner : r) as Record<string, unknown>;
  const looksLikePortfolio = PORTFOLIO_FIELDS.some((k) => entity[k] !== undefined);
  if (looksLikePortfolio) return entity;

  // `/me` builder-draft shape: only count it as a portfolio if at least one of the
  // builder fields is a real (non-null, non-undefined) value. backend-updated returns
  // 200 with all fields null when the user genuinely has no row — that must NOT be
  // treated as an existing portfolio or the create panel disappears for new users.
  const hasBuilderState = BUILDER_DRAFT_FIELDS.some(
    (k) => entity[k] !== undefined && entity[k] !== null,
  );
  return hasBuilderState ? entity : null;
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
 *
 * Also handles the `/me` builder-draft shape (`{ draft, isPublic, publicHtmlUrl,
 * pdfUrl, lastPublishedAt }`): when the body has no legacy fields but does carry a
 * `draft` JSON string, the inner draft is parsed and its portfolio fields merged with
 * the top-level `isPublic`/`publicHtmlUrl`/`lastPublishedAt`. This is the shape
 * backend-updated returns once a user has saved any builder state, and historically
 * the client discarded it as "no portfolio" — the root cause of the create-deadlock.
 */
export function normalizePortfolio(raw: unknown): Portfolio {
  const r = (raw ?? {}) as Record<string, unknown>;

  // If this is the `/me` builder-draft shape (no legacy fields, but a `draft` JSON
  // string or builder flags), parse the draft and merge. Falls through harmlessly
  // when `draft` is null/unparseable — the top-level fields still map below.
  const merged = mergeBuilderDraft(r);

  const projects = extractProjects(merged.projects ?? merged.pastProjects);
  return {
    id: Number(merged.id),
    userId: num(merged.userId),
    businessName: str(merged.businessName),
    tagline: str(merged.tagline),
    bio: str(merged.bio),
    yearsActive: num(merged.yearsActive),
    yearsOfExperience: num(merged.yearsOfExperience),
    phoneNumber: str(merged.phoneNumber),
    email: str(merged.email),
    website: str(merged.website),
    city: str(merged.city),
    specialties: normalizeSpecialties(merged.specialties),
    published:
      typeof merged.published === 'boolean'
        ? merged.published
        : merged.lastPublishedAt !== null && merged.lastPublishedAt !== undefined
          ? true
          : merged.publicHtmlUrl !== null && merged.publicHtmlUrl !== undefined
            ? true
            : undefined,
    isPublic: typeof merged.isPublic === 'boolean' ? merged.isPublic : undefined,
    projectsCount: num(merged.projectsCount),
    userName: str(merged.userName),
    userProfileImage: str(merged.userProfileImage),
    projects,
    createdAt: str(merged.createdAt),
    updatedAt: str(merged.updatedAt),
  };
}

/**
 * If `r` is the `/me` builder-draft shape, parse the embedded `draft` JSON string and
 * merge its inner fields with the top-level builder flags. Returns `r` unchanged when
 * `r` already carries legacy portfolio fields (the `/my` shape) or when the draft is
 * absent/unparseable. Always preserves the top-level `isPublic`/`publicHtmlUrl`/
 * `pdfUrl`/`lastPublishedAt` so callers can read them after the merge.
 */
function mergeBuilderDraft(r: Record<string, unknown>): Record<string, unknown> {
  const hasLegacyField = PORTFOLIO_FIELDS.some((k) => r[k] !== undefined);
  if (hasLegacyField) return r;

  const draft = r.draft;
  if (typeof draft !== 'string' || draft.trim() === '') return r;

  try {
    const parsed = JSON.parse(draft) as unknown;
    if (parsed && typeof parsed === 'object') {
      // Top-level builder flags win over anything nested inside the draft — the
      // backend authoritatively tracks `isPublic` / `publicHtmlUrl` / `lastPublishedAt`
      // on the row, while the draft is opaque frontend state.
      return { ...(parsed as Record<string, unknown>), ...stripUndefinedBuilderFlags(r) };
    }
  } catch {
    // The draft isn't valid JSON — fall through with the raw builder flags only.
  }
  return r;
}

/** Pull just the authoritatively-backend-owned builder flags out of `r`. */
function stripUndefinedBuilderFlags(r: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of BUILDER_DRAFT_FIELDS) {
    if (r[k] !== undefined && r[k] !== null) out[k] = r[k];
  }
  return out;
}
