'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useServiceSubcategories } from '../api/get-service-subcategories';
import { localizedName } from '../lib/setup-localized-name';
import type { SetupService } from '../schemas/setup';

import { SelectionBox } from './service-selection-box';
import { SubcategoryList } from './service-subcategory-list';

const K = 'onboarding.setup.services';
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type RowProps = {
  category: SetupService;
  locale: Locale;
  isSelected: (id: number) => boolean;
  onToggle: (service: SetupService, categoryId: number) => void;
  /** True once the category itself or any of its subservices is selected (the cap counts it). */
  engaged: boolean;
  /** Plan category cap reached — a not-yet-engaged category can't be started. */
  capReached: boolean;
};

/** An expandable category. The header check selects the whole category as a single service
 *  (no subservices required); expanding lets you instead pick specific leaf services. The
 *  backend's `serviceIds` accepts category IDs, subcategory IDs, or a mix. At the plan's
 *  category cap, a category you haven't started is locked (you can still refine chosen ones). */
export function ServiceCategoryRow({
  category,
  locale,
  isSelected,
  onToggle,
  engaged,
  capReached,
}: RowProps) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useServiceSubcategories(category.id, open);
  const name = localizedName(category.nameAr, category.nameEn, locale);
  const categorySelected = isSelected(category.id);
  const locked = capReached && !engaged;

  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border">
      <CategoryHeader
        name={name}
        open={open}
        engaged={engaged}
        categorySelected={categorySelected}
        locked={locked}
        onToggleOpen={() => setOpen((v) => !v)}
        onToggleSelect={() => onToggle(category, category.id)}
      />
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="sub"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
            className="overflow-hidden"
          >
            <SubcategoryList
              items={data}
              isLoading={isLoading}
              isError={isError}
              locale={locale}
              isSelected={isSelected}
              onToggle={(sub) => onToggle(sub, category.id)}
              locked={locked}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type HeaderProps = {
  name: string;
  open: boolean;
  engaged: boolean;
  categorySelected: boolean;
  locked: boolean;
  onToggleOpen: () => void;
  onToggleSelect: () => void;
};

function CategoryHeader({
  name,
  open,
  engaged,
  categorySelected,
  locked,
  onToggleOpen,
  onToggleSelect,
}: HeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full items-center gap-1 px-2">
      <CategorySelectButton
        name={name}
        selected={categorySelected}
        disabled={locked}
        onToggle={onToggleSelect}
      />
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        className="focus-visible:outline-ring flex flex-1 items-center justify-between gap-3 py-4 pe-1 text-start focus-visible:outline-2"
      >
        <CategoryLabel name={name} engaged={engaged} categorySelected={categorySelected} />
        <span className="text-muted-foreground flex shrink-0 items-center gap-2 text-xs">
          {open ? t(`${K}.hideServices`) : t(`${K}.showServices`)}
          <ChevronDown
            className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </span>
      </button>
    </div>
  );
}

function CategoryLabel({
  name,
  engaged,
  categorySelected,
}: {
  name: string;
  engaged: boolean;
  categorySelected: boolean;
}) {
  const { t } = useTranslation();
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="flex items-center gap-2">
        <span dir="auto" className="text-foreground truncate text-sm font-semibold">
          {name}
        </span>
        {engaged ? (
          <span className="bg-primary size-1.5 shrink-0 rounded-full" aria-hidden />
        ) : null}
      </span>
      {categorySelected ? (
        <span className="text-primary text-xs">{t(`${K}.allServices`)}</span>
      ) : null}
    </span>
  );
}

function CategorySelectButton({
  name,
  selected,
  disabled,
  onToggle,
}: {
  name: string;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={t(`${K}.selectCategory`, { name })}
      className="focus-visible:outline-ring flex shrink-0 items-center justify-center rounded-lg p-3 focus-visible:outline-2 disabled:opacity-40"
    >
      <SelectionBox selected={selected} />
    </button>
  );
}
