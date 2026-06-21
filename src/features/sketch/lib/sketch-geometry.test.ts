import { describe, expect, it } from 'vitest';

import type { Point } from '../api/sketch-types';

import {
  placeOpening,
  pointInPolygon,
  polygonBounds,
  polygonCentroid,
  stairSteps,
} from './sketch-geometry';

const SQUARE: Point[] = [
  [0, 0],
  [6, 0],
  [6, 6],
  [0, 6],
];

describe('polygonBounds / polygonCentroid', () => {
  it('computes bounds and centroid of a square', () => {
    expect(polygonBounds(SQUARE)).toEqual({ minX: 0, minY: 0, maxX: 6, maxY: 6 });
    expect(polygonCentroid(SQUARE)).toEqual([3, 3]);
  });

  it('is safe on an empty polygon', () => {
    expect(polygonBounds([])).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    expect(polygonCentroid([])).toEqual([0, 0]);
  });
});

describe('placeOpening', () => {
  const bounds = polygonBounds(SQUARE);

  it('places a door centred along the north wall at its offset', () => {
    const p = placeOpening(bounds, { type: 'door', wall: 'north', offset_m: 2, width_m: 1.2 });
    expect(p).toEqual({ x: 2.6, y: 6, isHorizontal: true, width: 1.2, isDoor: true });
  });

  it('marks windows on side walls as vertical and not doors', () => {
    const p = placeOpening(bounds, { type: 'window', wall: 'east', offset_m: 1, width_m: 1 });
    expect(p?.isDoor).toBe(false);
    expect(p?.isHorizontal).toBe(false);
    expect(p?.x).toBe(6);
  });

  it('returns null for an unknown wall', () => {
    expect(placeOpening(bounds, { wall: 'ceiling' })).toBeNull();
  });
});

describe('stairSteps', () => {
  it('builds a tread + riser per step, climbing the run', () => {
    const boxes = stairSteps({ direction: 'north', treads: 12, width_m: 1.1, x: 0, y: 0 }, 0, 3);
    expect(boxes).toHaveLength(25); // 12 × (tread + riser) + 1 top landing

    // Treads (even indices) climb toward the storey top.
    const firstTread = boxes[0]?.position[1] ?? 0;
    const lastTread = boxes[22]?.position[1] ?? 0;
    expect(firstTread).toBeLessThan(lastTread);
    expect(lastTread).toBeCloseTo(3.2 - 0.07 / 2); // top tread ≈ rise + 0.2 landing

    // The final box is the landing, flush with the top tread's height (the floor above).
    expect(boxes[24]?.position[1]).toBeCloseTo(3.2 - 0.07 / 2);

    // Footprint centred on the anchor; climbs north (data +y → world −z).
    const firstZ = boxes[0]?.position[2] ?? 0;
    const lastZ = boxes[22]?.position[2] ?? 0;
    expect((firstZ + lastZ) / 2).toBeCloseTo(0);
    expect(lastZ).toBeLessThan(firstZ);
  });

  it('defaults to 14 treads and is safe with missing fields', () => {
    expect(stairSteps({}, 0, 3)).toHaveLength(29); // 14 × (tread + riser) + 1 landing
  });

  it('seats the flight at the wall it climbs from, not floating on the anchor', () => {
    const fit = { minX: 0, minY: 0, maxX: 2, maxY: 6 };
    // North climb (data +y → world −z) with the anchor near the FAR (maxY) wall —
    // the low end must still start at the minY wall and climb across.
    const boxes = stairSteps({ x: 1, y: 5, treads: 12, direction: 'north' }, 0, 3, fit);
    const firstTread = boxes[0]; // lowest step
    const lastTread = boxes[22]; // highest step

    expect((firstTread?.position[1] ?? 0) < (lastTread?.position[1] ?? 0)).toBe(true); // climbs up
    expect(firstTread?.position[2] ?? 0).toBeGreaterThan(-0.8); // low end hugs the minY wall (z ≈ 0)
    for (const box of boxes) {
      expect(box.position[2]).toBeLessThanOrEqual(0.01);
      expect(box.position[2]).toBeGreaterThanOrEqual(-6.01);
    }
  });

  it('fits the run inside the host room and pushes it against the near wall', () => {
    const fit = { minX: 0, minY: 0, maxX: 5, maxY: 2 };
    // Run along Y (south); anchor X=99 is past the room centre, so it pushes to maxX.
    const boxes = stairSteps({ x: 99, y: 99, treads: 12, direction: 'south' }, 0, 3, fit);

    expect(boxes).toHaveLength(25);
    for (const box of boxes) {
      expect(box.position[0]).toBeGreaterThanOrEqual(fit.minX);
      expect(box.position[0]).toBeLessThanOrEqual(fit.maxX);
      expect(box.position[2]).toBeGreaterThanOrEqual(-fit.maxY);
      expect(box.position[2]).toBeLessThanOrEqual(-fit.minY);
      // Pushed against the far (maxX) wall, not centred on the room.
      expect(box.position[0]).toBeGreaterThan((fit.minX + fit.maxX) / 2);
    }
  });
});

describe('pointInPolygon', () => {
  const SQ: Point[] = [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4],
  ];

  it('detects points inside and outside', () => {
    expect(pointInPolygon(2, 2, SQ)).toBe(true);
    expect(pointInPolygon(5, 2, SQ)).toBe(false);
    expect(pointInPolygon(-1, 2, SQ)).toBe(false);
  });
});
