import { describe, expect, it } from 'vitest';

import type { FurnitureItem } from '../api/sketch-types';

import { clearDoorways } from './furniture-clearance';
import type { PlacedOpening } from './wall-geometry';

const door = (x: number, y: number, width = 0.9): PlacedOpening => ({
  x,
  y,
  width,
  isDoor: true,
  external: false,
});

const distance = (item: FurnitureItem, d: PlacedOpening): number =>
  Math.hypot((item.x ?? 0) - d.x, (item.y ?? 0) - d.y);

describe('clearDoorways', () => {
  it('leaves items untouched when there are no doors', () => {
    const items: FurnitureItem[] = [{ x: 1, y: 1, w: 0.5, d: 0.5 }];
    expect(clearDoorways(items, [{ ...door(0, 0), isDoor: false }])).toEqual(items);
  });

  it('pushes an item sitting on a door off it, into the room', () => {
    const d = door(2, 2);
    const [cleared] = clearDoorways([{ x: 2.1, y: 2.1, w: 0.6, d: 0.4 }], [d]);
    // Far enough to clear the door half-width + footprint radius + margin.
    const radius = 0.5 * Math.hypot(0.6, 0.4);
    expect(distance(cleared!, d)).toBeGreaterThanOrEqual(d.width / 2 + radius + 0.25 - 1e-6);
  });

  it('keeps an item that already clears the door where it is', () => {
    const d = door(0, 0);
    const item: FurnitureItem = { x: 4, y: 4, w: 0.5, d: 0.5 };
    const [cleared] = clearDoorways([item], [d]);
    expect(cleared).toEqual(item);
  });

  it('handles an item dead-centre on the door without dividing by zero', () => {
    const d = door(1, 1);
    const [cleared] = clearDoorways([{ x: 1, y: 1, w: 0.5, d: 0.5 }], [d]);
    expect(Number.isFinite(cleared?.x ?? NaN)).toBe(true);
    expect(distance(cleared!, d)).toBeGreaterThan(0.5);
  });

  it('keeps a pushed item inside its room bounds instead of through a wall', () => {
    // Tiny 2×2 room with a door on the east wall; the item would be shoved east, out.
    const d = door(2, 1);
    const room = { minX: 0, minY: 0, maxX: 2, maxY: 2 };
    const [cleared] = clearDoorways([{ x: 1.8, y: 1, w: 0.6, d: 0.4 }], [d], room);
    const r = 0.5 * Math.hypot(0.6, 0.4);
    expect(cleared?.x ?? 0).toBeLessThanOrEqual(room.maxX - r + 1e-9);
    expect(cleared?.x ?? 0).toBeGreaterThanOrEqual(room.minX + r - 1e-9);
    expect(cleared?.y ?? 0).toBeLessThanOrEqual(room.maxY);
  });

  it('recentres an item in a room narrower than its own footprint', () => {
    const room = { minX: 18, minY: 0, maxX: 20, maxY: 2 }; // 2×2, sofa wider than the room
    const [cleared] = clearDoorways([{ x: 19, y: 1, w: 2.4, d: 0.9 }], [door(20, 1)], room);
    expect(cleared?.x).toBeCloseTo(19); // (min+max)/2
    expect(cleared?.y).toBeCloseTo(1);
  });

  it('clears an item wedged between two adjacent doors from both', () => {
    const doors = [door(0, 0), door(1.2, 0)];
    const [cleared] = clearDoorways([{ x: 0.6, y: 0.1, w: 0.5, d: 0.5 }], doors);
    const radius = 0.5 * Math.hypot(0.5, 0.5);
    for (const d of doors) {
      expect(distance(cleared!, d)).toBeGreaterThanOrEqual(d.width / 2 + radius + 0.25 - 0.05);
    }
  });
});
