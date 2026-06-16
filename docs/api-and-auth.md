# API and auth — mirroring the RN backend

## The `apiClient`

Lives in `src/lib/api-client.ts`. **Single instance.** Wraps `fetch` (the only file allowed to). Responsibilities:

- Resolve the base URL by runtime (see `src/lib/backend.ts` for `BACKEND_BASE_URL`): **server** (RSC / route handler) calls the backend directly; **browser** routes through the same-origin proxy `/api/proxy/*` (CSP `connect-src 'self'` forbids the browser hitting the backend directly). The `internal: true` option targets a same-origin Next route handler (e.g. `/api/auth/login`) instead.
- **Auth attach:** server-side, attach `Authorization: Bearer <token>` from the httpOnly cookie (caller passes `token`, typically via `getServerToken()`); browser calls leave `token` unset — the proxy reads the cookie and attaches the Bearer server-side, so the JWT never reaches browser JS.
- Throw `ApiError` on non-2xx with parsed body (`messageEn`, `messageAr`, `errorCode`, `fieldErrors`).
- **File uploads (multipart):** pass a `FormData` as `body` and `apiClient` skips JSON-encoding + omits the hand-set `Content-Type` so `fetch`/undici writes the `multipart/form-data` boundary itself. The proxy detects `multipart/form-data` on the incoming request, re-reads it via `req.formData()`, and re-streams it to the backend with the Bearer attached — same auth path as JSON. Used by `POST /chat/send-with-file` (chat image attachments); mirror this for any future upload rather than hitting the backend with a raw `fetch`.
- **Form-urlencoded bodies:** pass a `URLSearchParams` as `body` and `apiClient` passes it through untouched (like `FormData`) — `fetch`/undici writes the `application/x-www-form-urlencoded` Content-Type itself. Used by `POST /signatures` (contract e-sign), whose RN call site sends a urlencoded body. Build the `URLSearchParams` in the fetcher from a zod-validated request object.
- **401 handling:** the proxy (`src/app/api/proxy/[...path]/route.ts`) clears the session cookie on a 401 so the next navigation redirects to `/login`. _Automatic `/auth/refresh-token` retry is deferred — the RN app re-validates instead, so there is no verified refresh contract to mirror yet._
- Optionally validate the response body with a zod schema when callers pass one.

> Not yet implemented (parity bullets kept for the roadmap): `ngrok-skip-browser-warning`, `Accept-Language` from `useLocaleStore`.

## Endpoints and types

- `src/config/endpoints.ts` re-creates the RN app's `API_ENDPOINTS` constant from `website-bonyad/src/config/api.ts` **exactly**. Keep in sync — never drift.
- Per-endpoint **request** schemas are strict zod (we control what we send); **response** shapes are TS types or permissive zod (backend can extend). See §Schema strategy.
- Fetchers in `features/X/api/` use `apiClient.get/post/put/delete` + the endpoint constant.
- **Two role-scoped project lists.** `GET /projects/my-assigned` (`PROJECTS.MY_ASSIGNED`) is the **technician's** assigned work (optional `?type=BIDDING|DIRECT_ASSIGNMENT`); `GET /projects/my` (`PROJECTS.MY`) is the **customer's own** projects — every status, no query params, returns `MyProject[]` (= `Project` + `assignedTechnicianName?` + `phases?`). The `/dashboard/projects` screen branches on `user.role` to pick which list to fetch (`useAssignedProjects` vs `useMyProjects`).
- **List and detail endpoints can have different shapes.** `GET /projects` (`PROJECTS.LIST`) returns a **flat** DTO (`serviceNameEn`, `userName`, `timeRequiredDays` top-level), but `GET /projects/:id` (`PROJECTS.DETAILS`) returns the **full entity wrapped** in `{ project, phases, regionId, regionName* }` with **nested** `project.user.name` and `project.service.name{En,Ar}`, a single `budget` (no min/max), and `projectType` as an enum (e.g. `"ALL"`). The detail fetcher (`features/dashboard/api/get-project.ts`) normalizes this back into the flat `ProjectDetail` the cards expect. When wiring any new detail endpoint, **curl it (or read the live response) before trusting the list shape** — they often diverge.
- **Contract signing (customer CONTRACT_SIGNING screen).** Two endpoints back the customer's contract-signing detail (`features/dashboard/api/`): `GET /contracts/project/:projectId` (`CONTRACTS.BY_PROJECT` → `Contract | null`; a **404 means "no contract yet", not an error**, and the body may be `{ contract }`-wrapped — mirrors RN `ContractService.getContractByProject`) supplies the "sent N ago" timestamp + status; `POST /signatures` (`SIGNATURES.CREATE`, **form-urlencoded** `projectId, technicianId, userEmail, technicianEmail, phaseIds(csv), language`; request validated by `signatureRequestSchema` — mirrors RN `usePhaseApprovalData.ts:170`) creates / resends the e-sign request.
- **Approve phases (customer APPROVED screen).** The upstream step — Figma "Dashboard-Singing Contract" (`CustomerApprovedDetail`) — is where the customer reviews the provider, picks a signing method (Email / Nafath / Absher), and approves the phases. The "Approve phases" CTA opens the review-phases modal whose confirm runs `POST /phases/project/:projectId/approve-all` (`PHASES.APPROVE_ALL`, empty JSON body → returns the new `projectStatus`; `features/dashboard/api/approve-all-phases.ts`), which transitions the project APPROVED/PHASE_PLANNING → CONTRACT_SIGNING (the only state that unlocks `POST /signatures`), then best-effort fires `POST /signatures` so the contract is emailed. The detail router (`assigned-project-detail.tsx`) then re-routes the customer to the CONTRACT_SIGNING screen above. All three method options are currently selectable but route through the same `/signatures` (email) flow; the dedicated Nafath/Absher endpoints (`/signatures/signature-nafath` · `…-absher`) are not yet wired on web.
- **Create-project wizard (customer).** The `/dashboard/projects/new` multi-step wizard writes through five endpoints, all mirrored from RN `useNewProjectView.ts`: `POST /projects/create` (`PROJECTS.CREATE`) is **multipart/form-data** — `title`, `description`, `serviceCategoryId`, `budget`+`budgetUnspecified`, `timeline`+`timeRequired` (days = weeks×7), `deliverables`, hardcoded `address/latitude/longitude`, `projectType` (**`ALL`** for bidding / `DIRECT_ASSIGNMENT` for direct), and `assignedTechnicianId`+`assignmentType` on direct. Optional phases are then POSTed **one at a time** to `POST /phases` (`PHASES.CREATE`, JSON `{ projectId, phaseNumber, title, description, timeSpentDays, moneySpent }`); per-phase failures are swallowed so they never undo a created project. The category dropdown reads `GET /services/categories` (`SERVICES.CATEGORIES` → `Service[]`) and the direct-assign picker reads `GET /users/technicians` (`USERS.TECHNICIANS_LIST` → `Technician[]`, optional `?serviceId=&searchQuery=`). The wizard's `useSubmitNewProject` chains create→phases; field reads/payload are copied verbatim from RN (the web's single category dropdown sends `serviceCategoryId` only, simplifying RN's category→subcategory two-level pick).
- **Customer dashboard search.** The search typeahead on the customer dashboard reads `GET /services` (`SERVICES.LIST` → `Service[]`, **all** services incl. subcategories) via `features/dashboard/api/get-all-services.ts` (`useAllServices`) — distinct from `SERVICES.CATEGORIES` (categories only) so the create-project picker keeps its category-only list. Matching/ranking is **client-side** (`features/dashboard/lib/dashboard-search.ts`: substring + highlight, a lean port of RN `utils/smartSearch`+`searchService`); "Suggested" = top categories by `displayOrder`. **Recent searches are client-only** (`features/dashboard/lib/recent-searches.ts`, localStorage) — there is no backend search-history endpoint. No technician fetch (the Figma dropdown matches services, not technician names).

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
5. **Protected routes** — a middleware in `src/middleware.ts` (must be in `src/`, not the repo root — see [security-headers.md](security-headers.md)) checks the auth cookie for the protected prefixes (`/dashboard`, `/app`). Unauthenticated requests redirect to `/login?next=<path>`.
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

These steps are **one vertical endpoint slice** — schema + fetcher + hook + test + MSW shipped and gated together, one endpoint per sub-phase ([task-workflow.md](task-workflow.md) §Backend integration). Do not split them across separate "all schemas" / "all hooks" passes.

1. **Find the RN call site via the index — do not grep blind.** Open [`rn-call-site-index.md`](rn-call-site-index.md), look up the endpoint constant, and `Read` ONLY the mapped `file:line` range (`offset`/`limit` ≈ ±15 lines). Call sites are ranked **`services/` first** — that is where the request body is built and the response is read (`data.user?.id ?? data.userId`), NOT `screens/` (screens just trigger the flow). Copy the **request body field names** and the **response field reads** from there; do not guess names, and do not read the whole file. Only if the constant is missing from the index (or marked _(defined, no RN usage)_) do you grep the legacy tree — then run `pnpm gen:rn-index` so the map covers it. The index is generated and, because `website-bonyad/` is frozen, never drifts.
2. **Curl the endpoint** for at least three responses (success, common 4xx, edge case). Confirm the actual JSON shape before writing any code. This is the only reliable way to learn which fields are top-level vs nested and which enum values can appear.
3. **Confirm the endpoint exists in `website-bonyad/src/config/api.ts`.** If you need to add a new one, discuss with the backend team and add it to **both** `src/config/endpoints.ts` and `website-bonyad/src/config/api.ts` so the RN app inherits it.
4. **Write a strict request schema** in `features/<f>/schemas/`. Parse it at the call site.
5. **Write a permissive response TS type** in the same schemas file (no `z.enum` on backend-controlled fields; mark everything optional that isn't guaranteed by the curl evidence).
6. **Handle the error envelope at the form layer** — `ApiError#localizedMessage` for display, `err.errorCode` for branch decisions. Don't swallow the message into a generic fallback unless `localizedMessage` returns undefined.
7. **Ship a sibling `*.test.ts` for the fetcher in the same PR.** Per CLAUDE.md hard rule 1, every new `features/X/api/<endpoint>.ts` requires `<endpoint>.test.ts` covering: (a) happy path with captured request body matching the RN call site, (b) one representative 4xx that surfaces as `ApiError` with `messageEn` / `messageAr` / `errorCode` populated, (c) every special-state branch the fetcher carries (pending / `errorCode`-driven redirect / unfamiliar enum values / phone-normalisation). Form tests don't satisfy this — they're integration, not branching. See [testing.md](testing.md) §Per-endpoint tests for the MSW capture pattern.

## Realtime chat (MQTT)

The chat feature is **REST source-of-truth + an MQTT live layer**. The REST endpoints mirror `website-bonyad/src/config/api.ts` and live under `API_ENDPOINTS.CHAT`:

| Constant              | Path                                  | Use                                                              |
| --------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| `CHAT.MY_CHATS`       | `/chat/my-chats`                      | conversation list (`ChatRoom[]`, possibly wrapped in `{ data }`) |
| `CHAT.MESSAGES`       | `/chat/room/:roomId/messages`         | message history for a room                                       |
| `CHAT.SEND`           | `/chat/send`                          | send a text message                                              |
| `CHAT.SEND_WITH_FILE` | `/chat/send-with-file`                | send with an attachment                                          |
| `CHAT.MARK_READ`      | `/chat/messages/:messageId/mark-read` | mark one message read                                            |
| `CHAT.MARK_ALL_READ`  | `/chat/rooms/:roomId/mark-all-read`   | mark a room read                                                 |

**Live transport** — `src/lib/mqtt-chat.ts` is a browser MQTT-over-WebSocket singleton (`mqtt.js`, lazy-imported). Broker URL is `NEXT_PUBLIC_MQTT_BROKER_URL` (default `wss://admin.bonyad-hub.com/mqtt`); the broker origin is allow-listed in the CSP `connect-src` ([security-headers.md](security-headers.md)). Topics mirror RN: `chat/user/{userId}` (cross-room notifications), `chat/room/{roomId}` (messages), `chat/room/{roomId}/read` (receipts), `chat/room/{roomId}/typing`. The lib is **payload-agnostic transport** — it dispatches parsed JSON to per-topic handlers; the messages feature owns `ChatMessage` and the topic strings.

**Broker credential** — the broker authenticates a connection with the **session JWT as its username**, but that JWT lives in an httpOnly cookie the browser can't read. The same-origin route handler `GET /api/chat/mqtt-credentials` (`INTERNAL_API.CHAT_MQTT_CREDENTIALS`) reads the cookie server-side and mints the token for the client (`Cache-Control: no-store`). This is a deliberate, scoped widening of the httpOnly boundary — accepted so realtime chat can run client-side.

**Graceful fallback** — every MQTT failure path (load error, broker down, credential denied) resolves to "not connected"; the chat still loads/sends over REST and falls back to refetch/polling. MQTT is an enhancement, never a hard dependency.
