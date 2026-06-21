import type { Point, SketchOpening, SketchStair } from '../api/sketch-types';

/**
 * Pure geometry helpers for the 3D dollhouse. The data plane is metres `[x, y]`;
 * three.js world space maps `data y → world −z` (so +y "north" points to −z), and
 * this mapping is applied consistently here and in the meshes that consume it.
 */

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

export function polygonBounds(points: Point[]): Bounds {
  if (points.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

export function polygonCentroid(points: Point[]): Point {
  if (points.length === 0) return [0, 0];
  let sx = 0;
  let sy = 0;
  for (const [x, y] of points) {
    sx += x;
    sy += y;
  }
  return [sx / points.length, sy / points.length];
}

export type OpeningPlacement = {
  x: number;
  y: number;
  isHorizontal: boolean;
  width: number;
  isDoor: boolean;
};

/**
 * Place an opening at its offset along the named bounding-box wall (data-space
 * coords). Approximate — uses the room's bbox edge — which is robust for the
 * axis-aligned rooms the backend emits. Returns `null` for an unknown wall.
 */
export function placeOpening(bounds: Bounds, opening: SketchOpening): OpeningPlacement | null {
  const width = opening.width_m ?? 0.9;
  const offset = (opening.offset_m ?? 0) + width / 2;
  const isDoor = opening.type !== 'window';
  const { minX, minY, maxX, maxY } = bounds;
  switch (opening.wall) {
    case 'north':
      return { x: minX + offset, y: maxY, isHorizontal: true, width, isDoor };
    case 'south':
      return { x: minX + offset, y: minY, isHorizontal: true, width, isDoor };
    case 'east':
      return { x: maxX, y: minY + offset, isHorizontal: false, width, isDoor };
    case 'west':
      return { x: minX, y: minY + offset, isHorizontal: false, width, isDoor };
    default:
      return null;
  }
}

const TREAD_DEPTH = 0.28;

export type StairStep = { position: [number, number, number]; size: [number, number, number] };

function stairDirection(direction?: string): [number, number] {
  switch (direction) {
    case 'south':
      return [0, -1];
    case 'east':
      return [1, 0];
    case 'west':
      return [-1, 0];
    default:
      return [0, 1]; // north
  }
}

/** Is the point inside the polygon? Ray-casting (handles any simple polygon). */
export function pointInPolygon(x: number, y: number, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (!a || !b) continue;
    const hits = a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0];
    if (hits) inside = !inside;
  }
  return inside;
}

type StairPlacement = {
  cx: number;
  cy: number;
  dx: number;
  dy: number;
  tread: number;
  width: number;
  horizontal: boolean;
};

const clamp = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);

/** Room bounds split into run-axis vs perpendicular, per the run's orientation. */
function orientedBounds(fit: Bounds, alongX: boolean) {
  return alongX
    ? { aMin: fit.minX, aMax: fit.maxX, pMin: fit.minY, pMax: fit.maxY }
    : { aMin: fit.minY, aMax: fit.maxY, pMin: fit.minX, pMax: fit.maxX };
}

/**
 * Run oriented by the backend `direction` (so it matches the 2D plan), sized to fit
 * its host room, then seated like a real staircase: its LOW end starts at the wall the
 * climb leads away from and it rises across the room, while the side is PUSHED against
 * the nearest perpendicular wall (per the anchor). Starting at a wall — rather than
 * floating centred on the anchor — stops the flight sprawling through the middle of a
 * room and reading as mis-placed.
 */
function fitToRoom(stair: SketchStair, treads: number, fit: Bounds): StairPlacement {
  const sx = stair.x ?? 0;
  const sy = stair.y ?? 0;
  const [dx, dy] = stairDirection(stair.direction);
  const alongX = Math.abs(dx) > 0.5;
  const { aMin, aMax, pMin, pMax } = orientedBounds(fit, alongX);
  const tread = Math.max(0.06, Math.min(TREAD_DEPTH, (aMax - aMin - 0.4) / treads));
  const run = treads * tread;
  const width = Math.min(stair.width_m ?? 1.1, Math.max(0.7, pMax - pMin - 0.3));
  const anchorP = alongX ? sy : sx;
  const climbsUp = (alongX ? dx : dy) >= 0; // +A = north/east; low end sits at the −A wall
  const start = climbsUp ? aMin + run / 2 + 0.2 : aMax - run / 2 - 0.2;
  const a = clamp(start, aMin + run / 2, aMax - run / 2);
  const p = anchorP < (pMin + pMax) / 2 ? pMin + width / 2 + 0.15 : pMax - width / 2 - 0.15;
  const [cx, cy] = alongX ? [a, p] : [p, a];
  return { cx, cy, dx, dy, tread, width, horizontal: alongX };
}

/** Resolve where/how the run sits — fitted to the host room, else centred on `x/y`. */
function stairPlacement(stair: SketchStair, treads: number, fit?: Bounds): StairPlacement {
  if (fit) return fitToRoom(stair, treads, fit);
  const [dx, dy] = stairDirection(stair.direction);
  return {
    cx: stair.x ?? 0,
    cy: stair.y ?? 0,
    dx,
    dy,
    tread: TREAD_DEPTH,
    width: stair.width_m ?? 1.1,
    horizontal: Math.abs(dx) > 0.5,
  };
}

const TREAD_T = 0.07;
/** Depth of the platform at the top of the flight (level with the floor above). */
const LANDING_LEN = 0.7;

/** One box of the flight, mapped from along-run offset to world (data y → −z). */
function stairBox(
  p: StairPlacement,
  off: number,
  spec: { y: number; h: number; len: number },
): StairStep {
  return {
    position: [p.cx + p.dx * off, spec.y, -(p.cy + p.dy * off)],
    size: [p.horizontal ? spec.len : p.width, spec.h, p.horizontal ? p.width : spec.len],
  };
}

/**
 * An open staircase: per step a thin horizontal TREAD at its climbing height plus a
 * vertical RISER closing its front — so it reads as real stairs, not a solid wedge.
 * The footprint is centred on its anchor and, with a `fit` room, sized + pushed
 * against a wall to sit inside it. Climbs one storey and tops out with a LANDING slab
 * level with the floor above, so the flight ends ON a floor rather than mid-air.
 */
export function stairSteps(
  stair: SketchStair,
  elevation: number,
  rise: number,
  fit?: Bounds,
): StairStep[] {
  const treads = Math.max(1, Math.round(stair.treads ?? 14));
  const riser = (rise + 0.2) / treads;
  const p = stairPlacement(stair, treads, fit);
  const run = treads * p.tread;
  const boxes: StairStep[] = [];
  for (let i = 0; i < treads; i++) {
    const top = elevation + (i + 1) * riser;
    const mid = (i + 0.5) * p.tread - run / 2; // centred on the anchor
    const front = i * p.tread - run / 2;
    boxes.push(stairBox(p, mid, { y: top - TREAD_T / 2, h: TREAD_T, len: p.tread }));
    boxes.push(stairBox(p, front, { y: top - riser / 2, h: riser, len: TREAD_T }));
  }
  // Landing at the very top, flush with the floor above (the top tread's height).
  const landingY = elevation + treads * riser;
  const landingLen = Math.min(LANDING_LEN, run / 2);
  boxes.push(
    stairBox(p, run / 2 - landingLen / 2, {
      y: landingY - TREAD_T / 2,
      h: TREAD_T,
      len: landingLen,
    }),
  );
  return boxes;
}
