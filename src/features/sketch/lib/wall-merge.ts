import type { Edge } from './wall-geometry';

/**
 * Collapse collinear wall edges into single walls. Adjacent rooms of DIFFERENT sizes
 * share a wall line but with different-length segments (e.g. a 6 m room beside a 10 m
 * room): an endpoint-only dedupe keeps both, so a door punches one copy and the other
 * stays solid — the "door appears between two walls" / "wall has no door" defect.
 * Grouping edges by the infinite line they lie on, then merging their 1-D intervals,
 * yields exactly ONE wall per physical location, which every opening then punches once.
 */

/** Snap to a 0.02 m grid so near-equal lines / interval ends group together. */
const snap = (v: number): number => Math.round(v / 0.02) * 0.02;

/** Sign-normalised direction so an edge and its reverse map to the same line. */
function canonicalDir(edge: Edge): [number, number] {
  const flip = edge.ux < -1e-9 || (Math.abs(edge.ux) < 1e-9 && edge.uy < 0);
  return flip ? [-edge.ux, -edge.uy] : [edge.ux, edge.uy];
}

/** Key for the infinite line: canonical direction + signed perpendicular offset. */
function lineKey(edge: Edge): string {
  const [ux, uy] = canonicalDir(edge);
  const perp = edge.ax * uy - edge.ay * ux; // constant for every point on the line
  return `${snap(ux)},${snap(uy)}|${snap(perp)}`;
}

type Interval = { lo: number; hi: number };

/** Union of overlapping / touching intervals (within the snap tolerance). */
function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort((a, b) => a.lo - b.lo);
  const out: Interval[] = [];
  for (const iv of sorted) {
    const last = out[out.length - 1];
    if (last && iv.lo <= last.hi + 0.02) last.hi = Math.max(last.hi, iv.hi);
    else out.push({ ...iv });
  }
  return out;
}

/** One wall per merged interval on each line — no overlapping duplicates. */
export function mergeCollinearEdges(edges: Edge[]): Edge[] {
  const groups = new Map<string, Edge[]>();
  for (const edge of edges) {
    const key = lineKey(edge);
    const list = groups.get(key);
    if (list) list.push(edge);
    else groups.set(key, [edge]);
  }

  const out: Edge[] = [];
  for (const group of groups.values()) {
    const ref = group[0];
    if (!ref) continue;
    const [ux, uy] = canonicalDir(ref);
    const proj = (x: number, y: number): number => (x - ref.ax) * ux + (y - ref.ay) * uy;
    const intervals = group.map((e) => {
      const t0 = proj(e.ax, e.ay);
      const t1 = proj(e.ax + e.ux * e.length, e.ay + e.uy * e.length);
      return { lo: Math.min(t0, t1), hi: Math.max(t0, t1) };
    });
    for (const { lo, hi } of mergeIntervals(intervals)) {
      out.push({ ax: ref.ax + ux * lo, ay: ref.ay + uy * lo, ux, uy, length: hi - lo });
    }
  }
  return out;
}
