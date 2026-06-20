/**
 * Hosts for the Omdah AI project-creation flow that are NOT the main app backend.
 *
 * Two of the three AI backends live on their own hosts (the conversational
 * chatbot on Google Cloud Run, the SOW-refine service on AWS). The browser
 * cannot reach them directly — CSP `connect-src 'self'` forbids cross-origin —
 * so the client hits same-origin Next route handlers under `/api/ai/*`, which
 * forward here server-side. Mirrors the iOS `ChatbotAPIService.defaultBaseURL`
 * and `SOWRefineService.baseURL`.
 *
 * URLs are hardcoded on purpose (same rationale as `api-environments.ts`): this
 * module must NOT read `process.env` — env access lives only in `src/config/env.ts`.
 * The main-API AI endpoints (service match, create-from-ai, phases, attachments,
 * draft) are NOT here — they go through the standard `/api/proxy/*` backend.
 */
export const AI_HOSTS = {
  /** Conversational wizard + SOW streaming (Cloud Run). Health, /chat, /chat/stream. */
  chatbot: 'https://bonyad-chat-1026710889441.me-central1.run.app',
  /** Natural-language SOW refine service (AWS). /api/project/refine/await. */
  refine: 'https://3-120-251-178.nip.io',
} as const;
