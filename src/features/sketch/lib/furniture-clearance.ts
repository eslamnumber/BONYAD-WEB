import type { FurnitureItem } from '../api/sketch-types';

import type { Bounds } from './sketch-geometry';
import type { PlacedOpening } from './wall-geometry';

/**
 * Keep furniture from sitting on top of a doorway. The backend places furniture per
 * room without knowing where the doors land, so a box can end up covering a door
 * leaf. Here each item is nudged radially away from any door it overlaps — into the
 * room, off the opening — so doors stay visible and walkable. Coords are floor-plane
 * metres, same space as the placed openings (data `[x, y]`).
 */

/** Extra gap left between a cleared item and the door edge, in metres. */
const CLEARANCE = 0.25;
/** Relaxation passes so an item wedged between two doors clears both. */
const PASSES = 3;

/** Bounding radius of an item's footprint (orientation-agnostic). */
function footprintRadius(item: FurnitureItem): number {
  const w = item.w ?? 0.5;
  const d = item.d ?? 0.5;
  return 0.5 * Math.hypot(w, d);
}

/** Push `(x, y)` out to clear a single door, or leave it if already clear. */
function pushOffDoor(x: number, y: number, radius: number, door: PlacedOpening): [number, number] {
  const need = door.width / 2 + radius + CLEARANCE;
  const dx = x - door.x;
  const dy = y - door.y;
  const dist = Math.hypot(dx, dy);
  if (dist >= need) return [x, y];
  if (dist < 1e-3) return [x, y + need]; // dead-centre on the door — push along +y
  const scale = need / dist;
  return [door.x + dx * scale, door.y + dy * scale];
}

/** Keep `v` within `[min+r, max−r]`; recentre when the span is narrower than `2r`. */
function clampAxis(v: number, min: number, max: number, r: number): number {
  const lo = min + r;
  const hi = max - r;
  if (lo > hi) return (min + max) / 2;
  return Math.min(Math.max(v, lo), hi);
}

/**
 * Move every item clear of every door opening. Windows are ignored (furniture under
 * a window is fine); only door leaves are avoided. With `room` bounds, the cleared
 * position is clamped back inside the room so a push never shoves furniture through a
 * wall (tiny rooms recentre instead). Returns new items — inputs are not mutated.
 */
export function clearDoorways(
  items: FurnitureItem[],
  openings: PlacedOpening[],
  room?: Bounds,
): FurnitureItem[] {
  const doors = openings.filter((opening) => opening.isDoor);
  if (doors.length === 0) return items;
  return items.map((item) => {
    let x = item.x ?? 0;
    let y = item.y ?? 0;
    const radius = footprintRadius(item);
    for (let pass = 0; pass < PASSES; pass++) {
      for (const door of doors) [x, y] = pushOffDoor(x, y, radius, door);
    }
    if (room) {
      x = clampAxis(x, room.minX, room.maxX, radius);
      y = clampAxis(y, room.minY, room.maxY, radius);
    }
    return { ...item, x, y };
  });
}
