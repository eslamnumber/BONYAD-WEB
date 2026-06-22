/**
 * API endpoint paths — mirrors website-bonyad/src/config/api.ts.
 * No endpoint string literal may appear outside this file.
 * Dynamic segments use `:param` convention; replace at call-site.
 */
export const API_ENDPOINTS = {
  USERS: {
    REGISTER: '/users/register',
    /**
     * Technician onboarding step 2 — submit the "Complete your profile" form (POST,
     * **multipart/form-data**, Bearer). Body: `email` · `description` (bio) · `address`
     * · `yearsOfExperience` (numeric, sent as string) · `regionIds` (repeated field) ·
     * `certificates` (repeated files, optional). → `{ profileComplete: true, … }`. A
     * 409 / `errorCode: EMAIL_ALREADY_EXISTS` means the email is already taken. Mirrors
     * the iOS call site CompleteTechnicianProfileView.swift:781 and the RN call site
     * website-bonyad/src/screens/profile/CompleteProfileScreen.tsx:308 (RN index
     * `USER.COMPLETE_PROFILE`).
     */
    COMPLETE_PROFILE: '/users/complete-profile',
    /**
     * The signed-in technician's onboarding / approval status (GET, Bearer) — drives the
     * "waiting for admin approval" screen and the post-login onboarding gate. →
     * `{ status: PENDING|WAITING_ADMIN_APPROVAL|APPROVED|SUSPENDED, profileComplete,
     * hasEmail, hasDescription, hasCertificates, hasRegions, hasPendingDataRequests,
     * onboarded, recommendedPage }`. This is the **authoritative** source for
     * `profileComplete`/approval (validate-token does not carry it). Mirrors the iOS call
     * site TechnicianStatusService.swift:13.
     */
    TECHNICIAN_STATUS: '/users/technician-status',
    /**
     * Approved technicians with `averageRating` — the direct-assignment picker.
     * Mirrors RN `USER.TECHNICIANS_LIST`. Optional `?serviceId=&searchQuery=`.
     */
    TECHNICIANS_LIST: '/users/technicians',
    /**
     * The signed-in user's own full profile — `name` · `email` · `phoneNumber` ·
     * `profileImage` · `averageRating` · `totalReviews` · `type_label` (profession)
     * · `isCompany`/`companyName`/`crNumber` (Wathq). Mirrors RN `USER.PROFILE`
     * (website-bonyad/src/services/ProfileService.ts:399 `getUserProfile`).
     */
    PROFILE: '/users/profile',
    /**
     * A user's public profile by id (`averageRating` + `totalReviews` + avatar).
     * Mirrors RN `USER.PROFILE_BY_ID` — used to enrich each bid card with the
     * technician's rating/avatar (RN BidReceivedProjectScreen / BidReviewPage).
     */
    PROFILE_BY_ID: '/users/:id/profile',
    /**
     * Update a user's own profile by id (PUT, JSON). The Account-type screen uses
     * it to flip Individual ↔ Company after a Wathq check — body
     * `{ isCompany, companyName?, crNumber?, nationalId? }`. Mirrors the iOS call
     * site bonayd-ios/bonyad-cr-2/App/Screens/Profile/CompanyModeToggleView.swift:196,294.
     */
    UPDATE_PROFILE_BY_ID: '/users/:userId/profile',
    /**
     * Upload the signed-in user's avatar (POST, multipart/form-data, field
     * `profileImage`) → `{ profileImage }`. The Edit-profile screen sends this
     * after the JSON profile PUT. Mirrors the iOS call site
     * bonayd-ios/bonyad-cr-2/App/Screens/Profile/MyProfile.swift:786.
     */
    PROFILE_IMAGE: '/users/update-profile-image',
    /**
     * Request an OTP to change the phone number (POST `{ newPhoneNumber }`, 9-digit
     * national body). The verify step rotates the JWT. Mirrors the iOS call site
     * MyProfile.swift:1086 (`change-phone-request`) / :1278 (`change-phone-verify`).
     */
    CHANGE_PHONE_REQUEST: '/users/:userId/change-phone-request',
    /** Verify the phone-change OTP (POST `{ otpCode }`) → `{ user, token, message }`. */
    CHANGE_PHONE_VERIFY: '/users/:userId/change-phone-verify',
    /**
     * Change the account password (PUT `{ oldPassword, newPassword }`) →
     * `{ message }`. Mirrors the iOS call site MyProfile.swift:1480.
     */
    CHANGE_PASSWORD: '/users/:userId/change-password',
    /**
     * The signed-in technician's current subscription status — joined plan, price,
     * start/end dates, days remaining. Mirrors RN `TECHNICIANS.SUBSCRIPTION`
     * (website-bonyad/src/components/profile/SubscriptionCard.tsx:102). A **404
     * means "no active subscription"** (the empty state), not an error. `DELETE` on
     * this same path cancels the subscription (RN SubscriptionCard.tsx:228).
     */
    SUBSCRIPTION: '/users/subscription',
    /**
     * Weekly bid quota for the active subscription — quota, remaining, and reset
     * timing. Mirrors RN `TECHNICIANS.SUBSCRIPTION_BIDS`
     * (website-bonyad/src/components/profile/SubscriptionCard.tsx:131). Non-critical:
     * a failure here degrades gracefully (the bid-usage card is just omitted).
     */
    SUBSCRIPTION_BIDS: '/users/subscription/bids',
    /**
     * Refer-a-friend invite — send the friend an SMS invitation. POST
     * `{ phoneNumber }` → `{ success, invitation_id?, invited_phone?, sms_sent?,
     * error_code?, message? }`. A `success: false` (over 200 or a 4xx) carries an
     * `error_code` of `RATE_LIMIT` | `ALREADY_USER` | `SELF_REFERRAL` |
     * `INVALID_PHONE`. Mirrors the iOS call site
     * bonayd-ios/.../Utils/ReferralAPIService.swift:224 (`invite`).
     */
    REFERRAL_INVITE: '/users/me/referral/invite',
    /**
     * Refer-a-friend funnel stats — invited / signed-up / converted counts plus the
     * reward `wallet_balance` and the `next_tier_at` / `next_tier_reward` progress.
     * Mirrors iOS ReferralAPIService.swift:254 (`fetchStats`).
     */
    REFERRAL_STATS: '/users/me/referrals/stats',
    /**
     * Refer-a-friend list — `{ invitations[], referrals[] }`: pending/expired SMS
     * invitations plus the materialized referrals (joined + converted friends).
     * Mirrors iOS ReferralAPIService.swift:266 (`fetchReferrals`).
     */
    REFERRALS: '/users/me/referrals',
    /**
     * Reward wallet balance — `{ user_id?, balance?, currency? }`, the SAR credit
     * earned from converted referrals. Mirrors iOS ReferralAPIService.swift:278
     * (`fetchWallet`).
     */
    WALLET: '/users/me/wallet',
  },
  /**
   * Wathq (واثق) commercial-registration verification. The backend proxies to the
   * Signit Wathq API to confirm a national ID is an authorised signatory for a
   * Commercial Registration before an account switches to Company mode. Mirrors
   * the iOS call site CompanyModeToggleView.swift:245.
   */
  WATHQ: {
    /** POST `{ nationalId, crNumber }` → `{ authorized, isCrFound, isNidFound, message? }`. */
    VERIFY: '/wathq/verify',
  },
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    FORGOT_PASSWORD_RESEND: '/auth/forgot-password/resend',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    VALIDATE_TOKEN: '/auth/validate-token',
  },
  /**
   * Terms & Conditions (signup legal agreement). Privacy stipulations are folded
   * into the same document body — there is no separate Privacy Policy endpoint. The
   * GETs are **public** (the pre-login signup screen renders the document); the POSTs
   * are **Bearer-auth** (recording the agreement needs the post-OTP token). Both AR
   * and EN bodies ship in every GET — the client picks by language. Mirrors the iOS
   * `TermsService` (bonayd-ios/.../App/Services/TermsService.swift), which targets
   * `/api/terms/*` and `/api/users/terms/approve`; on web the base URL already carries
   * `/api`, so the constants stay un-prefixed like every other endpoint.
   */
  TERMS: {
    /** GET (public) → the active USER terms document. Empty/404 ⇒ "no active terms". */
    USER: '/terms/user',
    /** GET (public) → the active TECHNICIAN terms document. Empty/404 ⇒ "no active terms". */
    TECHNICIAN: '/terms/technician',
    /**
     * POST (Bearer) `{ termsId }` → record the agreement pinned to a specific version.
     * The current signup path (post-OTP). 2xx ⇒ success even if the body omits `success`.
     */
    APPROVE: '/users/terms/approve',
    /**
     * POST (Bearer) `{ userRole }` → legacy, version-agnostic agreement used by the
     * standalone Terms view (e.g. opened from profile). New code uses APPROVE. Kept
     * here for parity with the iOS contract; not wired on web yet (no consumer).
     */
    AGREE: '/terms/agree',
  },
  SUBSCRIPTIONS: {
    /** All subscription plans/tiers — the post-approval onboarding plan picker + for-pros pricing. */
    CATEGORIES: '/subscriptions/categories',
    /**
     * Enroll the signed-in technician in a plan during post-approval onboarding (POST,
     * Bearer) `{ subscriptionCategoryId }`. No payment step — mirrors the RN onboarding
     * finish (website-bonyad/src/services/onboardingApi.ts `subscribeToPlan`, RN
     * `TECHNICIANS.SUBSCRIBE`).
     */
    SUBSCRIBE: '/users/subscribe',
  },
  SERVICES: {
    /** All services (categories + subcategories). */
    LIST: '/services',
    /** Top-level categories only (isCategory=true) — the create-project category picker. */
    CATEGORIES: '/services/categories',
    /** Subcategories of a category. */
    SUBCATEGORIES: '/services/:categoryId/subcategories',
    /**
     * The signed-in technician's own offered services (GET, Bearer) → `{ services:
     * Service[] }` or a bare `Service[]`. Backs the Available-Projects service
     * filter — a technician only sees offers matching a service they provide.
     * Mirrors the RN call site
     * website-bonyad/src/services/TechnicianServiceService.ts:64 (`getMyServices`,
     * RN `TECHNICIANS.MY_SERVICES`).
     */
    MY_FOR_TECHNICIAN: '/technician/services/my-services',
    /**
     * Assign the selected leaf service IDs to the signed-in technician during
     * post-approval onboarding (POST, Bearer) `{ serviceIds: number[] }`. Mirrors the RN
     * onboarding finish (website-bonyad/src/services/onboardingApi.ts `saveServices`, RN
     * `TECHNICIANS.ADD_SERVICES`). Also backs the profile "My services" add flow.
     */
    ADD_FOR_TECHNICIAN: '/technician/services/add',
    /**
     * Remove one service from the signed-in technician's offered set (DELETE, Bearer,
     * no body) — the profile "My services" screen's per-row remove. `:serviceId` is
     * replaced at the call site. Mirrors the RN call site
     * website-bonyad/src/services/TechnicianServiceService.ts:165 (`removeService`,
     * RN `TECHNICIANS.REMOVE_SERVICE`).
     */
    REMOVE_FOR_TECHNICIAN: '/technician/services/remove/:serviceId',
  },
  /** Service regions/zones (mirrors RN `ZONES.LIST`). The create-project location picker. */
  ZONES: {
    LIST: '/regions',
  },
  /**
   * Technician onboarding lifecycle. `COMPLETE` flips the authoritative `onboarded`
   * flag (PUT, Bearer, no body) at the end of the post-approval setup wizard, mirroring
   * the RN finish (website-bonyad/src/services/onboardingApi.ts `markOnboardingComplete`,
   * RN `ONBOARDING.COMPLETE`). After it succeeds, `technician-status` returns
   * `onboarded: true` and the onboarding guard stops redirecting to `/setup`.
   */
  ONBOARDING: {
    COMPLETE: '/onboarding/:userId/complete',
  },
  FAQS: {
    LIST: '/faqs',
  },
  CONTACT: {
    SUBMIT: '/contact',
  },
  /**
   * Support requests (auth required). The signed-in user opens a request that an
   * admin picks up; the user tracks it here by status. Mirrors the iOS
   * `SupportRequestService` (bonayd-ios/.../Utils/SupportRequestService.swift): POST
   * /support/request, GET /support/my-requests, GET /support/requests/:requestId. The
   * web omits the iOS `aiConversationHistory` (no chatbot). Shapes mirrored from the
   * iOS production contract.
   */
  SUPPORT: {
    /** POST `{ subject, description, category, priority }` → `{ id, status?, chatRoomRoomId? }`. */
    REQUEST: '/support/request',
    /** GET → `SupportRequest[]` — the signed-in user's requests. */
    MY_REQUESTS: '/support/my-requests',
    /** GET → `SupportRequestDetail` (with requester info). `:requestId` replaced at call-site. */
    REQUEST_BY_ID: '/support/requests/:requestId',
    /**
     * Support tickets (threaded, admin-replied) — the iOS "Tickets" tab. GET lists the
     * user's tickets (optional `?status=OPEN|IN_PROGRESS|CLOSED`); POST creates one
     * (`{ subject, description, priority, categoryId?, subcategoryId? }`). Mirrors the
     * RN `SupportTicketService`. File-attachment create (`/create-with-files`) is deferred.
     */
    TICKETS: '/support/tickets',
    /** GET → one ticket incl. its `messages[]`. `:id` replaced at call-site. */
    TICKET_BY_ID: '/support/tickets/:id',
    /** POST `{ message, content }` → reply on a ticket. `:id` replaced at call-site. */
    TICKET_MESSAGES: '/support/tickets/:id/messages',
    /** PUT (no body) → mark a ticket resolved. `:id` replaced at call-site. */
    TICKET_RESOLVE: '/support/tickets/:id/resolve',
    /** GET (public) → the nested support category tree for the new-ticket pickers. */
    CATEGORIES_HIERARCHY: '/support/categories/hierarchy',
  },
  /**
   * In-app feedback (الملاحظات / "Feedback") — auth required. The signed-in user sends a
   * suggestion / bug / complaint / praise and tracks their own submissions. Contract supplied
   * by the product team (the feature is iOS-native; absent from the RN call-site index, so the
   * shapes below are authoritative): POST /app-feedback, GET /app-feedback/mine.
   */
  APP_FEEDBACK: {
    /** POST `{ category, subject?, message, attachments? }` → the created `AppFeedback`. */
    SUBMIT: '/app-feedback',
    /** GET → `{ success, count, feedback[] }` or a bare `AppFeedback[]` — the user's own feedback. */
    MINE: '/app-feedback/mine',
  },
  BLOGS: {
    LIST: '/blogs',
    DETAILS: '/blogs/:id',
  },
  PROJECTS: {
    LIST: '/projects',
    /** Customer creates a project (multipart/form-data). RN useNewProjectView. */
    CREATE: '/projects/create',
    DETAILS: '/projects/:id',
    /** Technician's assigned projects (bidding + direct). Optional `?type=`. */
    MY_ASSIGNED: '/projects/my-assigned',
    /** The signed-in customer's own projects (every status). No query params. */
    MY: '/projects/my',
    /** Owner deletes their own pending project (RN ProjectDetailScreen). */
    DELETE: '/projects/:id',
    /** Owner load/save of an editable pending project — GET + PUT (RN OwnerProjectEditScreen). */
    OWNER_EDIT: '/projects/:id/owner-edit',
    /** GET → projects matched to the technician's services + regions (map default feed). */
    SUGGESTED: '/projects/technician/suggestions',
    /** GET → projects near GPS coords. Query: `?latitude=X&longitude=Y`. */
    NEAR_ME: '/projects/near-me',
    /**
     * Project supervision (technician-as-supervisor). A customer hires a technician
     * to supervise a project end-to-end; the SP accepts/declines the invitation and,
     * once ACTIVE, manages the project's bids + sees an audit log. Mirrors the iOS
     * call site bonayd-ios/.../App/Utils/SupervisorAPIService.swift (backend-integration
     * reference only). Verified live on the dev backend (GET shapes + accept + the
     * customer hire/remove cycle confirmed against projects 213/223; the per-project
     * path carries the project id as `:id`, matching `DETAILS`).
     */
    /** GET → technicians eligible to be hired as a supervisor (the customer picker).
     *  → `HireableTechnician[]` `{ id, name, phoneNumber, profileImage, companyName }`. */
    HIREABLE_TECHNICIANS: '/projects/hireable-technicians',
    /** GET → projects this technician supervises. Query `?status=invited|active` →
     *  bare array of full project DTOs carrying `supervisor*` fields + `phases[]`. */
    SUPERVISING: '/projects/supervising',
    /** The per-project supervisor assignment — ONE path, three verbs (all → the
     *  `ProjectSupervisor` envelope): **GET** reads the assignment (owner + supervisor);
     *  **POST** `{ technicianId }` hires/invites a technician (owner-only) → status
     *  INVITED; **DELETE** cancels the invitation / removes the supervisor (owner-only)
     *  → status REMOVED. Verified live on the dev backend. */
    SUPERVISOR: '/projects/:id/supervisor',
    /** POST `{ accept: boolean }` → the invited technician accepts/declines; returns
     *  the updated `ProjectSupervisor` (status flips INVITED → ACTIVE | DECLINED). */
    SUPERVISOR_RESPOND: '/projects/:id/supervisor/respond',
    /** GET → the supervisor activity/audit log (bare array). 403 until the supervisor
     *  is ACTIVE (only the owner or active supervisor may read it). */
    SUPERVISOR_ACTIVITY: '/projects/:id/supervisor/activity',
  },
  /**
   * Technician self-service endpoints (`/technicians/me/*` + off-platform projects).
   * Power the new SP tracking dashboard. Mirror the iOS call sites
   * bonayd-ios/.../App/Services/TechnicianDashboardAPIService.swift +
   * App/Models/ExternalProjectModels.swift (backend-integration reference only).
   * Verified live on the dev backend (technician 444) — the dashboard summary is
   * snake_case; see features/dashboard/schemas/technician-dashboard.ts.
   */
  TECHNICIANS: {
    /** GET → SP home snapshot: `summary` KPIs + `active_projects[]` (with progress) +
     *  `next_payments[]` (phases) + `recent_bids[]` + `earnings_chart.monthly[]`. */
    ME_DASHBOARD: '/technicians/me/dashboard',
    /** GET → off-platform projects the technician tracks (`{ projects, count, success }`);
     *  POST to create. Verified live (technician 444): list item carries `progress`
     *  0–100, `status`, `location`, `clientName`, `isPublic`/`publicUrl`. */
    EXTERNAL_PROJECTS: '/technicians/external-projects',
    /** GET/PUT/DELETE one external project. */
    EXTERNAL_PROJECT: '/technicians/external-projects/:id',
    /** POST milestones / updates; POST `/share` to publish a public tracking link. */
    EXTERNAL_PROJECT_MILESTONES: '/technicians/external-projects/:projectId/milestones',
    EXTERNAL_PROJECT_SHARE: '/technicians/external-projects/:projectId/share',
  },
  /**
   * Technician advertisements ("إعلاناتي" on the SP dashboard + the customer-facing
   * "Explore offers" feed). Mirrors the iOS `AdModels.swift` (backend-integration
   * reference only). Verified live on the dev backend (technician 444): `/ads/mine`
   * and `/ads/feed` return `{ ads: [...] }`; an ad carries `status` ACTIVE |
   * PENDING_APPROVAL | PAUSED | REJECTED, `impressions`/`clicks`/`ctr`, and the
   * `technician*` + `service*` fields. See features/dashboard/schemas/ad.ts.
   */
  ADS: {
    /** GET → the signed-in technician's own ads (`{ ads: Ad[] }`). */
    MINE: '/ads/mine',
    /** GET → the customer-facing ads feed (`{ ads: Ad[] }`). Optional service/region filters. */
    FEED: '/ads/feed',
    /** POST → create an ad. PUT/DELETE `/ads/:id` edit/remove. */
    CREATE: '/ads',
    BY_ID: '/ads/:id',
    /** POST → pause / resume an ad (no body). */
    PAUSE: '/ads/:id/pause',
    UNPAUSE: '/ads/:id/unpause',
    /** GET → per-ad analytics (impressions, clicks, ctr, clicksByDay). */
    STATS: '/ads/:id/stats',
    /** POST → track a customer impression / click on a feed ad (no body). */
    IMPRESSION: '/ads/:id/impression',
    CLICK: '/ads/:id/click',
  },
  /**
   * Technician wallet / earnings & payouts ("الأرباح والتحويلات" on the SP dashboard).
   * Mirrors the iOS `TechnicianWalletService.swift` (backend-integration reference only).
   * Verified live on the dev backend (technician 444): GET /technician/wallet returns
   * `{ success, wallet }` where `wallet` carries `availableBalance` / `inEscrow` /
   * `totalEarned` / `earnedFromPhases` / `totalPaidOut` / `pendingPayouts` / `currency`
   * (camelCase). See features/dashboard/schemas/wallet.ts. NOTE: `/technician/*` is
   * singular, distinct from the `/technicians/me/*` dashboard endpoints.
   */
  WALLET: {
    /** GET → the technician's wallet snapshot (`{ success, wallet }`). */
    ME: '/technician/wallet',
    /** GET → payout requests (paged). POST `/request` to withdraw, POST `/:id/cancel`. */
    PAYOUTS: '/technician/payouts',
    REQUEST_PAYOUT: '/technician/payouts/request',
    /** GET/POST → the technician's bank accounts (payout destinations). */
    BANK_ACCOUNTS: '/technician/bank-accounts',
  },
  /**
   * Change requests — the customer↔technician negotiation over an IN_PROGRESS
   * project's scope / total budget / phases. Parent→child thread (`parentRequestId`)
   * moving PENDING → RESPONDED → AGREED | REJECTED → COMPLETED; both parties must
   * `/agree` before it locks. Mirrors the iOS call site
   * bonayd-ios/.../new_request/ChangeRequestService.swift (backend-integration
   * reference only). Verified live on dev (data shapes confirmed against GET
   * /change-requests/project/183).
   */
  CHANGE_REQUESTS: {
    /** Active (PENDING/RESPONDED) negotiations for a project (GET → bare array). */
    ACTIVE: '/change-requests/project/:projectId/active',
    /** Every change request for a project incl. history (GET → bare array). */
    LIST: '/change-requests/project/:projectId',
    /** Full negotiation chain for one request (GET → bare array). */
    THREAD: '/change-requests/:id/thread',
    /** Open a change request (POST { description, newBudget?, phaseChanges?, …emails }). */
    CREATE: '/change-requests/project/:projectId/request',
    /** Counter-offer reply on a request (POST { response }). */
    RESPOND: '/change-requests/:id/respond',
    /** Agree to a request — per party; both must call (POST { agreedChanges?, signingMethod }). */
    AGREE: '/change-requests/:id/agree',
    /** Reject a request, ending the negotiation (POST { reason? }). */
    REJECT: '/change-requests/:id/reject',
  },
  /**
   * Omdah AI project creation. The conversational/refine endpoints live on separate
   * hosts (see `src/config/ai-hosts.ts`) and are reached through same-origin Next
   * route handlers under `/api/ai/*` (browser → route → foreign host); the create /
   * draft / attachment endpoints are on the main backend and go through `/api/proxy/*`.
   * Mirrors the iOS `ChatbotAPIService` + `AIProjectAPIService` + `SOWRefineService`.
   */
  AI: {
    /** Chatbot health — Cloud Run `GET /health` → `{ status: 'ok' }`. Foreign host. */
    HEALTH: '/health',
    /** Conversational wizard step (REST) — Cloud Run `POST /api/chat`. Foreign host. */
    CHAT: '/api/chat',
    /** SOW generation stream (SSE) — Cloud Run `POST /api/chat/stream`. Foreign host. */
    CHAT_STREAM: '/api/chat/stream',
    /** NL SOW refine — AWS `POST /api/project/refine/await`. Foreign host. */
    REFINE: '/api/project/refine/await',
    /** Create the project from a generated SOW — main API `POST /v1/projects/from-ai`. */
    CREATE_FROM_AI: '/v1/projects/from-ai',
    /** Silent analytics/recovery draft — main API `PUT /v1/ai/draft`. */
    DRAFT: '/v1/ai/draft',
    /** Project photo/attachment (multipart) — main API `POST /v1/projects/:id/attachments`. */
    ATTACHMENTS: '/v1/projects/:id/attachments',
  },
  /**
   * 2D → 3D sketch planner — the SAME Cloud Run chatbot host as `AI` (foreign host,
   * reached via the same-origin `/api/sketch/*` route handlers). Every call returns
   * the SPJob snapshot except `IDEA` → `{ jobId, status }`. Mirrors iOS `SketchPlannerAPI`.
   */
  SKETCH: {
    /** Create a job from a text description — `POST /api/sketch/idea` → `{ jobId, status }`. */
    IDEA: '/api/sketch/idea',
    /** Poll the job snapshot — `GET /api/sketch/:jobId` (status parsing→parsed→ready). */
    GET_JOB: '/api/sketch/:jobId',
    /** Pin the chosen 2D variant — `POST /api/sketch/:jobId/select-variant` `{ variant_index }`. */
    SELECT_VARIANT: '/api/sketch/:jobId/select-variant',
    /** Build the 3D scene from the active variant — `POST /api/sketch/:jobId/confirm` (slow, ~60s). */
    CONFIRM: '/api/sketch/:jobId/confirm',
  },
  PHASES: {
    LIST: '/phases/project/:projectId',
    /** Create one phase (JSON). RN posts this once per phase after project create. */
    CREATE: '/phases',
    /**
     * Update one phase (PUT, full JSON body { projectId, phaseNumber, description,
     * timeSpentDays, moneySpent }). The technician's "edit phase plan" save on the
     * APPROVED/PHASE_PLANNING screen re-sends every surviving phase. Mirrors the iOS
     * call site bonayd-ios/.../new_request/PhasePlanningView.swift (updatePhase).
     * Verified on dev: PUT /phases/:phaseId → 400 on an empty body (route exists).
     */
    UPDATE: '/phases/:phaseId',
    /**
     * Delete one phase (DELETE, no body) — a phase dropped from the technician's
     * edit-phase-plan editor. Mirrors iOS PhasePlanningView.deletePhase. Verified on
     * dev: DELETE /phases/:phaseId → 403 unauthenticated (route exists, ownership-gated).
     */
    DELETE: '/phases/:phaseId',
    /**
     * Customer approves every phase at once (POST, empty JSON body). The backend
     * saves the phases and moves the project APPROVED/PHASE_PLANNING → CONTRACT_SIGNING
     * (the only transition that unlocks POST /signatures). Idempotent. Mirrors RN
     * `PHASES.APPROVE_ALL` (website-bonyad/src/services/projectContractSigning.ts:49).
     */
    APPROVE_ALL: '/phases/project/:projectId/approve-all',
    /**
     * Customer pays a phase — marks it PAID or PARTIALLY_PAID (POST, optional JSON
     * body: paymentType FULL/PARTIAL · amount · paymentMethod · paymentReference ·
     * gatewayTransactionId). Called on the HyperPay callback after a successful
     * charge. Mirrors RN `PHASES.PAY` (website-bonyad/src/services/PhaseService.ts:138).
     */
    PAY: '/phases/:phaseId/pay',
    /**
     * Technician requests payment for an approved phase (POST, **no body**). Flips
     * the phase paymentStatus PENDING → REQUESTED_PAYMENT so the customer is asked
     * to pay. Backend-gated: technician-only, phase approved, paymentStatus PENDING,
     * project IN_PROGRESS. Mirrors RN `PHASES.REQUEST_PAYMENT`
     * (website-bonyad/src/services/PhaseService.ts:105).
     */
    REQUEST_PAYMENT: '/phases/:phaseId/request-payment',
  },
  /**
   * HyperPay payment gateway (per-phase payments). `create-checkout` returns a
   * hosted `redirectUrl`; after the charge HyperPay redirects to /payment/callback,
   * which verifies via `status/:checkoutId` then marks the phase paid (PHASES.PAY).
   * Mirrors RN `PAYMENT` (website-bonyad/src/services/HyperPayService.ts).
   */
  PAYMENT: {
    /** Create a HyperPay checkout session (POST JSON) → checkoutId + redirectUrl. */
    CREATE_CHECKOUT: '/payments/create-checkout',
    /** Verify a checkout's final result (GET). The checkoutId is appended: `status/:checkoutId`. */
    STATUS: '/payments/status',
    /** The user's payment history (GET, paged `?status&type&page&size`). Mirrors RN
     *  `PAYMENT.MY_TRANSACTIONS` (website-bonyad/src/services/PaymentService.ts:78). */
    MY_TRANSACTIONS: '/payments/my-transactions',
    /** A single transaction by id (GET). Mirrors RN `PAYMENT.TRANSACTION_DETAIL`. */
    TRANSACTION_DETAIL: '/payments/transactions/:id',
    /** Submit a refund request for a transaction (POST `{ reason }`). Mirrors RN
     *  `PAYMENT.REQUEST_REFUND` + iOS PaymentTransactionService.swift:225. */
    REQUEST_REFUND: '/payments/transactions/:id/refund-request',
    /** The user's refund requests (GET, paged `?page&size`). Mirrors RN
     *  `PAYMENT.MY_REFUND_REQUESTS` (website-bonyad/src/services/PaymentService.ts:136). */
    MY_REFUND_REQUESTS: '/payments/my-refund-requests',
  },
  BIDS: {
    CREATE: '/bids/create',
    /** The signed-in technician's own bids across every project (bid-phase work).
     *  Mirrors RN `BIDS.MY_BIDS`. The SP Projects screen merges these (as
     *  BID_RECEIVED pseudo-projects) with `/projects/my-assigned`, which is
     *  assigned-only and never lists pending bids. */
    MY_BIDS: '/bids/my',
    /** All bids on a project; the approved screen reads the ACCEPTED one. */
    LIST: '/bids/project/:projectId',
    /** Withdraw a bid (DELETE only — the backend has no update verb on this path). */
    DELETE: '/bids/:id',
    /** Customer accepts a technician's bid (POST, empty body). Mirrors RN `BIDS.ACCEPT`. */
    ACCEPT: '/bids/:id/accept',
    /** Reject a bid (POST, empty body). Used by an ACTIVE project supervisor managing
     *  the project's bids. Plain `{ error }` body on failure (e.g. "Bid not found").
     *  Mirrors iOS SupervisorActionsService.swift; verified live on the dev backend. */
    REJECT: '/bids/:id/reject',
  },
  CONTRACTS: {
    /**
     * The project's contract record (`id` · `documentUrl` · `status` · `createdAt`),
     * or 404 once none exists yet. Read on the customer's CONTRACT_SIGNING screen to
     * show when the contract was sent. Mirrors RN `CONTRACTS.BY_PROJECT`.
     */
    BY_PROJECT: '/contracts/project/:projectId',
    /**
     * GET → every contract the signed-in user is party to (role-agnostic — works for both
     * customer and technician). `{ userName, contracts: MyContract[], userId, totalContracts }`;
     * each contract carries `project{id,description}` + `technician{id,name}` + `originalDocumentUrl`
     * / `signedDocumentUrl` + `signedAt`. Verified live on the dev backend (customer 443 had 9,
     * technician 444 had 0). Powers the dashboard "Contracts" panel on both sides.
     */
    MY: '/contracts/my',
    /**
     * Generate / refresh the contract PDF and return its URL — **form-urlencoded** body
     * (`projectId, technicianId, language, returnPdf=false`) → `{ downloadUrl | pdfUrl }`.
     * The "Download contract (PDF)" action on the CONTRACT_SIGNING screen calls this,
     * then opens the returned URL (relative URLs resolve against the public site origin).
     * Backend requires the project to be in CONTRACT_SIGNING. Mirrors RN
     * `CONTRACTS.GENERATE_PDF` (website-bonyad/src/components/dashboard/ContractPDFViewer.tsx:116).
     */
    GENERATE_PDF: '/contracts/test/generate-pdf',
  },
  SIGNATURES: {
    /**
     * Create / (re)send the e-sign request — **form-urlencoded** body
     * (`projectId, phaseIds` as repeated fields, `language`, optional `contractTerms`).
     * The backend auto-fetches both parties' emails from their profiles. Requires the
     * project to be in CONTRACT_SIGNING. Mirrors RN `createEmailSignatureRequest`
     * (website-bonyad/src/services/SignatureService.ts:143). The deferred Nafath/Absher
     * variants (`/signatures/signature-nafath`, `…-absher`) add national-id fields and
     * ship with the frame-1 method picker.
     */
    CREATE: '/signatures',
  },
  CHAT: {
    MY_CHATS: '/chat/my-chats',
    MESSAGES: '/chat/room/:roomId/messages',
    SEND: '/chat/send',
    SEND_WITH_FILE: '/chat/send-with-file',
    MARK_READ: '/chat/messages/:messageId/mark-read',
    MARK_ALL_READ: '/chat/rooms/:roomId/mark-all-read',
  },
  NOTIFICATIONS: {
    MY_NOTIFICATIONS: '/notifications/my-notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/mark-all-read',
  },
  /**
   * Saved payment cards (used by both customers and technicians — "unified" in the
   * iOS app's CardManagementView). Card entry is a 1 SAR HyperPay preauthorisation:
   * `prepare` opens a checkout, the shopper enters the card on the hosted page, then
   * `complete` tokenises it and reverses the charge. Mirrors the iOS
   * `TechnicianCardService` (bonayd-ios/.../Utils/TechnicianCardService.swift), which
   * targets `/user/cards*` for every role.
   */
  CARDS: {
    /** GET → `{ success, cards: PaymentCard[] }`. */
    LIST: '/user/cards',
    /** POST → `{ success, checkoutId, redirectUrl? }`. Opens the 1 SAR preauth checkout. */
    PREPARE: '/user/cards/prepare',
    /** POST `{ checkoutId }` → `{ success, card }`. Tokenises the card + reverses the charge. */
    COMPLETE: '/user/cards/complete',
    /** PUT → `{ success, card? }`. Promotes a card to the default payout/payment method. */
    SET_DEFAULT: '/user/cards/:id/default',
    /** DELETE → `{ success }`. Removes a saved card. */
    DELETE: '/user/cards/:id',
  },
  /**
   * Technician portfolio ("My Portfolio — add your works here"). A portfolio holds
   * business info + specialties + a gallery of past projects (each with images).
   * Mirrors the iOS `PortfolioService` (bonayd-ios/.../Models/PortfolioModels.swift).
   * **A 404 (or a "No static resource" routing miss) on `ME`/`MY` means "no portfolio
   * yet"** (the create-vs-manage branch), not an error. The fetcher tries the v2 `ME`
   * first then falls back to legacy `MY` — exactly like `PortfolioService.checkPortfolioExists`
   * (this backend only serves `/me`; `/my` 500s with "No static resource"). The PDF /
   * theme / publish / AI-fill pipeline is intentionally out of scope for now.
   */
  PORTFOLIO: {
    /** GET → the signed-in tech's `Portfolio` (v2 primary). 404 / routing-miss → none. */
    ME: '/portfolios/me',
    /** GET → legacy full portfolio incl. `pastProjects`/`projects`. Fallback for `ME`. */
    MY: '/portfolios/my',
    /** POST (JSON) → create the portfolio. Body: businessName/bio/tagline/yearsActive/specialties/city/isPublic. */
    CREATE: '/portfolios/create',
    /** PATCH (JSON, partial) → edit basic info: businessName/bio/tagline/specialties/yearsActive/published. */
    UPDATE: '/portfolios/me',
    /** GET → the tech's past projects (`PastProject[]`). 404/empty → []. */
    PROJECTS: '/portfolios/projects/my',
    /** POST (JSON) → add a past project (title/description/dates/photos[]/clientName/projectValue/location/isPublic). */
    ADD_PROJECT: '/portfolios/projects/add',
    /** PUT (JSON, full replace incl. combined `photos[]`) → update a past project. */
    UPDATE_PROJECT: '/portfolios/projects/:id',
    /** DELETE → remove a past project. */
    DELETE_PROJECT: '/portfolios/projects/:id',
    /** POST (multipart, field `file`) → upload one image → `{ photoUrl }`. */
    UPLOAD_PHOTO: '/portfolios/projects/upload-photo',
  },
} as const;

/**
 * Same-origin Next route handlers that bridge the browser to the AI foreign hosts
 * (Cloud Run chatbot + AWS refine), since CSP `connect-src 'self'` forbids direct
 * cross-origin calls. The client fetchers call these with `internal: true`; each
 * route forwards to the matching `API_ENDPOINTS.AI.*` path on its foreign host.
 * Kept here (not inline) so no route literal lives outside this file (rule 2).
 */
export const AI_INTERNAL_ROUTES = {
  HEALTH: '/api/ai/health',
  CHAT: '/api/ai/chat',
  CHAT_STREAM: '/api/ai/chat/stream',
  REFINE: '/api/ai/refine',
  /**
   * Same-origin sketch-planner route handlers (forward to the Cloud Run host).
   * Client fetchers call these with `internal: true`; `:jobId` is interpolated
   * before the call. Mirror of `API_ENDPOINTS.SKETCH.*` on the same-origin side.
   */
  SKETCH: {
    IDEA: '/api/sketch/idea',
    GET_JOB: '/api/sketch/:jobId',
    SELECT_VARIANT: '/api/sketch/:jobId/select-variant',
    CONFIRM: '/api/sketch/:jobId/confirm',
  },
} as const;
