'use client';

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

export type OtpBoxesProps = {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  ariaLabel: string;
  disabled?: boolean;
};

type OtpInputProps = {
  digit: string;
  index: number;
  setRef: (el: HTMLInputElement | null) => void;
  focusPrev: () => void;
  focusNext: () => void;
  onDigitChange: (index: number, digit: string) => void;
  onPaste: (e: ClipboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

function OtpInput({
  digit,
  index,
  setRef,
  focusPrev,
  focusNext,
  onDigitChange,
  onPaste,
  disabled,
}: OtpInputProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digit) {
        onDigitChange(index, '');
      } else if (index > 0) {
        focusPrev();
        onDigitChange(index - 1, '');
      }
    } else if (e.key === 'ArrowLeft') {
      focusPrev();
    } else if (e.key === 'ArrowRight') {
      focusNext();
    }
  }

  function handleChange(raw: string) {
    const next = raw.replace(/\D/g, '').slice(-1);
    onDigitChange(index, next);
    if (next) focusNext();
  }

  return (
    <input
      ref={setRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      disabled={disabled}
      aria-label={`Digit ${index + 1}`}
      autoComplete={index === 0 ? 'one-time-code' : 'off'}
      onChange={(e) => handleChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onPaste={onPaste}
      onFocus={(e) => e.target.select()}
      className="bg-login-bg text-foreground focus-visible:ring-primary size-12 rounded-[8px] border border-slate-300 text-center text-base font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
    />
  );
}

export function OtpBoxes({ value, onChange, length = 4, ariaLabel, disabled }: OtpBoxesProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  function handleDigitChange(index: number, next: string) {
    onChange(digits.map((d, i) => (i === index ? next : d)).join(''));
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div role="group" aria-label={ariaLabel} className="flex gap-2">
      {digits.map((d, i) => (
        <OtpInput
          key={i}
          digit={d}
          index={i}
          setRef={(el) => {
            refs.current[i] = el;
          }}
          focusPrev={() => {
            refs.current[i - 1]?.focus();
          }}
          focusNext={() => {
            refs.current[i + 1]?.focus();
          }}
          onDigitChange={handleDigitChange}
          onPaste={handlePaste}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
