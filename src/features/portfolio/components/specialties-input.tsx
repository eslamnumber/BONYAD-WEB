'use client';

import { type KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, PlusIcon } from '@/components/icons';
import { Input, Label } from '@/components/ui';

/** The pills, each with a remove button. */
function SpecialtyChips({ value, onRemove }: { value: string[]; onRemove: (s: string) => void }) {
  const { t } = useTranslation();
  if (value.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2 pt-1">
      {value.map((s) => (
        <li
          key={s}
          className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
        >
          <span dir="auto">{s}</span>
          <button
            type="button"
            onClick={() => onRemove(s)}
            aria-label={t('portfolio.fields.removeSpecialty', { name: s })}
            className="focus-visible:outline-ring -me-1 rounded-full p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2"
          >
            <CloseIcon className="size-3" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Chip input for portfolio specialties. Type a specialty and press Enter (or tap +)
 * to add a pill; each pill has a remove button. Controlled — the parent form owns the
 * `string[]`. My own web design (not the iOS layout); pills use the primary tint.
 */
export function SpecialtiesInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');

  function add() {
    const next = draft.trim();
    if (next && !value.includes(next)) onChange([...value, next]);
    setDraft('');
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-foreground text-start text-sm font-medium">
        {t('portfolio.fields.specialties')}
      </Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('portfolio.fields.specialtiesPlaceholder')}
          className="text-start"
        />
        <button
          type="button"
          onClick={add}
          aria-label={t('portfolio.fields.addSpecialty')}
          className="bg-primary/10 text-primary focus-visible:outline-ring flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <PlusIcon className="size-5" aria-hidden />
        </button>
      </div>
      <SpecialtyChips value={value} onRemove={(s) => onChange(value.filter((v) => v !== s))} />
    </div>
  );
}
