/**
 * API endpoint paths — mirrors website-bonyad/src/config/api.ts.
 * No endpoint string literal may appear outside this file.
 * Dynamic segments use `:param` convention; replace at call-site.
 */
export const API_ENDPOINTS = {
  USERS: {
    REGISTER: '/users/register',
    /**
     * Approved technicians with `averageRating` — the direct-assignment picker.
     * Mirrors RN `USER.TECHNICIANS_LIST`. Optional `?serviceId=&searchQuery=`.
     */
    TECHNICIANS_LIST: '/users/technicians',
    /**
     * A user's public profile by id (`averageRating` + `totalReviews` + avatar).
     * Mirrors RN `USER.PROFILE_BY_ID` — used to enrich each bid card with the
     * technician's rating/avatar (RN BidReceivedProjectScreen / BidReviewPage).
     */
    PROFILE_BY_ID: '/users/:id/profile',
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
  SUBSCRIPTIONS: {
    CATEGORIES: '/subscriptions/categories',
  },
  SERVICES: {
    /** All services (categories + subcategories). */
    LIST: '/services',
    /** Top-level categories only (isCategory=true) — the create-project category picker. */
    CATEGORIES: '/services/categories',
    /** Subcategories of a category. */
    SUBCATEGORIES: '/services/:categoryId/subcategories',
  },
  /** Service regions/zones (mirrors RN `ZONES.LIST`). The create-project location picker. */
  ZONES: {
    LIST: '/regions',
  },
  FAQS: {
    LIST: '/faqs',
  },
  CONTACT: {
    SUBMIT: '/contact',
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
  },
  PHASES: {
    LIST: '/phases/project/:projectId',
    /** Create one phase (JSON). RN posts this once per phase after project create. */
    CREATE: '/phases',
    /**
     * Customer approves every phase at once (POST, empty JSON body). The backend
     * saves the phases and moves the project APPROVED/PHASE_PLANNING → CONTRACT_SIGNING
     * (the only transition that unlocks POST /signatures). Idempotent. Mirrors RN
     * `PHASES.APPROVE_ALL` (website-bonyad/src/services/projectContractSigning.ts:49).
     */
    APPROVE_ALL: '/phases/project/:projectId/approve-all',
  },
  BIDS: {
    CREATE: '/bids/create',
    /** All bids on a project; the approved screen reads the ACCEPTED one. */
    LIST: '/bids/project/:projectId',
    /** Withdraw a bid (DELETE only — the backend has no update verb on this path). */
    DELETE: '/bids/:id',
    /** Customer accepts a technician's bid (POST, empty body). Mirrors RN `BIDS.ACCEPT`. */
    ACCEPT: '/bids/:id/accept',
  },
  CONTRACTS: {
    /**
     * The project's contract record (`id` · `documentUrl` · `status` · `createdAt`),
     * or 404 once none exists yet. Read on the customer's CONTRACT_SIGNING screen to
     * show when the contract was sent. Mirrors RN `CONTRACTS.BY_PROJECT`.
     */
    BY_PROJECT: '/contracts/project/:projectId',
  },
  SIGNATURES: {
    /**
     * Create / (re)send the e-sign request — **form-urlencoded** body
     * (`projectId, technicianId, userEmail, technicianEmail, phaseIds(csv), language`).
     * Backend requires the project to be in CONTRACT_SIGNING. Mirrors RN
     * `SIGNATURES.CREATE` / `CONTRACTS.CREATE` (both `/signatures`). The deferred
     * Nafath/Absher variants (`/signatures/signature-nafath`, `…-absher`) ship with
     * the frame-1 method picker.
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
} as const;
