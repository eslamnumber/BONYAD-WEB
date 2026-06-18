import { z } from 'zod';

import { saudiPhoneSchema } from '@/lib/saudi-phone';

/**
 * Refer-a-friend invite request (CLAUDE rule 1: strict zod on the request body).
 * The single field is a Saudi mobile number, validated + normalised by the shared
 * {@link saudiPhoneSchema} so the field can only ever submit a `5XXXXXXXX` body —
 * the same format the rest of the app sends the backend.
 */
export const inviteRequestSchema = z.object({
  phoneNumber: saudiPhoneSchema,
});

export type InviteRequest = z.infer<typeof inviteRequestSchema>;
