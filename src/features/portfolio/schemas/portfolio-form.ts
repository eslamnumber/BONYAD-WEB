import { z } from 'zod';

import { todayIso } from '../lib/project-display';

import {
  type CreatePortfolioRequest,
  type Portfolio,
  type PortfolioProject,
  type ProjectInput,
  type UpdatePortfolioRequest,
} from './portfolio';

const optionalText = z.string().trim().optional();

/** Basic-info form (create + edit). Error messages are i18n keys resolved via `t()`. */
export const portfolioFormSchema = z.object({
  businessName: z.string().trim().min(1, 'portfolio.errors.businessNameRequired'),
  tagline: optionalText,
  bio: optionalText,
  city: optionalText,
  /** Numeric string from the input; mapped to a number on submit. */
  yearsActive: z.string().trim().optional(),
  specialties: z.array(z.string().trim().min(1)),
  isPublic: z.boolean(),
});

export type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

export const emptyPortfolioForm: PortfolioFormValues = {
  businessName: '',
  tagline: '',
  bio: '',
  city: '',
  yearsActive: '',
  specialties: [],
  isPublic: true,
};

function toYears(value: string | undefined): number | undefined {
  const n = Number((value ?? '').trim());
  return Number.isFinite(n) && n >= 0 && value?.trim() ? Math.floor(n) : undefined;
}

function blankToUndefined(value: string | undefined): string | undefined {
  const t = (value ?? '').trim();
  return t ? t : undefined;
}

/** Map the form to the strict POST /portfolios/create body. */
export function toCreateRequest(values: PortfolioFormValues): CreatePortfolioRequest {
  return {
    businessName: values.businessName.trim(),
    tagline: blankToUndefined(values.tagline),
    bio: blankToUndefined(values.bio),
    city: blankToUndefined(values.city),
    yearsActive: toYears(values.yearsActive),
    specialties: values.specialties,
    isPublic: values.isPublic,
  };
}

/** Map the form to the strict PATCH /portfolios/me body (`isPublic` → `published`). */
export function toUpdateRequest(values: PortfolioFormValues): UpdatePortfolioRequest {
  return {
    businessName: values.businessName.trim(),
    tagline: blankToUndefined(values.tagline),
    bio: blankToUndefined(values.bio),
    yearsActive: toYears(values.yearsActive),
    specialties: values.specialties,
    published: values.isPublic,
  };
}

/** Pre-fill the basic-info form from an existing portfolio (for the edit modal). */
export function portfolioToForm(portfolio: Portfolio): PortfolioFormValues {
  const years = portfolio.yearsActive ?? portfolio.yearsOfExperience;
  return {
    businessName: portfolio.businessName ?? portfolio.userName ?? '',
    tagline: portfolio.tagline ?? '',
    bio: portfolio.bio ?? '',
    city: portfolio.city ?? '',
    yearsActive: years !== undefined ? String(years) : '',
    specialties: portfolio.specialties,
    isPublic: portfolio.published ?? portfolio.isPublic ?? true,
  };
}

/** Pre-fill the project form from an existing project (for the edit modal). */
export function projectToForm(project: PortfolioProject): ProjectFormValues {
  return {
    title: project.title,
    description: project.description ?? '',
    startDate: project.startDate ?? '',
    endDate: project.endDate ?? '',
    clientName: project.clientName ?? '',
    projectValue: project.projectValue !== undefined ? String(project.projectValue) : '',
    location: project.location ?? '',
    isPublic: project.isPublic ?? true,
  };
}

/** True when the optional money string is empty or a positive finite number. */
function isValidProjectValue(value: string | undefined): boolean {
  if (!value) return true;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

/**
 * Project add/edit form. Error messages are i18n keys (resolved via `t()`).
 * Validation: title required, free-text capped; neither date may be in the future
 * and the end may not precede the start; project value (when given) must be > 0.
 */
export const projectFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'portfolio.errors.titleRequired')
      .max(120, 'portfolio.errors.titleTooLong'),
    description: z.string().trim().max(1000, 'portfolio.errors.descriptionTooLong').optional(),
    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
    clientName: z.string().trim().max(120, 'portfolio.errors.clientNameTooLong').optional(),
    /** Numeric string; mapped to a number on submit. */
    projectValue: z.string().trim().optional(),
    location: z.string().trim().max(160, 'portfolio.errors.locationTooLong').optional(),
    isPublic: z.boolean(),
  })
  .refine((v) => !v.startDate || v.startDate <= todayIso(), {
    message: 'portfolio.errors.startInFuture',
    path: ['startDate'],
  })
  .refine((v) => !v.endDate || v.endDate <= todayIso(), {
    message: 'portfolio.errors.endInFuture',
    path: ['endDate'],
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: 'portfolio.errors.endBeforeStart',
    path: ['endDate'],
  })
  .refine((v) => isValidProjectValue(v.projectValue), {
    message: 'portfolio.errors.valueInvalid',
    path: ['projectValue'],
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const emptyProjectForm: ProjectFormValues = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  clientName: '',
  projectValue: '',
  location: '',
  isPublic: true,
};

/** Map the project form + assembled photo URLs to the strict add/update body. */
export function toProjectInput(values: ProjectFormValues, photos: string[]): ProjectInput {
  const value = Number((values.projectValue ?? '').trim());
  return {
    title: values.title.trim(),
    description: blankToUndefined(values.description),
    startDate: blankToUndefined(values.startDate),
    endDate: blankToUndefined(values.endDate),
    clientName: blankToUndefined(values.clientName),
    projectValue: Number.isFinite(value) && value > 0 ? value : undefined,
    location: blankToUndefined(values.location),
    photos,
    isPublic: values.isPublic,
  };
}
