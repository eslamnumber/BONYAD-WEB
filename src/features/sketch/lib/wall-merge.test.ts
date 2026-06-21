import { describe, expect, it } from 'vitest';

import type { Edge } from './wall-geometry';
import { mergeCollinearEdges } from './wall-merge';

const edge = (ax: number, ay: number, bx: number, by: number): Edge => {
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy);
  return { ax, ay, ux: dx / length, uy: dy / length, length };
};

const span = (e: Edge): [number, number] => {
  const x1 = e.ax + e.ux * e.length;
  const y1 = e.ay + e.uy * e.length;
  return e.ux !== 0
    ? [Math.min(e.ax, x1), Math.max(e.ax, x1)]
    : [Math.min(e.ay, y1), Math.max(e.ay, y1)];
};

describe('mergeCollinearEdges', () => {
  it('merges two overlapping collinear edges (different sizes, reversed dir) into one', () => {
    // The real defect: a 6 m room edge over a 10 m room edge on the same y=5 line.
    const merged = mergeCollinearEdges([edge(0, 5, 6, 5), edge(10, 5, 0, 5)]);
    expect(merged).toHaveLength(1);
    expect(span(merged[0]!)).toEqual([0, 10]);
  });

  it('keeps non-overlapping collinear edges separate (preserves a gap)', () => {
    expect(mergeCollinearEdges([edge(0, 0, 2, 0), edge(5, 0, 8, 0)])).toHaveLength(2);
  });

  it('merges edges that only touch at an endpoint', () => {
    const merged = mergeCollinearEdges([edge(0, 0, 5, 0), edge(5, 0, 9, 0)]);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.length).toBeCloseTo(9);
  });

  it('does not merge parallel edges on different lines', () => {
    expect(mergeCollinearEdges([edge(0, 0, 5, 0), edge(0, 3, 5, 3)])).toHaveLength(2);
  });

  it('does not merge perpendicular edges', () => {
    expect(mergeCollinearEdges([edge(0, 0, 5, 0), edge(0, 0, 0, 5)])).toHaveLength(2);
  });
});
