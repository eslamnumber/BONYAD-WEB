'use client';

import { useTranslation } from 'react-i18next';

import type {
  RoomPlacement,
  SketchFloor,
  SketchOpening,
  SketchRoom,
  SketchScene,
} from '../../../api/sketch-types';
import { clearDoorways } from '../../../lib/furniture-clearance';
import { pickText } from '../../../lib/locale-text';
import { roomColor, type ScenePalette } from '../../../lib/scene-palette';
import type { SceneTextures } from '../../../lib/scene-textures';
import { placeOpening, polygonBounds, type Bounds } from '../../../lib/sketch-geometry';
import type { PlacedOpening } from '../../../lib/wall-geometry';

import { FloorStairs } from './floor-stairs';
import { FloorWalls } from './floor-walls';
import { FurnitureMesh } from './furniture-mesh';
import { RoomMesh } from './room-mesh';

type Props = {
  floor: SketchFloor;
  scene: SketchScene;
  palette: ScenePalette;
  textures: SceneTextures;
  isDark: boolean;
};

/** A stairwell opening, not a real room — no floor slab is drawn over it. */
const isStairVoid = (room: SketchRoom): boolean => (room.tags ?? []).includes('stair_void');

const hasPolygon = (room: SketchRoom): boolean => (room.polygon?.length ?? 0) >= 3;

/** Every opening placed in world-plane metres (resolved against its owner room). */
function placeAllOpenings(rooms: SketchRoom[], openings: SketchOpening[]): PlacedOpening[] {
  return openings.flatMap((opening) => {
    const owner = rooms.find((room) => room.id === opening.room);
    if (!owner || !hasPolygon(owner)) return [];
    const p = placeOpening(polygonBounds(owner.polygon ?? []), opening);
    return p
      ? [{ x: p.x, y: p.y, width: p.width, isDoor: p.isDoor, external: opening.external ?? false }]
      : [];
  });
}

/** Furniture for every room on the storey, nudged clear of the door openings. */
function FloorFurniture({
  placements,
  openings,
  roomBounds,
  elevation,
  palette,
}: {
  placements: RoomPlacement[];
  openings: PlacedOpening[];
  roomBounds: Map<string, Bounds>;
  elevation: number;
  palette: ScenePalette;
}) {
  return (
    <>
      {placements.map((group, i) => (
        <FurnitureMesh
          key={group.room_id ?? `placement-${i}`}
          items={clearDoorways(
            group.placements ?? [],
            openings,
            roomBounds.get(group.room_id ?? ''),
          )}
          elevation={elevation}
          palette={palette}
        />
      ))}
    </>
  );
}

/** The tinted floor slab + label for every (non-void) room on the storey. */
function FloorRooms({
  rooms,
  elevation,
  isDark,
}: {
  rooms: SketchRoom[];
  elevation: number;
  isDark: boolean;
}) {
  const { i18n } = useTranslation();
  return (
    <>
      {rooms.map((room, i) => (
        <RoomMesh
          key={room.id ?? `room-${i}`}
          room={room}
          roomName={pickText(i18n.language, room.name_en, room.name_ar)}
          elevation={elevation}
          floorColor={roomColor(room.tags, isDark)}
        />
      ))}
    </>
  );
}

/** All geometry for one storey — rooms, the furniture inside them, and stairs. */
export function FloorLayer({ floor, scene, palette, textures, isDark }: Props) {
  const elevation = floor.elevation_m ?? 0;
  const wallHeight = scene.wall_height_m ?? floor.ceiling_height_m ?? 3;
  const wallThickness = scene.wall_thickness_m ?? 0.2;
  const allRooms = floor.rooms ?? [];
  const rooms = allRooms.filter((room) => !isStairVoid(room));
  const openings = floor.openings ?? [];
  const placedOpenings = placeAllOpenings(allRooms, openings);
  const roomIds = new Set(rooms.map((room) => room.id));
  const placements = (scene.placements ?? []).filter(
    (group) => group.room_id && roomIds.has(group.room_id),
  );
  const roomBounds = new Map(
    rooms.flatMap((room) =>
      room.id ? [[room.id, polygonBounds(room.polygon ?? [])] as const] : [],
    ),
  );

  return (
    <group>
      <FloorRooms rooms={rooms} elevation={elevation} isDark={isDark} />
      <FloorWalls
        rooms={rooms}
        openings={placedOpenings}
        dims={{ elevation, height: wallHeight, thickness: wallThickness }}
        palette={palette}
        textures={textures}
      />
      <FloorFurniture
        placements={placements}
        openings={placedOpenings}
        roomBounds={roomBounds}
        elevation={elevation}
        palette={palette}
      />
      <FloorStairs
        stairs={floor.stairs ?? []}
        rooms={allRooms}
        elevation={elevation}
        rise={wallHeight}
        palette={palette}
        textures={textures}
      />
    </group>
  );
}
