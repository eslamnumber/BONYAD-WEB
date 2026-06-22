# Folder structure

## Top-level layout

```
web/
├── public/                      # Static assets served as-is
├── src/
│   ├── app/                     # Next.js App Router — ROUTES ONLY
│   │   ├── (auth)/              # Route group: auth shell — no AppShell/footer
│   │   │   ├── layout.tsx       #   Minimal layout (logo navbar only)
│   │   │   └── login/page.tsx   #   /login — SSR metadata + labels
│   │   ├── (main)/              # Route group: public pages with AppShell
│   │   │   ├── layout.tsx       #   Wraps children in AppShell (header + footer)
│   │   │   └── page.tsx         #   / — home page
│   │   ├── api/                 # Route handlers: auth/{login,logout} (cookie), proxy/[...path]
│   │   ├── layout.tsx           # Root layout — html/body/Providers ONLY
│   │   ├── error.tsx            # Root error boundary
│   │   ├── not-found.tsx
│   │   └── globals.css          # Tailwind directives + theme tokens ONLY
│   │
│   ├── components/              # SHARED components — used by 2+ features
│   │   ├── ui/                  # shadcn/ui primitives (Button, Input, Dialog…)
│   │   ├── layout/              # AppShell, Sidebar (role-aware: SP vs customer nav + account menu — dashboard-sidebar.tsx + sidebar-nav-config.ts + sidebar-settings-menu.tsx), Header, Footer, settings-detail-chrome.tsx (shared SettingsBackLink + SettingsAmbientGlow — the back-to-Profile link + blue glow on every settings sub-screen: my-info, account-type, cards, portfolio; profile-chrome.tsx re-exports them)
│   │   ├── feedback/            # Toast, ErrorState, EmptyState, LoadingState
│   │   └── data-display/        # DataTable, Pagination, etc.
│   │
│   ├── features/                # Business features — see below
│   │   ├── auth/                # Login, register, forgot-password flows
│   │   ├── assistant/           # Global floating "Bonyad Assistant" chatbot (FAB + chat panel), mounted in the (main) + (app) layouts → every public + dashboard screen, NOT auth/onboarding. FAB pinned bottom inline-end → bottom-right in AR / bottom-left in EN (inverted LOCALE_DIRECTION). Reuses the Omdah Cloud Run chatbot via the existing /api/ai/chat route (AI_INTERNAL_ROUTES.CHAT, internal:true) — no new endpoint/proxy; anonymous-OK. Strips <<WIZARD_STAGE>> markers, ui.suggestions → quick-reply chips, [NAV:] tokens → in-app links (assistant-nav-map, graceful for unknowns). Replies render as organized markdown (bold/lists/paragraphs) revealed by a client-side typewriter (lib/parse-assistant-message + use-typewriter). Zustand store survives route-group swaps; history in-memory. Ported from RN aiChatBotService (backend shape only; original web design). See docs/api-and-auth.md §Bonyad assistant
│   │   ├── onboarding/          # Technician post-signup flow (original web design; iOS/RN = backend/flow reference only). Step 2 "Complete your profile" (POST /users/complete-profile, **multipart**: email/description/address/yearsOfExperience/regionIds[]/certificates[]) → step 3 "Waiting for admin approval" (polls GET /users/technician-status every 15s; PENDING/SUSPENDED/APPROVED→dashboard). Routes live in the `(onboarding)` group reusing the auth split-hero shell (OnboardingShell). The `(app)` + `(onboarding)` layouts sequence the steps via appOnboardingRedirect/onboardingAreaRedirect (lib/onboarding-guard) — `technician-status` is the **authoritative** gate (validate-token lacks profileComplete/status); fail-open so a flaky backend never traps the user. Feature-local get-regions copy (rule 6, mirrors profile's, shares the `['regions']` query key). See docs/api-and-auth.md §Technician onboarding
│   │   ├── dashboard/           # (app) SP dashboard — search, hero, project carousel, job-offer tabs/list (PROJECTS.LIST) + job-offer detail (components/job-offer-detail/: summary/offer-panel[form↔bid-status card]/description/phases + images-gallery (right col) / offer-panel + documents-attachments (left col) — project.files split by type via partitionProjectFiles — via PROJECTS.DETAILS, PHASES.LIST, BIDS.CREATE/LIST/DELETE/ACCEPT + USERS.PROFILE_BY_ID — the SP sees offer-panel (resolves their own bid via useMyBid: BIDS.LIST filtered by auth-store user id, shows the bid-status card; Edit = delete-then-create, Withdraw = BIDS.DELETE; one bid per project, no update verb); the customer/owner sees customer-offer-status which branches on bids: with ≥1 bid → CustomerBidList of bid cards (useProjectBids enriches each bid with the technician rating/avatar via USERS.PROFILE_BY_ID; lowest budget = "best value" purple highlight) → accept-bid modal (BIDS.ACCEPT, accept-only — reject hidden, no backend reject verb) + the bidReceived status pill (--status-bid #8A38F5) on the summary card, with none → the awaiting-offers card + Edit/Delete) + assigned-project detail at /dashboard/projects/[id] (assigned-project-detail.tsx dispatches by lifecycle status → approved-project-detail/ for APPROVED/PHASE_PLANNING ("offer accepted" view: summary + offer-accepted card via useAcceptedBid/BIDS.LIST + reused description/phases/attachments cards + an Edit-phase-plan editor [edit-phase-plan.tsx → phase-plan-editor-modal: add/edit/remove phases, save via useSavePhasePlan = DELETE/PUT/POST /phases, mirrors iOS PhasePlanningView]; PHASE_PLANNING maps to approved in the UI), else completed-project-detail/ or in-progress-project-detail/ (these are the technician views; the **customer** role-splits to customer-approved-detail/ on APPROVED, contract-signing-project-detail/ on CONTRACT_SIGNING, and customer-in-progress-detail/ on IN_PROGRESS — the last drives the per-phase HyperPay payment flow [options→review→checkout modals, lib/{phase-payment,checkout-request,payment-callback}.ts] whose redirect returns to the standalone /payment/callback route in components/payment-callback/; see docs/api-and-auth.md §Customer in-progress + per-phase payment) — all three assigned-project views split PROJECTS.DETAILS.files via lib/project-files.ts (partitionProjectFiles) into a ProjectImagesCard gallery (image files only, read-only thumbnails loaded as CSS background-image — the Avatar convention for arbitrary backend hosts, not next/image; lives in job-offer-detail/ as a shared detail card) under the phases card + an AttachmentsCard (documents only, via its optional files override prop) in the other column; in-progress additionally dropped its old per-phase attachment block) + role-branched landing at /dashboard (page.tsx renders <TechnicianDashboard> for SPs, <CustomerDashboard> for USER role — components/customer/: welcome hero + Start-project/How-it-works CTAs + skyline image (public/images/bg/) & ellipse-glow backdrops, Figma 1394:6486; the (app) DashboardSidebar is role-aware via components/layout/sidebar-nav-config.ts + sidebar-settings-menu.tsx) + **Supervision** (technician-only, components/supervision/ + api/{get-supervising-projects,get-project-supervisor,respond-supervisor-invite,get-supervisor-activity,reject-bid}): /dashboard/supervision (Invitations|Active tabs + accept/decline) and /dashboard/supervision/[id] (control panel — bids accept/reject + activity log), via PROJECTS.SUPERVISING/SUPERVISOR/SUPERVISOR_RESPOND/SUPERVISOR_ACTIVITY + BIDS.REJECT (iOS SupervisorAPIService shape, verified live on dev); entry = technician sidebar "Supervision" nav item + a "دعوات الإشراف" (Supervision invitations) tab in the Discover-projects filter (job-offer-tabs.tsx → JOB_TABS, rendered by JobOffersSection: the panel swaps to `SupervisionList status="invited"` when that tab is active). The standalone SupervisionInvitesHomeSection component still exists but is no longer mounted on the SP home (superseded by the tab). The **customer hire flow** ships too: a CustomerSupervisorCell column in the customer projects table (reads the SupervisorFields now on MyProject — no per-row fetch — via supervisorCardState) → HireSupervisorModal picker (PROJECTS.HIREABLE_TECHNICIANS) + hire/cancel/remove (POST/DELETE PROJECTS.SUPERVISOR; api/{get-hireable-technicians,hire-supervisor,remove-supervisor}, all verified live on dev), with RemoveSupervisorDialog confirming cancel/remove. Two pure libs back it: lib/supervisor-card-state.ts (hireable/pending/active/none → the chip state) and lib/project-format.ts `shortLocation` (trims the long geocoded address to its locality, e.g. "El Mansoura 2"). Cards anchor to the inline-end (flex justify-end, right in ar) and render every dynamic backend value with `<bdi>` + text-end — the app card convention, never `dir="auto"` (which flips Arabic data to the opposite side; see docs/i18n-and-rtl.md). See docs/api-and-auth.md §Project supervision
│   │   ├── blog/                # /blog index — public articles via GET /blogs
│   │   ├── projects/
│   │   ├── bids/
│   │   ├── chat/
│   │   ├── technicians/
│   │   ├── profile/             # Profile/account hub (/dashboard/settings) + its settings sub-screens. The hub reads GET /users/profile (useMyProfile) and merges it with the session user (resolveProfileIdentity) for an instant, role-aware navigation list. Sub-screens: My info (/dashboard/settings/profile, iOS MyProfileView — Wathq verify → PUT profile) and Account type (/dashboard/settings/account-type, iOS CompanyModeToggleView, redesigned to the Figma "Switch to company" card 1682:8239 — an Individual account sees an inline registration form: company name + 10-digit CR + National ID [prefilled from the profile, editable] → Wathq verify → switch-account-type; a verified Company account sees its details + a switch-back-to-individual action; the back link sits inside the card; fields are end-aligned per the inverted RTL map). Sub-screens are single-column, centered via mx-auto + max-w-\* (rule 4a settings exception — mirrors every sibling settings screen, e.g. my-info max-w-2xl, account-type max-w-xl) and use the shared layout/settings-detail-chrome (SettingsBackLink + SettingsAmbientGlow); they never stretch on wide monitors
│   │   ├── portfolio/           # /dashboard/settings/portfolio (technician-only) — "My portfolio". ORIGINAL web design (only the backend contract comes from the iOS PortfolioService). PORTFOLIO.* (/portfolios/*): get/create/edit portfolio + past-project CRUD with multipart image upload (upload-photo→photoUrl). Branches create-vs-manage on GET /portfolios/my (404=none). PDF/theme/publish/share/AI pipeline deferred
│   │   ├── cards/               # /dashboard/settings/cards — saved payment cards (CARDS.*, /user/cards): list/set-default/delete + add-card via 1 SAR HyperPay preauth (prepare→hosted redirect→complete). iOS CardManagementView; role-aware (payouts vs payments)
│   │   ├── subscriptions/       # /dashboard/settings/subscriptions (technician-only) — "My subscriptions". iOS SubscriptionManagementView: current plan + weekly bid-usage meter + cancel. USERS.SUBSCRIPTION(_BIDS) /users/subscription(/bids) (404=empty) + DELETE cancel. Subscribe/plan-picker/HyperPay-payment deferred (empty-state CTA → /for-pros#packages)
│   │   ├── support/             # /dashboard/settings/support (BOTH roles) — "Support center". Mirrors the iOS TWO-TAB centre (original web design, SegmentedTabs): (1) Conversations — requests filtered All/Pending/Active/Resolved; an assigned request opens a LIVE chat (GET /chat/room/:roomId/messages + POST /chat/send + mqttChat realtime on chat/room/{roomId}), else a read-only detail; (2) Tickets — threaded admin-replied: GET /support/tickets?status=, GET /support/tickets/:id (messages[]), POST /support/tickets (categoryId/subcategoryId from GET /support/categories/hierarchy), POST /support/tickets/:id/messages, PUT /support/tickets/:id/resolve. Backend contract only from iOS SupportRequestService + RN SupportTicketService; status/priority/category are backend strings (never z.enum on responses). Shared SegmentedTabs (components/ui), StatusPill/MessageBubble/MessageComposer. File-attach create + AI pre-step deferred. Not curl-verified on dev (auth-gated); permissive responses = rule-1 safeguard. See docs/api-and-auth.md §Support center
│   │   ├── feedback/            # /dashboard/settings/feedback (BOTH roles) — "Feedback / الملاحظات". Original web design; backend contract supplied by product (iOS-native, not in RN index). My-feedback list (pending/error/empty/success, newest-first) + compose modal (category/subject/message, 1000-char cap). APP_FEEDBACK.SUBMIT (POST /app-feedback, strict body, subject→null when blank) + APP_FEEDBACK.MINE (GET /app-feedback/mine → bare array or {feedback}/{data} envelope, permissive). category/status are backend strings (never z.enum on responses); resolveFeedbackStatus → status-offer/progress/approved tones. DIRECTION OVERRIDE: conventional dir (en→ltr, ar→rtl) via conventionalDirection() on root+modal, scoped exception to inverted LOCALE_DIRECTION (like support). Attachments/pagination deferred. See docs/api-and-auth.md §Feedback
│   │   ├── sketch/              # /dashboard/projects/create/sketch (BOTH roles) — "Smart 2D → 3D design", wired from the create-project chooser's smartDesign card. 4-phase flow (form → generating → 2D variant picker → 3D dollhouse) over the SAME Cloud Run host as Omdah: SKETCH.* foreign paths via 4 new src/app/api/sketch/* route handlers, AI_INTERNAL_ROUTES.SKETCH.* same-origin (internal:true). api/ = sketch-types (permissive snake_case SketchJob) + submit-idea/get-sketch-job(poll 1.5s)/select-variant/confirm-sketch (+ tests). 2D variants render the backend SVG in a sandboxed iframe; 3D is three.js + @react-three/fiber (dynamic ssr:false; pure geometry in lib/sketch-geometry.ts, WebGL palette in lib/scene-palette.ts — three can't read CSS tokens). CONVENTIONAL dir (en→ltr, ar→rtl) like Omdah/feedback. Voice/transcribe deferred (text-only). Slider+Stepper lifted to components/ui. See docs/api-and-auth.md §2D → 3D sketch planner
│   │   ├── payments/            # no standalone feature folder — the Transactions screen (iOS TransactionsView; route /dashboard/payments, ALL roles, reached from the profile-hub "Transactions" row) lives in dashboard/components/transactions/ + dashboard/api/{get-my-transactions,get-my-refund-requests,request-refund} (payment code stays in the dashboard feature, like create-checkout/pay-phase): payment-history tab (status filter + load-more) + refund-requests tab + request-refund modal (reason ≥10) via PAYMENT.MY_TRANSACTIONS/TRANSACTION_DETAIL/REQUEST_REFUND/MY_REFUND_REQUESTS. See docs/api-and-auth.md §Transactions & refunds
│   │   ├── notifications/
│   │   └── …
│   │
│   ├── lib/                     # Preconfigured clients + shared infra
│   │   ├── api-client.ts        # Typed fetch wrapper (browser→proxy, server→backend)
│   │   ├── backend.ts           # BACKEND_BASE_URL + proxy prefix
│   │   ├── session.ts           # validate-token contract + toAuthUser normaliser
│   │   ├── server-auth.ts       # getServerToken / getServerUser (reads httpOnly cookie)
│   │   ├── i18n.ts              # i18next config — initialized once
│   │   ├── sentry.ts            # Sentry init
│   │   └── analytics.ts
│   │
│   ├── config/                  # App-wide constants
│   │   ├── env.ts               # Typed env-var access (zod-validated)
│   │   ├── routes.ts            # Centralized route paths
│   │   ├── endpoints.ts         # API_ENDPOINTS mirror of RN app
│   │   └── constants.ts         # Pagination sizes, debounce ms, etc.
│   │
│   ├── hooks/                   # SHARED hooks (useDebounce, useMediaQuery…)
│   ├── stores/                  # SHARED Zustand stores (auth, ui, locale)
│   ├── types/                   # SHARED types (User, Role, ApiError…)
│   ├── utils/                   # SHARED pure functions (formatDate, cn…)
│   ├── styles/
│   │   └── tokens.css           # @theme tokens — colors, fonts, radii, spacing
│   ├── locales/
│   │   ├── en.json
│   │   └── ar.json
│   └── testing/                 # Test setup, MSW handlers, fixtures
│
├── e2e/                         # Playwright tests
├── docs/                        # This folder
├── .env.example                 # All required env vars documented
├── eslint.config.mjs
├── tailwind.config.ts           # Tailwind v4 minimal config — tokens in CSS
├── next.config.ts
└── tsconfig.json                # strict: true, paths: { "@/*": ["./src/*"] }
```

## Inside a feature folder

A feature is a vertical slice (auth, projects, chat…). Each feature folder:

```
features/<feature-name>/
├── api/                         # All HTTP — one file per endpoint
│   ├── get-projects.ts
│   ├── create-project.ts
│   └── index.ts                 # Re-exports
├── components/                  # Components used ONLY inside this feature
├── hooks/                       # Feature-local hooks
├── stores/                      # Feature-local Zustand store (rare)
├── schemas/                     # zod schemas (form + API request/response)
├── types/                       # Feature-local TS types (derived from zod)
├── utils/                       # Feature-local pure helpers
└── index.ts                     # Public API — re-exports for other layers
```

## Folder rules

1. **Routes contain no logic.** `app/(main)/page.tsx` or `app/(auth)/login/page.tsx` may only render a feature component and set metadata. Move all logic to the feature component.
2. **A file goes in a feature folder if it's used by ≤1 feature.** If a second feature needs it, promote to the top-level shared folder.
3. **No "common" or "shared" inside a feature.** If you feel the urge, the thing belongs at the top level.
4. **No deep nesting.** Max 2 levels inside a feature (`features/auth/components/login-form.tsx` is fine; `features/auth/components/forms/login/index.tsx` is not).
5. **Every feature has an `index.ts` barrel.** Other layers import from `@/features/auth`, never `@/features/auth/components/login-form`.
6. **Files and folders are `kebab-case`.** Default exports inside are `PascalCase` for components (see [naming.md](naming.md)).
