'use client';

import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchIcon } from '@/components/icons';
import { Modal, ModalHeader } from '@/components/ui';

import { useTechnicians } from '../../api/get-technicians';
import { technicianName, technicianPhone } from '../../lib/technician-format';
import { type Technician } from '../../schemas/technician';

import { TechnicianRow } from './technician-row';

const K = 'dashboard.createProject.technicianPicker';

type Props = { open: boolean; onClose: () => void; onChoose: (technician: Technician) => void };

/** Direct-assignment picker (Figma 1394:7809): search + technician list over a scrim. */
export function TechnicianPickerModal({ open, onClose, onChoose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const [query, setQuery] = useState('');
  const techs = useTechnicians({}, open);
  const rows = filterTechnicians(techs.data ?? [], query);

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <ModalHeader
        titleId={titleId}
        title={t(`${K}.title`)}
        closeLabel={t(`${K}.close`)}
        onClose={onClose}
      />
      <div className="flex flex-col gap-4 p-6">
        <SearchBar value={query} onChange={setQuery} placeholder={t(`${K}.searchPlaceholder`)} />
        <div className="border-border divide-border divide-y overflow-hidden rounded-lg border">
          <PickerBody state={techs} rows={rows} onChoose={onChoose} />
        </div>
      </div>
    </Modal>
  );
}

function filterTechnicians(list: Technician[], query: string): Technician[] {
  const term = query.trim().toLowerCase();
  if (!term) return list;
  return list.filter((tech) => {
    const name = technicianName(tech).toLowerCase();
    const phone = (technicianPhone(tech) ?? '').toLowerCase();
    return name.includes(term) || phone.includes(term);
  });
}

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="border-border flex h-11 items-center justify-end gap-2.5 rounded-full border px-3">
      <input
        type="search"
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        // [direction:inherit] defeats the UA `direction: ltr` on type=search; the
        // placeholder's leading "…" keeps the dots after the text — i18n-and-rtl rule 5.
        className="placeholder:text-input-placeholder min-w-0 flex-1 bg-transparent text-end text-sm outline-none [direction:inherit]"
      />
      <SearchIcon aria-hidden className="text-foreground/40 size-[18px] shrink-0" />
    </div>
  );
}

function PickerBody({
  state,
  rows,
  onChoose,
}: {
  state: ReturnType<typeof useTechnicians>;
  rows: Technician[];
  onChoose: (technician: Technician) => void;
}) {
  const { t } = useTranslation();
  if (state.isPending) return <Message text={t(`${K}.loading`)} />;
  if (state.isError) return <Message text={t(`${K}.error`)} />;
  if (rows.length === 0) return <Message text={t(`${K}.empty`)} />;
  return (
    <>
      {rows.map((tech) => (
        <TechnicianRow key={tech.id} technician={tech} onChoose={() => onChoose(tech)} />
      ))}
    </>
  );
}

function Message({ text }: { text: string }) {
  return <p className="text-foreground/60 p-6 text-center text-sm">{text}</p>;
}
