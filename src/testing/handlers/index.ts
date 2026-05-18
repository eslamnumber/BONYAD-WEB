import { type RequestHandler } from 'msw';

/**
 * MSW request handlers — one entry per feature, registered here.
 *
 * The array is intentionally empty during the public-screens phase. When backend
 * integration lands, add a `<feature>.ts` per feature and re-export here.
 */
export const handlers: RequestHandler[] = [];
