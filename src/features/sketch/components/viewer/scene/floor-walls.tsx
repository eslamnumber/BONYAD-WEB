'use client';

import { useMemo } from 'react';

import type { SketchRoom } from '../../../api/sketch-types';
import type { ScenePalette } from '../../../lib/scene-palette';
import type { SceneTextures } from '../../../lib/scene-textures';
import { buildFloorWalls, type PlacedOpening, type WallDims } from '../../../lib/wall-geometry';

import { OpeningPanels } from './opening-mesh';
import { WallBoxes } from './wall-boxes';

type Props = {
  rooms: SketchRoom[];
  openings: PlacedOpening[];
  dims: WallDims;
  palette: ScenePalette;
  textures: SceneTextures;
};

/**
 * Every wall on the storey, built ONCE from the deduped room edges — single
 * thickness, no coincident double walls, each door/window punched + drawn once.
 */
export function FloorWalls({ rooms, openings, dims, palette, textures }: Props) {
  const build = useMemo(() => {
    const polygons = rooms.map((room) => room.polygon ?? []).filter((p) => p.length >= 3);
    return buildFloorWalls(polygons, openings, dims);
  }, [rooms, openings, dims]);

  return (
    <>
      <WallBoxes build={build} color={palette.wall} brick={textures.brick} />
      <OpeningPanels panels={build.panels} palette={palette} wood={textures.wood} />
    </>
  );
}
