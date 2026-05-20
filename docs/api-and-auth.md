# API and auth — mirroring the RN backend

## The `apiClient`

Lives in `src/lib/api-client.ts`. **Single instance.** Wraps `fetch`. Responsibilities:

- Resolve base URL from `env.NEXT_PUBLIC_API_BASE_URL` (validated at boot via `config/env.ts`).
- Attach `Authorization: Bearer <token>` from `auth-storage` on every request.
- Attach `ngrok-skip-browser-warning: true` when the base URL is an ngrok host (parity with RN app).
- Attach `Accept-Language: <currentLocale>` from `useLocaleStore`.
- Throw `ApiError` on non-2xx with parsed body (`message`, `code`, `fieldErrors`).
- Handle 401 by calling `/auth/refresh-token` once, retrying the original request, then logging out on second failure.
- Optionally validate the response body with a zod schema when callers pass one.

## Endpoints and types

- `src/config/endpoints.ts` re-creates the RN app's `API_ENDPOINTS` constant from `website-bonyad/src/config/api.ts` **exactly**. Keep in sync — never drift.
- Per-endpoint **request** schemas are strict zod (we control what we send); **response** shapes are TS types or permissive zod (backend can extend). See §Schema strategy.
- Fetchers in `features/X/api/` use `apiClient.get/post/put/delete` + the endpoint constant.

```ts
// features/projects/api/get-projects.ts — typed response, no runtime schema parse
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/endpoints';
import type { Project } from '../schemas/project.schema';

export async function getProjects(): Promise<Project[]> {
  return apiClient.get<Project[]>(API_ENDPOINTS.PROJECTS.LIST);
}
```

## Schema strategy (read this before adding any endpoint)

The backend is shared with the RN app. It may add fields, return enum values we haven't seen (`role: 'ADMIN'` on a USER/TECHNICIAN endpoint), or return slightly different shapes per case. Strict zod parsing on the response side turns every backend evolution into a silent client-side crash that surfaces as a misleading "Something went wrong" — the `ZodError` isn't an `ApiError`, so the UI falls through to the generic fallback with no 4xx log to diagnose from.

**The rule:** validate what you SEND, trust-but-narrow what you RECEIVE.

- **Request body** — strict zod (`loginRequestSchema.parse(...)`). Catches typos at compile time and at boot.
- **Response body** — a plain TS `type` (preferred), or a permissive zod schema where every field is `.optional()` and every backend-controlled string is `z.string()` not `z.enum([...])`. Pass `apiClient.post<ResponseType>(...)` WITHOUT the `schema:` arg unless the response shape is truly closed (e.g. a `count: number` ping). Narrow at the consumer with helpers like `pickRole(raw, fallback)`.
- **Error envelope** — `{ messageEn, messageAr, errorCode }` is parsed into `ApiError` by the `apiClient`; never re-parse it.

## Auth flow (mirrors RN)

1. **Login** — `POST /auth/login` → `{ token, user, requiresPasswordChange? }` on success, or a pending-verification response (see below). Persist token in an `httpOnly` cookie via a Next.js route handler `app/api/auth/login/route.ts` so SSR can read it.
2. **Token validation on boot** — `POST /auth/validate-token` with the cookie token. On success, hydrate `useAuthStore` with the user.
3. **Refresh** — `apiClient` calls `POST /auth/refresh-token` once on 401, retries original request.
4. **Logout** — clear cookie + `useAuthStore.logout()` + `queryClient.clear()` + redirect to `/login`.
5. **Protected routes** — a middleware in `middleware.ts` checks the auth cookie for any path under `(app)/`. Unauthenticated requests redirect to `/login?next=<path>`.
6. **Role gating at the component level** — use `<RoleGate roles={['TECHNICIAN']}>` from `features/auth/`. Don't sprinkle role checks inside random child components.

## Backend response contract (mirrored from the RN app)

The backend at `bonyad-app-…run.app/api` returns **the same shapes** for the web app and the RN app — both mobile and web hit the same Cloud Run service. Mirror these exactly; never invent fields.

### `POST /auth/login` request

```json
{
  "phoneNumber": "501234567",
  "password": "...",
  "role": "USER" | "TECHNICIAN",
  "fcmToken": "no-token"
}
```

- `phoneNumber` — digits only, **no leading zero** (`5XXXXXXXX`, 9 digits for Saudi mobile). UI-entered Arabic numerals must be normalized to Western digits and the leading `0` stripped before sending.
- `fcmToken` — pass the literal string `"no-token"` on web (the web app does not have FCM). Backend requires the field to be present.

### Success response (200 OK)

```json
{
  "token": "...",
  "user": { "id": 123, "role": "USER", "deviceToken": "...", "forcePasswordChange": false },
  "requiresPasswordChange": false
}
```

Read `userId` as `data.user?.id ?? data.userId ?? 0` and `role` as `data.user?.role ?? data.role ?? <requested role>` — older entries on the backend return the bare `userId`/`role` at the top level.

### Pending-verification response — two valid shapes

The user signed up but never verified their OTP. The backend signals this in **two different ways** that both mean "redirect to `/verify-otp`":

1. **200 OK with no token**: body contains `message` whose lowercased text includes `"pending verification"` or `"otp sent"`.
2. **400 Bad Request** with body `{ messageEn, messageAr, errorCode: "USER_ALREADY_EXISTS_PENDING" }`.

`features/auth/api/login.ts` normalises both into `{ kind: 'pending', phoneNumber, role }` so the form can `router.push('/verify-otp?phone=…&role=…&source=login')` from a single branch.

### Error response (400 / 401 / 5xx)

```json
{
  "messageEn": "Account not found. Please check your phone number and role, or register first.",
  "messageAr": "الحساب غير موجود. يرجى التحقق من رقم الهاتف والدور، أو التسجيل أولاً.",
  "errorCode": "ACCOUNT_NOT_FOUND"
}
```

- **The backend localises for us.** Use `ApiError#localizedMessage(i18n.language)` from `src/lib/api-client.ts` to pick `messageAr` or `messageEn` and display directly — do NOT wrap in `t('errors.…')` (this is a deliberate exception to the "never display raw backend strings" rule because the strings are already locale-correct).
- Map `err.errorCode` to special UI flows where needed (e.g. `USER_ALREADY_EXISTS_PENDING` → OTP screen). For everything else, render the localised message verbatim.

The same contract applies to `register`, `forgot-password`, `verify-otp`, `resend-otp`, `reset-password`, and `validate-token`. Mirror their request bodies from `website-bonyad/src/screens/auth/` rather than guessing field names.

## Token storage

- The token lives in an `httpOnly` cookie set by the Next.js route handler. **Not in localStorage, not in JS-readable storage.**
- The cookie is `Secure`, `SameSite=Lax`, path `/`.
- On same-origin API calls, the cookie is sent automatically; the `apiClient` does not need to read it.
- For cross-origin API calls (the backend at `bonyad-app-…run.app`), the `apiClient` proxies through a Next route handler `app/api/proxy/[...path]/route.ts` that attaches the token server-side.

## Rules

1. **No `fetch` call lives outside `apiClient`.** Grep for `fetch(` — must only match `lib/api-client.ts`.
2. **No endpoint string literal lives outside `config/endpoints.ts`.** Grep for `'/auth/'`, `'/projects'` — must only match that file.
3. **Strict request schemas, permissive response types.** Requests use a zod schema parsed at the call site. Responses use a TS `type` (or `.optional()`-everywhere zod) — never `z.enum` on a backend-controlled string field. See §Schema strategy for the reasoning.
4. **Pagination and filters are typed.** A `ProjectFilters` type lives next to the fetcher.
5. **Mutations return the updated entity** when the backend does — don't refetch by default if the response already has the data; just call `queryClient.setQueryData` in `onSuccess`.
6. **Idempotency keys** for any mutation that writes money (payments, payouts) — generate a UUID client-side and pass as `Idempotency-Key` header.
7. **Surface localised backend errors verbatim.** On `ApiError`, use `err.localizedMessage(i18n.language)` and only fall back to `t('errors.generic')` when that returns undefined. Mapping `err.errorCode` to a special UX flow (e.g. OTP redirect on `USER_ALREADY_EXISTS_PENDING`) lives in the feature, not in `apiClient`.

## Before adding any new endpoint integration

The backend is **shared with the RN app** and shouldn't change for the web app's sake unless absolutely necessary.

1. **Find the RN call site.** Grep `website-bonyad/src/screens/` for the endpoint constant — every backend interaction we'd need already exists there. Copy the **request body field names** and the **response field reads** (e.g. `data.user?.id ?? data.userId`). Do not guess names.
2. **Curl the endpoint** for at least three responses (success, common 4xx, edge case). Confirm the actual JSON shape before writing any code. This is the only reliable way to learn which fields are top-level vs nested and which enum values can appear.
3. **Confirm the endpoint exists in `website-bonyad/src/config/api.ts`.** If you need to add a new one, discuss with the backend team and add it to **both** `src/config/endpoints.ts` and `website-bonyad/src/config/api.ts` so the RN app inherits it.
4. **Write a strict request schema** in `features/<f>/schemas/`. Parse it at the call site.
5. **Write a permissive response TS type** in the same schemas file (no `z.enum` on backend-controlled fields; mark everything optional that isn't guaranteed by the curl evidence).
6. **Handle the error envelope at the form layer** — `ApiError#localizedMessage` for display, `err.errorCode` for branch decisions. Don't swallow the message into a generic fallback unless `localizedMessage` returns undefined.
7. **Ship a sibling `*.test.ts` for the fetcher in the same PR.** Per CLAUDE.md hard rule 1, every new `features/X/api/<endpoint>.ts` requires `<endpoint>.test.ts` covering: (a) happy path with captured request body matching the RN call site, (b) one representative 4xx that surfaces as `ApiError` with `messageEn` / `messageAr` / `errorCode` populated, (c) every special-state branch the fetcher carries (pending / `errorCode`-driven redirect / unfamiliar enum values / phone-normalisation). Form tests don't satisfy this — they're integration, not branching. See [testing.md](testing.md) §Per-endpoint tests for the MSW capture pattern.
