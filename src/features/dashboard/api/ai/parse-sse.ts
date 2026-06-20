import type { SowDocument } from './sow-types';

/**
 * A parsed chatbot stream event (iOS `WizardStreamEvent`). `token`/`responseDelta`
 * deltas are counted-and-dropped by the consumer (RAM discipline); `section`
 * builds the SOW incrementally; `complete` carries the final answer + SOW.
 */
export type WizardStreamEvent =
  | { type: 'thinking'; message: string }
  | { type: 'token'; text: string }
  | { type: 'responseDelta'; text: string }
  | { type: 'section'; path: string; value: unknown }
  | { type: 'complete'; answer: string; sow: SowDocument | null }
  | { type: 'error'; message: string }
  | { type: 'done'; conversationId?: string };

function asString(v: unknown, ...keys: string[]): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') {
    for (const k of keys) {
      const hit = (v as Record<string, unknown>)[k];
      if (typeof hit === 'string') return hit;
    }
  }
  return '';
}

function readSow(data: Record<string, unknown>): SowDocument | null {
  const direct = data.sow;
  const nested = (data.ui as { sow?: unknown } | undefined)?.sow;
  const sow = direct ?? nested;
  return sow && typeof sow === 'object' ? (sow as SowDocument) : null;
}

/** Map one raw `event:`/`data:` pair to a {@link WizardStreamEvent}. */
export function mapSseEvent(name: string, dataRaw: string): WizardStreamEvent | null {
  const trimmed = dataRaw.trim();
  if (name === 'done' || trimmed === '[DONE]') {
    return {
      type: 'done',
      conversationId: asString(safeParse(trimmed), 'conversationId') || undefined,
    };
  }
  return mapNamedEvent(name, safeParse(trimmed));
}

function mapNamedEvent(name: string, data: unknown): WizardStreamEvent | null {
  const obj = (data ?? {}) as Record<string, unknown>;
  switch (name) {
    case 'thinking':
      return { type: 'thinking', message: asString(data, 'message') };
    case 'token':
      return { type: 'token', text: asString(data, 'text') };
    case 'response_delta':
      return { type: 'responseDelta', text: asString(data, 'text') };
    case 'section':
      return { type: 'section', path: asString(obj.path) || '', value: obj.value };
    case 'complete':
      return { type: 'complete', answer: asString(obj, 'response', 'answer'), sow: readSow(obj) };
    case 'error':
      return { type: 'error', message: asString(data, 'message') || 'stream error' };
    default:
      return null; // `start` and unknown events are ignored.
  }
}

function safeParse(raw: string): unknown {
  if (!raw || raw === '[DONE]') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Incremental SSE reader. The chatbot stream sometimes omits the blank-line
 * separator between events (iOS quirk), so a pending event is flushed on EITHER a
 * blank line OR the next `event:` line — never relying on blank-line dispatch alone.
 */
export class SseEventBuffer {
  private buffer = '';
  private name = '';
  private data = '';
  private pending = false;

  push(chunk: string): WizardStreamEvent[] {
    this.buffer += chunk;
    const out: WizardStreamEvent[] = [];
    let nl: number;
    while ((nl = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, nl).replace(/\r$/, '');
      this.buffer = this.buffer.slice(nl + 1);
      this.consumeLine(line, out);
    }
    return out;
  }

  /** Flush any event still pending after the stream closes. */
  end(): WizardStreamEvent[] {
    const out: WizardStreamEvent[] = [];
    this.flush(out);
    return out;
  }

  private consumeLine(line: string, out: WizardStreamEvent[]): void {
    if (line.startsWith(':')) return; // `: stream open` comment
    if (line.startsWith('event:')) {
      this.flush(out); // quirk: a new event line implies the previous one ended
      this.name = line.slice(6).trim();
      this.pending = true;
      return;
    }
    if (line.startsWith('data:')) {
      this.data += (this.data ? '\n' : '') + line.slice(5).trim();
      this.pending = true;
      return;
    }
    if (line.trim() === '') this.flush(out);
  }

  private flush(out: WizardStreamEvent[]): void {
    if (!this.pending) return;
    const event = mapSseEvent(this.name, this.data);
    if (event) out.push(event);
    this.name = '';
    this.data = '';
    this.pending = false;
  }
}
