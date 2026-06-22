'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

import {
  containsTable,
  type InlineSeg,
  type MessageBlock,
  parseMessageBlocks,
  toPlainText,
} from '../lib/parse-assistant-message';
import { useTypewriter } from '../lib/use-typewriter';
import { useAssistantStore } from '../store/assistant-store';

const NAV_LINK = 'text-primary font-semibold underline underline-offset-2 hover:opacity-80';
const RIYAL = 'mx-0.5 inline-block h-[0.95em] w-auto translate-y-[0.08em]';
const CELL = 'border-border border px-2.5 py-1.5 text-start align-top';

function InlineRun({ segs }: { segs: InlineSeg[] }) {
  const { t } = useTranslation();
  const close = useAssistantStore((s) => s.close);
  return (
    <>
      {segs.map((s, i) => {
        if (s.t === 'text') return <span key={i}>{s.v}</span>;
        if (s.t === 'bold' || s.t === 'quote')
          return (
            <strong key={i} className="font-semibold">
              {s.v}
            </strong>
          );
        if (s.t === 'riyal')
          return (
            <span key={i}>
              <SaudiRiyalIcon className={RIYAL} aria-hidden />
              <span className="sr-only">{t('assistant.currency')}</span>
            </span>
          );
        return (
          <Link key={i} href={s.href} onClick={close} className={NAV_LINK}>
            {t(s.labelKey)}
          </Link>
        );
      })}
    </>
  );
}

function Row({ cells, head = false }: { cells: InlineSeg[][]; head?: boolean }) {
  const Cell = head ? 'th' : 'td';
  return (
    <tr>
      {cells.map((segs, i) => (
        <Cell key={i} className={cn(CELL, head && 'bg-dashboard-search-bg font-semibold')}>
          <InlineRun segs={segs} />
        </Cell>
      ))}
    </tr>
  );
}

function TableBlock({ block }: { block: Extract<MessageBlock, { kind: 'table' }> }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table dir="auto" className="w-full border-collapse text-[13px]">
        <thead>
          <Row cells={block.header} head />
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <Row key={i} cells={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListBlock({ block }: { block: Extract<MessageBlock, { kind: 'ol' | 'ul' }> }) {
  const Tag = block.kind === 'ol' ? 'ol' : 'ul';
  return (
    <Tag
      dir="auto"
      className={cn(
        'ms-1 flex flex-col gap-1 ps-4 text-start',
        block.kind === 'ol' ? 'list-decimal' : 'list-disc',
      )}
    >
      {block.items.map((segs, i) => (
        <li key={i}>
          <InlineRun segs={segs} />
        </li>
      ))}
    </Tag>
  );
}

function Block({ block }: { block: MessageBlock }) {
  if (block.kind === 'hr') return <hr className="border-border my-1.5" />;
  if ((block.kind === 'h' || block.kind === 'p') && block.inline.length === 0) return null;
  if (block.kind === 'note') {
    return (
      <div
        dir="auto"
        className="border-primary/40 bg-primary/[0.06] text-foreground/90 rounded-lg border-s-4 px-3.5 py-2.5 text-start text-[14px] leading-relaxed"
      >
        <InlineRun segs={block.inline} />
      </div>
    );
  }
  if (block.kind === 'h') {
    return (
      <p
        dir="auto"
        className={cn(
          'mt-1 text-start',
          block.level <= 2 ? 'text-base font-bold' : 'text-[15px] font-semibold',
        )}
      >
        <InlineRun segs={block.inline} />
      </p>
    );
  }
  if (block.kind === 'p') {
    return (
      <p dir="auto" className="text-start">
        <InlineRun segs={block.inline} />
      </p>
    );
  }
  if (block.kind === 'table') return <TableBlock block={block} />;
  return <ListBlock block={block} />;
}

/**
 * Renders an assistant reply as organized markdown — headings, bold, lists, paragraphs,
 * callout notes (`>`), horizontal rules, and pipe tables — with inline nav links and the
 * Saudi Riyal glyph in place of currency words. Emoji icons are stripped. Prose is revealed
 * by the typewriter; table-bearing replies render at once. While typing, the visible markdown
 * is `aria-hidden` and the full text is exposed sr-only.
 */
export function AssistantMessageContent({
  text,
  id,
  animate,
}: {
  text: string;
  id: string;
  animate: boolean;
}) {
  const hasTable = useMemo(() => containsTable(text), [text]);
  const { visible, done } = useTypewriter(text, animate && !hasTable, id);
  const body = (
    <div className="flex flex-col gap-2">
      {parseMessageBlocks(visible).map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
  if (done) return body;
  return (
    <>
      <div aria-hidden>{body}</div>
      <span className="sr-only">{toPlainText(text)}</span>
    </>
  );
}
