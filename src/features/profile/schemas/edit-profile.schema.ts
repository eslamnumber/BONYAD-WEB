import { z } from 'zod';

const EP = 'profile.myInfo.editProfile.errors';
const noDigits = (s: string) => !/\d/.test(s);

/**
 * Edit-profile form. Name is required (no digits); email + National ID are
 * optional but format-checked when present. The technician-only fields (bio,
 * address, zone, years) are always in the shape but only sent for technicians.
 * Messages are i18n keys (forms-validation rule 4).
 */
export const editProfileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'auth.errors.nameRequired' })
    .refine(noDigits, { message: 'auth.errors.nameNoDigits' }),
  email: z.union([
    z.literal(''),
    z
      .string()
      .trim()
      .email({ message: `${EP}.email` }),
  ]),
  nationalId: z.union([
    z.literal(''),
    z
      .string()
      .trim()
      .regex(/^\d{10}$/, { message: `${EP}.nationalId` }),
  ]),
  bio: z.string().trim(),
  address: z.string().trim(),
  regionId: z.string(),
  yearsOfExperience: z.string(),
});

export type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;

/** Strict PUT /users/profile body — every field optional, sent only when present. */
export const profileUpdateRequestSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  nationalId: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  yearsOfExperience: z.number().int().nonnegative().optional(),
  regionId: z.number().int().positive().optional(),
});

export type ProfileUpdateRequest = z.infer<typeof profileUpdateRequestSchema>;

/** Universal form keys that map straight onto the PUT body. */
const SCALAR_FIELDS = ['name', 'email', 'nationalId'] as const;
/** Technician-only form keys, sent only when the signed-in user is a technician. */
const TECH_FIELDS = ['bio', 'address', 'yearsOfExperience', 'regionId'] as const;

/**
 * Non-empty form fields whose value differs from the loaded profile. With no
 * baseline (`original` omitted) every non-empty field counts as changed.
 */
function changedFields(
  v: EditProfileFormValues,
  original: EditProfileFormValues | undefined,
  keys: readonly (keyof EditProfileFormValues)[],
): Set<string> {
  const out = new Set<string>();
  for (const k of keys) {
    if (v[k] && (!original || v[k] !== original[k])) out.add(k);
  }
  return out;
}

/**
 * Fold the form values into the PUT body — **only the fields the user actually
 * changed** (diffed against `original`), mirroring the iOS saveProfile body
 * (MyProfile.swift:716). The backend does a full-row update, so re-sending an
 * *unchanged* `email` re-writes the unique column and 500s on `users_email_key`;
 * untouched fields must never ride along. Technician-only fields drop for customers.
 */
export function toProfileUpdateBody(
  v: EditProfileFormValues,
  isTechnician: boolean,
  original?: EditProfileFormValues,
): ProfileUpdateRequest {
  const keys = isTechnician ? [...SCALAR_FIELDS, ...TECH_FIELDS] : SCALAR_FIELDS;
  const c = changedFields(v, original, keys);
  const body: ProfileUpdateRequest = {};
  if (c.has('name')) body.name = v.name;
  if (c.has('email')) body.email = v.email;
  if (c.has('nationalId')) body.nationalId = v.nationalId;
  if (c.has('bio')) body.description = v.bio;
  if (c.has('address')) body.address = v.address;
  if (c.has('yearsOfExperience')) body.yearsOfExperience = Number(v.yearsOfExperience);
  if (c.has('regionId')) body.regionId = Number(v.regionId);
  return body;
}
