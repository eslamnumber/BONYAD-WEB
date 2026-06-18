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

/**
 * Fold the form values into the PUT body — only non-empty fields, mirroring the
 * iOS saveProfile body (MyProfile.swift:716). Technician-only fields are dropped
 * for customers.
 */
export function toProfileUpdateBody(
  v: EditProfileFormValues,
  isTechnician: boolean,
): ProfileUpdateRequest {
  const body: ProfileUpdateRequest = {};
  if (v.name) body.name = v.name;
  if (v.email) body.email = v.email;
  if (v.nationalId) body.nationalId = v.nationalId;
  if (isTechnician) {
    if (v.bio) body.description = v.bio;
    if (v.address) body.address = v.address;
    if (v.yearsOfExperience) body.yearsOfExperience = Number(v.yearsOfExperience);
    if (v.regionId) body.regionId = Number(v.regionId);
  }
  return body;
}
