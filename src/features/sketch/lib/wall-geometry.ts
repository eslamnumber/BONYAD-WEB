import type { Point } from '../api/sketch-types';

import { mergeCollinearEdges } from './wall-merge';

/**
 * Floor-level wall geometry with REAL openings punched for doors and windows.
 * Adjacent rooms share a wall, so we DEDUPE coincident polygon edges across the
 * whole storey and build each wall ONCE — single thickness, no z-fighting, and an
 * interior door open from both sides with its leaf drawn once. Openings arrive
 * pre-placed in world-plane metres; each is snapped to the wall it sits on, which
 * is split into solid segments around the hole, with a sill below / lintel above.
 * Data `[x, y]` metres map to three.js world `(x, 0, −y)`.
 *
 * Opening dimensions mirror the backend's renderer (door 2.1 m, window 1.4 m at a
 * 0.9 m sill); materials/colours are composed in-house (`scene-palette`).
 */

const DOOR_H = 2.1;
const WINDOW_H = 1.4;
const WINDOW_SILL = 0.9;

/** A box ready for a three.js `<mesh>`: world centre, Y-rotation, `[w, h, d]`. */
export type SceneBox = {
  position: [number, number, number];
  rotationY: number;
  size: [number, number, number];
};

export type OpeningPanel = SceneBox & { isDoor: boolean; external: boolean };

export type WallBuild = {
  /** Full-height wall segments between openings. */
  solids: SceneBox[];
  /** Wall below a window. */
  sills: SceneBox[];
  /** Wall above an opening (door or window). */
  lintels: SceneBox[];
  /** The door slab / glass pane filling each hole. */
  panels: OpeningPanel[];
};

/** Wall dimensions shared by every box on a storey. */
export type WallDims = { elevation: number; height: number; thickness: number };

/** An opening already placed in world-plane metres (owner-room offset resolved). */
export type PlacedOpening = {
  x: number;
  y: number;
  width: number;
  isDoor: boolean;
  external: boolean;
};

export type Edge = { ax: number; ay: number; ux: number; uy: number; length: number };
type Slot = {
  offset: number;
  width: number;
  isDoor: boolean;
  external: boolean;
  height: number;
  sill: number;
};
type BoxSpec = { tCenter: number; len: number; yCenter: number; h: number; thick: number };

export function polygonEdges(points: Point[]): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!a || !b) continue;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const length = Math.hypot(dx, dy);
    if (length < 1e-6) continue;
    edges.push({ ax: a[0], ay: a[1], ux: dx / length, uy: dy / length, length });
  }
  return edges;
}

/** Offset of a point along an edge, or `null` if it doesn't lie on the segment. */
export function offsetOnEdge(edge: Edge, x: number, y: number, tol = 0.3): number | null {
  const px = x - edge.ax;
  const py = y - edge.ay;
  const along = px * edge.ux + py * edge.uy;
  const perp = Math.abs(px * -edge.uy + py * edge.ux);
  if (perp > tol || along < -tol || along > edge.length + tol) return null;
  return Math.min(Math.max(along, 0), edge.length);
}

/** Solid spans of `[0, length]` with the slot intervals removed (1-D subtraction). */
export function splitEdge(
  length: number,
  slots: { offset: number; width: number }[],
): { start: number; end: number }[] {
  const gaps = slots
    .map((s) => ({
      start: Math.max(0, s.offset - s.width / 2),
      end: Math.min(length, s.offset + s.width / 2),
    }))
    .filter((g) => g.end > g.start)
    .sort((a, b) => a.start - b.start);
  const spans: { start: number; end: number }[] = [];
  let cursor = 0;
  for (const gap of gaps) {
    if (gap.start > cursor + 1e-6) spans.push({ start: cursor, end: gap.start });
    cursor = Math.max(cursor, gap.end);
  }
  if (cursor < length - 1e-6) spans.push({ start: cursor, end: length });
  return spans;
}

function edgeBox(edge: Edge, spec: BoxSpec, elevation: number): SceneBox {
  return {
    position: [
      edge.ax + edge.ux * spec.tCenter,
      elevation + spec.yCenter,
      -(edge.ay + edge.uy * spec.tCenter),
    ],
    rotationY: Math.atan2(edge.uy, edge.ux),
    size: [spec.len, spec.h, spec.thick],
  };
}

/** Sill + lintel + panel for one opening on an edge. */
function slotParts(edge: Edge, slot: Slot, dims: WallDims) {
  const { elevation, height, thickness } = dims;
  const top = slot.sill + slot.height;
  const base = { tCenter: slot.offset, len: slot.width };
  const sill =
    slot.sill > 0.01
      ? edgeBox(
          edge,
          { ...base, yCenter: slot.sill / 2, h: slot.sill, thick: thickness },
          elevation,
        )
      : null;
  const lintel =
    top < height - 0.01
      ? edgeBox(
          edge,
          { ...base, yCenter: (top + height) / 2, h: height - top, thick: thickness },
          elevation,
        )
      : null;
  const panelThick = slot.isDoor ? thickness * 1.1 : thickness * 0.25;
  const panel: OpeningPanel = {
    ...edgeBox(
      edge,
      { ...base, yCenter: slot.sill + slot.height / 2, h: slot.height, thick: panelThick },
      elevation,
    ),
    isDoor: slot.isDoor,
    external: slot.external,
  };
  return { sill, lintel, panel };
}

/** Nearest edge to a point by perpendicular distance (≤1.2 m), offset clamped. */
function findEdge(edges: Edge[], x: number, y: number): { index: number; offset: number } | null {
  let best: { index: number; offset: number } | null = null;
  let bestPerp = Infinity;
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (!edge) continue;
    const px = x - edge.ax;
    const py = y - edge.ay;
    const perp = Math.abs(px * -edge.uy + py * edge.ux);
    if (perp < bestPerp) {
      bestPerp = perp;
      best = { index: i, offset: Math.min(Math.max(px * edge.ux + py * edge.uy, 0), edge.length) };
    }
  }
  return bestPerp <= 1.2 ? best : null;
}

/** Group every placed opening onto the wall it sits on, keyed by edge index. */
function assignOpenings(edges: Edge[], openings: PlacedOpening[]): Map<number, Slot[]> {
  const byEdge = new Map<number, Slot[]>();
  for (const o of openings) {
    const hit = findEdge(edges, o.x, o.y);
    if (!hit) continue;
    const slot: Slot = {
      offset: hit.offset,
      width: o.width,
      isDoor: o.isDoor,
      external: o.external,
      height: o.isDoor ? DOOR_H : WINDOW_H,
      sill: o.isDoor ? 0 : WINDOW_SILL,
    };
    const list = byEdge.get(hit.index);
    if (list) list.push(slot);
    else byEdge.set(hit.index, [slot]);
  }
  return byEdge;
}

function appendEdge(build: WallBuild, edge: Edge, slots: Slot[], dims: WallDims): void {
  for (const span of splitEdge(edge.length, slots)) {
    const len = span.end - span.start;
    if (len < 1e-3) continue;
    const spec = {
      tCenter: (span.start + span.end) / 2,
      len,
      yCenter: dims.height / 2,
      h: dims.height,
      thick: dims.thickness,
    };
    build.solids.push(edgeBox(edge, spec, dims.elevation));
  }
  for (const slot of slots) {
    const { sill, lintel, panel } = slotParts(edge, slot, dims);
    if (sill) build.sills.push(sill);
    if (lintel) build.lintels.push(lintel);
    build.panels.push(panel);
  }
}

/**
 * Whole-storey walls from the room polygons + every placed opening. Coincident
 * shared walls are deduped so each is one single-thickness box, and each opening is
 * punched + drawn exactly once on the wall it lies on.
 */
export function buildFloorWalls(
  polygons: Point[][],
  openings: PlacedOpening[],
  dims: WallDims,
): WallBuild {
  const edges = mergeCollinearEdges(polygons.flatMap(polygonEdges));
  const byEdge = assignOpenings(edges, openings);
  const build: WallBuild = { solids: [], sills: [], lintels: [], panels: [] };
  edges.forEach((edge, i) => appendEdge(build, edge, byEdge.get(i) ?? [], dims));
  return build;
}
