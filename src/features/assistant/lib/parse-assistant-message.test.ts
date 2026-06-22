import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/config/routes';

import {
  containsTable,
  parseInline,
  parseMessageBlocks,
  toPlainText,
} from './parse-assistant-message';

describe('parseInline', () => {
  it('splits bold, nav links, and plain text', () => {
    const segs = parseInline('افتح **مشاريعك** عبر [NAV:projects] الآن');
    expect(segs).toEqual([
      { t: 'text', v: 'افتح ' },
      { t: 'bold', v: 'مشاريعك' },
      { t: 'text', v: ' عبر ' },
      { t: 'nav', href: ROUTES.DASHBOARD_PROJECTS, labelKey: 'assistant.nav.projects' },
      { t: 'text', v: ' الآن' },
    ]);
  });
});

describe('parseMessageBlocks', () => {
  it('parses an intro paragraph + numbered list + outro (the real bot reply shape)', () => {
    const text =
      'بُنياد تقدم خدمات، تشمل:\n1. **البحث عن فنيين**: متخصصون.\n2. **إدارة المشاريع**: أدوات تتبّع.\nإذا كان لديك استفسار';
    const blocks = parseMessageBlocks(text);
    expect(blocks.map((b) => b.kind)).toEqual(['p', 'ol', 'p']);
    const ol = blocks[1];
    if (ol?.kind !== 'ol') throw new Error('expected ol');
    expect(ol.items).toHaveLength(2);
    expect(ol.items[0]?.[0]).toEqual({ t: 'bold', v: 'البحث عن فنيين' });
  });

  it('handles Arabic-Indic numerals and bullet lists', () => {
    expect(parseMessageBlocks('١. أولاً\n٢. ثانياً')[0]?.kind).toBe('ol');
    const bullets = parseMessageBlocks('- نقطة\n- أخرى');
    expect(bullets[0]?.kind).toBe('ul');
    if (bullets[0]?.kind === 'ul') expect(bullets[0].items).toHaveLength(2);
  });

  it('keeps a blank line as a block separator', () => {
    expect(parseMessageBlocks('سطر أول\n\nسطر ثانٍ').map((b) => b.kind)).toEqual(['p', 'p']);
  });
});

describe('parseMessageBlocks — headings, rules, tables', () => {
  it('parses ATX headings with their level', () => {
    const blocks = parseMessageBlocks('## عنوان\n### قسم');
    expect(blocks[0]).toMatchObject({ kind: 'h', level: 2 });
    const h3 = blocks[1];
    expect(h3).toMatchObject({ kind: 'h', level: 3 });
    if (h3?.kind === 'h') expect(h3.inline[0]).toEqual({ t: 'text', v: 'قسم' });
  });

  it('parses a horizontal rule between paragraphs', () => {
    expect(parseMessageBlocks('قبل\n---\nبعد').map((b) => b.kind)).toEqual(['p', 'hr', 'p']);
  });

  it('parses a pipe table into header + inline-parsed cells', () => {
    const text = '| البند | التفاصيل |\n|-------|----------|\n| النوع | تشطيب |\n| المساحة | 340 |';
    const blocks = parseMessageBlocks(text);
    expect(blocks).toHaveLength(1);
    const table = blocks[0];
    if (table?.kind !== 'table') throw new Error('expected a table block');
    expect(table.header.map((c) => c[0])).toEqual([
      { t: 'text', v: 'البند' },
      { t: 'text', v: 'التفاصيل' },
    ]);
    expect(table.rows).toHaveLength(2);
    expect(table.rows[1]?.[1]?.[0]).toEqual({ t: 'text', v: '340' });
  });

  it('treats a stray pipe line without a separator as a paragraph, not a table', () => {
    expect(parseMessageBlocks('| لا يوجد فاصل |').map((b) => b.kind)).toEqual(['p']);
  });
});

describe('containsTable', () => {
  it('detects a header + separator pair, ignores plain prose', () => {
    expect(containsTable('| a | b |\n|---|---|\n| 1 | 2 |')).toBe(true);
    expect(containsTable('نص عادي بدون جدول')).toBe(false);
  });
});

describe('parseInline — emoji + currency', () => {
  it('strips emoji icons and collapses the gap they leave', () => {
    expect(parseInline('🏗 خطة المشروع')).toEqual([{ t: 'text', v: 'خطة المشروع' }]);
    expect(parseInline('✅ تم')).toEqual([{ t: 'text', v: 'تم' }]);
  });

  it('converts SAR / ريال currency mentions into a riyal glyph segment', () => {
    expect(parseInline('السعر 40000 SAR')).toEqual([
      { t: 'text', v: 'السعر 40000 ' },
      { t: 'riyal' },
    ]);
    expect(parseInline('إجمالي ريال').some((s) => s.t === 'riyal')).toBe(true);
  });

  it('keeps the em-dash and superscript ² (not emoji)', () => {
    expect(parseInline('تشطيب 340 م² — Olaya')).toEqual([{ t: 'text', v: 'تشطيب 340 م² — Olaya' }]);
  });

  it('extracts a "quoted" phrase as an isolated quote segment', () => {
    expect(parseInline('انتقل إلى قسم "مشاريعي".')).toEqual([
      { t: 'text', v: 'انتقل إلى قسم ' },
      { t: 'quote', v: 'مشاريعي' },
      { t: 'text', v: '.' },
    ]);
    // Guillemets and curly quotes are handled too.
    expect(parseInline('«الأعمال»').find((s) => s.t === 'quote')).toEqual({
      t: 'quote',
      v: 'الأعمال',
    });
  });
});

describe('parseMessageBlocks — notes', () => {
  it('parses a blockquote into a note block with the emoji stripped', () => {
    const blocks = parseMessageBlocks('> 💡 هذه تقديرات استرشادية');
    expect(blocks[0]?.kind).toBe('note');
    if (blocks[0]?.kind === 'note') {
      expect(blocks[0].inline[0]).toEqual({ t: 'text', v: 'هذه تقديرات استرشادية' });
    }
  });
});

describe('toPlainText', () => {
  it('strips bold markers and nav tokens for screen readers', () => {
    expect(toPlainText('خدمات **مهمة** [NAV:projects] هنا')).toBe('خدمات مهمة  هنا');
  });
});
