import { describe, expect, it } from 'vitest';

import type { Point } from '../api/sketch-types';

import { buildFloorWalls, offsetOnEdge, splitEdge } from './wall-geometry';

const SOUTH_EDGE = { ax: 0, ay: 0, ux: 1, uy: 0, length: 6 };

describe('splitEdge', () => {
  it('returns the whole edge when there are no openings', () => {
    expect(splitEdge(6, [])).toEqual([{ start: 0, end: 6 }]);
  });

  it('punches a gap in the middle, leaving two solid segments', () => {
    expect(splitEdge(6, [{ offset: 3, width: 1 }])).toEqual([
      { start: 0, end: 2.5 },
      { start: 3.5, end: 6 },
    ]);
  });

  it('merges overlapping openings into one gap', () => {
    expect(
      splitEdge(10, [
        { offset: 3, width: 2 },
        { offset: 4, width: 2 },
      ]),
    ).toEqual([
      { start: 0, end: 2 },
      { start: 5, end: 10 },
    ]);
  });
});

describe('offsetOnEdge', () => {
  it('projects a point lying on the edge to its offset', () => {
    expect(offsetOnEdge(SOUTH_EDGE, 2.6, 0)).toBeCloseTo(2.6);
  });

  it('rejects a point off the edge line', () => {
    expect(offsetOnEdge(SOUTH_EDGE, 2.6, 1.5)).toBeNull();
  });
});

describe('buildFloorWalls', () => {
  const DIMS = { elevation: 0, height: 3, thickness: 0.2 };
  // Two rooms sharing the x=5 wall.
  const ROOM_A: Point[] = [
    [0, 0],
    [5, 0],
    [5, 4],
    [0, 4],
  ];
  const ROOM_B: Point[] = [
    [5, 0],
    [10, 0],
    [10, 4],
    [5, 4],
  ];

  it('merges every collinear shared wall so adjacent rooms build it once', () => {
    // Collinear walls merge across rooms: the two top edges become one wall, the two
    // bottom edges one, plus the shared divider and the two ends → 5 walls.
    const build = buildFloorWalls([ROOM_A, ROOM_B], [], DIMS);
    expect(build.solids).toHaveLength(5);
    expect(build.panels).toHaveLength(0);
  });

  it('punches a shared interior door once, with a single leaf', () => {
    const build = buildFloorWalls(
      [ROOM_A, ROOM_B],
      [{ x: 5, y: 2, width: 1, isDoor: true, external: false }],
      DIMS,
    );
    // Divider split into 2 → 5 − 1 + 2 = 6 solids, a lintel above, ONE leaf.
    expect(build.solids).toHaveLength(6);
    expect(build.lintels).toHaveLength(1);
    expect(build.panels).toHaveLength(1);
    expect(build.panels[0]?.isDoor).toBe(true);
  });

  it('gives a window a sill below and a lintel above', () => {
    const build = buildFloorWalls(
      [ROOM_A],
      [{ x: 5, y: 2, width: 1, isDoor: false, external: false }],
      DIMS,
    );
    expect(build.sills).toHaveLength(1);
    expect(build.lintels).toHaveLength(1);
    expect(build.panels[0]?.isDoor).toBe(false);
    expect(build.panels[0]?.position[1]).toBeCloseTo(1.6); // sill 0.9 + half of 1.4
  });

  it('merges a wall shared by different-size rooms so a door punches it once', () => {
    // 6-wide room over a 10-wide room, sharing the y=5 line (x0-6 overlaps). Before the
    // collinear merge this left a duplicate solid wall the door never punched.
    const SMALL: Point[] = [
      [0, 0],
      [6, 0],
      [6, 5],
      [0, 5],
    ];
    const BIG: Point[] = [
      [0, 5],
      [10, 5],
      [10, 10],
      [0, 10],
    ];
    const build = buildFloorWalls(
      [SMALL, BIG],
      [{ x: 3, y: 5, width: 1, isDoor: true, external: false }],
      DIMS,
    );
    // Horizontal (rotationY≈0) solids whose centre sits on the y=5 line.
    const onY5 = build.solids.filter(
      (s) => Math.abs(-s.position[2] - 5) < 0.01 && Math.abs(s.rotationY) < 0.01,
    );
    expect(onY5).toHaveLength(2); // single merged wall split into two spans around the door
    expect(build.panels).toHaveLength(1); // one leaf, not two
  });

  it('snaps an off-edge opening to the nearest wall instead of dropping it', () => {
    // 0.4 m off the x=5 wall — still snaps (≤ 1.2 m) rather than vanishing.
    const build = buildFloorWalls(
      [ROOM_A],
      [{ x: 4.6, y: 2, width: 1, isDoor: true, external: false }],
      DIMS,
    );
    expect(build.panels).toHaveLength(1);
  });
});
