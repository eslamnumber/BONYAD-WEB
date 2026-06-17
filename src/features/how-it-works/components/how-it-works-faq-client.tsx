'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

type FaqItemData = { id: number; question: string; answer: string };
type Props = { items: FaqItemData[] };
type ItemProps = FaqItemData & { isOpen: boolean; onToggle: () => void };

/** Split an answer into display lines: explicit newlines (bullet lists) first, then sentences. */
function toLines(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((para) => para.split(/(?<=[.!?؟])\s+/))
    .map((line) => line.trim())
    .filter(Boolean);
}

function FaqAnswer({
  panelId,
  answer,
  isOpen,
}: {
  panelId: string;
  answer: string;
  isOpen: boolean;
}) {
  return (
    <div
      id={panelId}
      aria-hidden={!isOpen}
      className={`grid duration-300 ease-out motion-safe:transition-[grid-template-rows] ${
        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="space-y-1 pb-6">
          {toLines(answer).map((line, index) => (
            <p
              key={index}
              dir="auto"
              className="text-foreground/60 text-start text-base leading-relaxed"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ id, question, answer, isOpen, onToggle }: ItemProps) {
  const panelId = `faq-panel-${id}`;

  return (
    <div className="border-border border-t">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-start gap-4 py-6"
      >
        <Plus
          aria-hidden
          className={`mt-0.5 size-6 shrink-0 transition-[transform,color] duration-300 ease-out ${
            isOpen ? 'text-primary rotate-45' : 'text-primary/60'
          }`}
        />
        <span
          dir="auto"
          className={`flex-1 text-start text-lg leading-snug ${
            isOpen ? 'text-primary font-semibold' : 'text-foreground/80 font-medium'
          }`}
        >
          {question}
        </span>
      </button>
      <FaqAnswer panelId={panelId} answer={answer} isOpen={isOpen} />
    </div>
  );
}

export function HowItWorksFaqClient({ items }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="border-border w-full border-b">
      {items.map((item) => (
        <FaqItem
          key={item.id}
          {...item}
          isOpen={openId === item.id}
          onToggle={() => setOpenId(openId === item.id ? null : item.id)}
        />
      ))}
    </div>
  );
}
