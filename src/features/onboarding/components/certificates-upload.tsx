'use client';

import { Paperclip, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldHint } from '@/components/ui';
import { Label } from '@/components/ui/label';

import { useConventionalDir } from '../hooks/use-conventional-dir';
import { CERTIFICATE_ACCEPT, MAX_CERTIFICATES, validateCertificate } from '../lib/certificate-file';

const K = 'onboarding.completeProfile';

type Props = { value: File[]; onChange: (files: File[]) => void };

/** Optional certificate / licence upload (images + documents). Validates type/size/count. */
export function CertificatesUpload({ value, onChange }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | undefined>();

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const bad = incoming.map(validateCertificate).find(Boolean);
    if (bad) return setError(t(bad));
    if (value.length + incoming.length > MAX_CERTIFICATES) {
      return setError(t(`${K}.errors.fileCount`, { max: MAX_CERTIFICATES }));
    }
    setError(undefined);
    onChange([...value, ...incoming]);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="cp-certs" className="text-foreground text-end text-sm font-medium">
        {t(`${K}.certificatesLabel`)}
      </Label>
      <input
        ref={inputRef}
        id="cp-certs"
        type="file"
        multiple
        accept={CERTIFICATE_ACCEPT}
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="bg-login-bg text-muted-foreground hover:text-foreground focus-visible:outline-ring border-input flex min-h-12 items-center justify-center gap-2 rounded-[6px] border border-dashed px-4 text-sm font-medium transition-colors focus-visible:outline-2"
      >
        <Upload className="size-5" aria-hidden />
        {t(`${K}.certificatesCta`)}
      </button>
      {value.length > 0 ? (
        <CertificateList
          files={value}
          onRemove={(i) => onChange(value.filter((_, idx) => idx !== i))}
        />
      ) : null}
      <FieldHint tone={error ? 'error' : 'neutral'}>
        {error ?? t(`${K}.certificatesHint`)}
      </FieldHint>
    </div>
  );
}

function CertificateList({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (index: number) => void;
}) {
  const { t } = useTranslation();
  const dir = useConventionalDir();
  // dir scope → leading paperclip on the reading-start side, remove action trailing,
  // file name reading naturally — all via plain logical CSS (no flex-row-reverse).
  return (
    <ul dir={dir} className="flex flex-col gap-2">
      {files.map((file, i) => (
        <li
          key={`${file.name}-${i}`}
          className="bg-field-surface flex min-h-11 items-center gap-2 rounded-[6px] px-3 py-1.5"
        >
          <Paperclip className="text-muted-foreground size-4 shrink-0" aria-hidden />
          <span dir="auto" className="text-foreground flex-1 truncate text-start text-sm">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={t('onboarding.completeProfile.certificatesRemove', { name: file.name })}
            className="text-muted-foreground hover:text-destructive focus-visible:outline-ring flex size-11 shrink-0 items-center justify-center rounded-md focus-visible:outline-2"
          >
            <X className="size-4" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}
