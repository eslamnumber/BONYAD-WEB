'use client';

import { useCallback, useState } from 'react';

import { INITIAL_FORM, type SketchFormState } from '../lib/sketch-form';

/**
 * Local state for the sketch form (no backend until "Generate"). Mirrors the
 * Omdah orchestrator pattern — plain `useState`, no Zustand. `isValid` gates the
 * generate button on a non-empty description.
 */
export function useSketchForm() {
  const [form, setForm] = useState<SketchFormState>(INITIAL_FORM);

  const setField = useCallback(
    <K extends keyof SketchFormState>(key: K, value: SketchFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => setForm(INITIAL_FORM), []);

  return { form, setField, reset, isValid: form.description.trim().length > 0 };
}
