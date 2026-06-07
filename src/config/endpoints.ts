/**
 * API endpoint paths — mirrors website-bonyad/src/config/api.ts.
 * No endpoint string literal may appear outside this file.
 * Dynamic segments use `:param` convention; replace at call-site.
 */
export const API_ENDPOINTS = {
  USERS: {
    REGISTER: '/users/register',
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
    DETAILS: '/projects/:id',
    /** Technician's assigned projects (bidding + direct). Optional `?type=`. */
    MY_ASSIGNED: '/projects/my-assigned',
  },
  PHASES: {
    LIST: '/phases/project/:projectId',
  },
  BIDS: {
    CREATE: '/bids/create',
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
