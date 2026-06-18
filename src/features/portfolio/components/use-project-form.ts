'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useAddProject } from '../api/add-project';
import { useUpdateProject } from '../api/update-project';
import { uploadPhotos } from '../api/upload-photo';
import { localizedPortfolioError } from '../lib/portfolio-error';
import { type PortfolioProject } from '../schemas/portfolio';
import {
  emptyProjectForm,
  type ProjectFormValues,
  projectFormSchema,
  projectToForm,
  toProjectInput,
} from '../schemas/portfolio-form';

/**
 * Form + image state + submit for the add/edit project modal. Uploads newly-picked
 * images first ({@link uploadPhotos}), concatenates them with kept URLs, then POSTs
 * (add) or PUTs (full-replace edit). Keeps {@link ProjectFormModal} thin.
 */
export function useProjectForm(project: PortfolioProject | undefined, onClose: () => void) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const add = useAddProject();
  const update = useUpdateProject();
  const [existing, setExisting] = useState<string[]>(project?.photos ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project ? projectToForm(project) : emptyProjectForm,
    mode: 'onTouched',
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const uploaded = await uploadPhotos(files);
      const input = toProjectInput(values, [...existing, ...uploaded]);
      if (project) await update.mutateAsync({ id: project.id, input });
      else await add.mutateAsync(input);
      onClose();
    } catch (err) {
      form.setError('root', {
        message: localizedPortfolioError(err, locale, t('portfolio.errors.projectFailed')),
      });
    }
  });

  return {
    form,
    existing,
    setExisting,
    files,
    setFiles,
    onSubmit,
    pending: add.isPending || update.isPending || form.formState.isSubmitting,
  };
}
