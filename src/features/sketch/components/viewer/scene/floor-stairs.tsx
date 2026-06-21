'use client';

import type { SketchRoom, SketchStair } from '../../../api/sketch-types';
import type { ScenePalette } from '../../../lib/scene-palette';
import type { SceneTextures } from '../../../lib/scene-textures';
import {
  pointInPolygon,
  polygonBounds,
  polygonCentroid,
  type Bounds,
} from '../../../lib/sketch-geometry';

import { StairMesh } from './stair-mesh';

const hasPolygon = (room: SketchRoom): boolean => (room.polygon?.length ?? 0) >= 3;

/** Closest room to a point by centroid — fallback when no room strictly contains it. */
function nearestRoom(rooms: SketchRoom[], x: number, y: number): SketchRoom | undefined {
  let best: SketchRoom | undefined;
  let bestD = Infinity;
  for (const room of rooms) {
    if (!hasPolygon(room)) continue;
    const [cx, cy] = polygonCentroid(room.polygon ?? []);
    const d = Math.hypot(cx - x, cy - y);
    if (d < bestD) {
      bestD = d;
      best = room;
    }
  }
  return best;
}

/**
 * Bounds of the room a stair sits in, so the flight is sized + pushed against its
 * wall. Falls back to the NEAREST room when no polygon strictly contains the anchor
 * (open-plan halls, an anchor on a wall line) — without this the flight drops back to
 * a free-standing run through the middle of the room.
 */
function stairFit(rooms: SketchRoom[], stair: SketchStair): Bounds | undefined {
  const x = stair.x ?? 0;
  const y = stair.y ?? 0;
  const host =
    rooms.find((room) => pointInPolygon(x, y, room.polygon ?? [])) ?? nearestRoom(rooms, x, y);
  return host && hasPolygon(host) ? polygonBounds(host.polygon ?? []) : undefined;
}

type Props = {
  stairs: SketchStair[];
  rooms: SketchRoom[];
  elevation: number;
  rise: number;
  palette: ScenePalette;
  textures: SceneTextures;
};

/** Every stair on the storey, each fitted + pushed against its host room's wall. */
export function FloorStairs({ stairs, rooms, elevation, rise, palette, textures }: Props) {
  return (
    <>
      {stairs.map((stair, i) => (
        <StairMesh
          key={stair.id ?? `stair-${i}`}
          stair={stair}
          elevation={elevation}
          rise={rise}
          palette={palette}
          wood={textures.wood}
          fit={stairFit(rooms, stair)}
        />
      ))}
    </>
  );
}
