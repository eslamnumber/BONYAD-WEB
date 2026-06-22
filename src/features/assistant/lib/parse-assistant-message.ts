import { parseAssistantNav } from './parse-assistant-nav';

/** An inline run: plain text, **bold**, a "quoted" phrase, an in-app nav link, or the Riyal glyph. */
export type InlineSeg =
  | { t: 'text'; v: string }
  | { t: 'bold'; v: string }
  | { t: 'quote'; v: string }
  | { t: 'nav'; href: string; labelKey: string; param?: string }
  | { t: 'riyal' };

/** A block of the reply: heading, paragraph, list, table, callout note, or rule. */
export type MessageBlock =
  | { kind: 'h'; level: number; inline: InlineSeg[] }
  | { kind: 'p'; inline: InlineSeg[] }
  | { kind: 'note'; inline: InlineSeg[] }
  | { kind: 'ol' | 'ul'; items: InlineSeg[][] }
  | { kind: 'table'; header: InlineSeg[][]; rows: InlineSeg[][][] }
  | { kind: 'hr' };

const BOLD_RE = /\*\*([^*]+?)\*\*/g;
// In a plain-text run: a quoted phrase (groups 1-3 → bidi-isolated typographic quotes) or a
// currency mention (SAR / ريال / ر.س → Riyal glyph).
const INLINE_RE = /"([^"\n]+)"|«([^»\n]+)»|“([^”\n]+)”|\bSAR\b|ريال|ر\.?\s?س/gi;
// Emoji + pictographs + variation selectors (NOT em-dash —, arrow →, or superscript ²).
// Combining marks (variation selector, ZWJ, keycap) are alternated, not class members
// (a misleading-character-class lint error otherwise).
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]|\u{FE0F}|\u{200D}|\u{20E3}/gu;
const H_RE = /^\s*(#{1,6})\s+(.*)$/; // markdown ATX heading
const HR_RE = /^\s*([-*_])\1{2,}\s*$/; // --- *** ___
const NOTE_RE = /^\s*>\s?(.*)$/; // blockquote → callout note
const OL_RE = /^\s*[\d٠-٩]+[.)]\s+(.*)$/;
const UL_RE = /^\s*[-*•]\s+(.*)$/;

/** Drop emoji icons and collapse the whitespace they leave behind. */
function stripEmoji(text: string): string {
  return text
    .replace(EMOJI_RE, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Push a plain-text run, splitting out quoted phrases and currency mentions. */
function pushText(out: InlineSeg[], text: string): void {
  let last = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    const start = m.index ?? 0;
    if (start > last) out.push({ t: 'text', v: text.slice(last, start) });
    const quoted = m[1] ?? m[2] ?? m[3];
    if (quoted !== undefined) out.push({ t: 'quote', v: quoted.trim() });
    else out.push({ t: 'riyal' });
    last = start + m[0].length;
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) });
}

/** Split one line into bold / nav / riyal / plain runs (emoji stripped first). */
export function parseInline(text: string): InlineSeg[] {
  const out: InlineSeg[] = [];
  for (const seg of parseAssistantNav(stripEmoji(text))) {
    if (seg.type === 'nav') {
      out.push({
        t: 'nav',
        href: seg.href,
        labelKey: seg.labelKey,
        ...(seg.param ? { param: seg.param } : {}),
      });
      continue;
    }
    let last = 0;
    for (const m of seg.value.matchAll(BOLD_RE)) {
      const start = m.index ?? 0;
      if (start > last) pushText(out, seg.value.slice(last, start));
      out.push({ t: 'bold', v: m[1] ?? '' });
      last = start + m[0].length;
    }
    if (last < seg.value.length) pushText(out, seg.value.slice(last));
  }
  return out;
}

/** Split a `| a | b |` row into trimmed, inline-parsed cells. */
function splitCells(line: string): InlineSeg[][] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => parseInline(c.trim()));
}

const isTableRow = (line: string | undefined): boolean => !!line && line.trim().startsWith('|');

/** A `|---|:--:|` row: every pipe-separated cell is only dashes (with optional colons). */
function isSeparatorRow(line: string | undefined): boolean {
  if (!isTableRow(line)) return false;
  return line!
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .every((c) => /^\s*:?-{2,}:?\s*$/.test(c));
}

/** True if the text contains a markdown pipe-table (header row followed by a separator row). */
export function containsTable(text: string): boolean {
  const lines = text.split('\n');
  return lines.some((l, i) => isTableRow(l) && isSeparatorRow(lines[i + 1]));
}

/** Consume a pipe-table at `start` (header + separator + data rows); returns the block + next index. */
function consumeTable(lines: string[], start: number): { block: MessageBlock; next: number } {
  const header = splitCells(lines[start] ?? '');
  const rows: InlineSeg[][][] = [];
  let i = start + 2; // skip header + separator
  while (i < lines.length && isTableRow(lines[i])) {
    rows.push(splitCells(lines[i] ?? ''));
    i += 1;
  }
  return { block: { kind: 'table', header, rows }, next: i };
}

type SingleLine =
  | { kind: 'h'; level: number; content: string }
  | { kind: 'note'; content: string }
  | { kind: 'ol'; content: string }
  | { kind: 'ul'; content: string }
  | { kind: 'p'; content: string }
  | { kind: 'hr' }
  | { kind: 'blank' };

/** Ordered/bullet list item, or null if the line is not a list item. */
function classifyListLine(raw: string): SingleLine | null {
  const ol = OL_RE.exec(raw);
  if (ol) return { kind: 'ol', content: ol[1] ?? '' };
  const ul = UL_RE.exec(raw);
  if (ul) return { kind: 'ul', content: ul[1] ?? '' };
  return null;
}

/** Classify one non-table line: heading, rule, note, list item, paragraph, or blank. */
function classifyLine(raw: string): SingleLine {
  if (!raw.trim()) return { kind: 'blank' };
  if (HR_RE.test(raw)) return { kind: 'hr' };
  const h = H_RE.exec(raw);
  if (h) return { kind: 'h', level: h[1]?.length ?? 1, content: h[2] ?? '' };
  const note = NOTE_RE.exec(raw);
  if (note) return { kind: 'note', content: note[1] ?? '' };
  return classifyListLine(raw) ?? { kind: 'p', content: raw.trim() };
}

/** Append a list item, extending the previous block if it is a list of the same kind. */
function pushList(blocks: MessageBlock[], kind: 'ol' | 'ul', content: string): void {
  const prev = blocks[blocks.length - 1];
  if (prev && (prev.kind === 'ol' || prev.kind === 'ul') && prev.kind === kind) {
    prev.items.push(parseInline(content));
  } else {
    blocks.push({ kind, items: [parseInline(content)] });
  }
}

/** Append a note line, merging into the previous note block (multi-line blockquote). */
function pushNote(blocks: MessageBlock[], content: string): void {
  const prev = blocks[blocks.length - 1];
  if (prev?.kind === 'note') prev.inline.push({ t: 'text', v: ' ' }, ...parseInline(content));
  else blocks.push({ kind: 'note', inline: parseInline(content) });
}

/** Append one classified line to the block list. */
function pushLine(blocks: MessageBlock[], line: SingleLine): void {
  switch (line.kind) {
    case 'blank':
      return;
    case 'hr':
      blocks.push({ kind: 'hr' });
      return;
    case 'h':
      blocks.push({ kind: 'h', level: line.level, inline: parseInline(line.content) });
      return;
    case 'p':
      blocks.push({ kind: 'p', inline: parseInline(line.content) });
      return;
    case 'note':
      pushNote(blocks, line.content);
      return;
    default:
      pushList(blocks, line.kind, line.content); // 'ol' | 'ul'
  }
}

/** Parse a reply into heading / paragraph / note / list / table / rule blocks. */
export function parseMessageBlocks(text: string): MessageBlock[] {
  const blocks: MessageBlock[] = [];
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i] ?? '';
    if (isTableRow(raw) && isSeparatorRow(lines[i + 1])) {
      const table = consumeTable(lines, i);
      blocks.push(table.block);
      i = table.next;
      continue;
    }
    pushLine(blocks, classifyLine(raw));
    i += 1;
  }
  return blocks;
}

/** Strip markdown/nav/emoji tokens for the sr-only full-text node shown during the typewriter reveal. */
export function toPlainText(text: string): string {
  return stripEmoji(text)
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\[\s*NAV\s*:[^\]]*\]/gi, '')
    .trim();
}
