'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';

type FaqItemData = { id: number; question: string; answer: string };
type Props = { items: FaqItemData[] };
type ItemProps = FaqItemData & { isOpen: boolean; onToggle: () => void };

function FaqItem({ question, answer, isOpen, onToggle }: ItemProps) {
  const Icon = isOpen ? X : Plus;

  return (
    <div className="border-border border-t">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-4 py-6"
      >
        <Icon
          aria-hidden
          className={`mt-0.5 size-6 shrink-0 ${isOpen ? 'text-primary' : 'text-primary/60'}`}
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
      {isOpen && (
        <p dir="auto" className="text-foreground/60 pb-6 text-start text-base leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

export function HowItWorksFaqClient({ items }: Props) {
  const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null);

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
