'use client';

import { Html } from '@react-three/drei';
import { useMemo } from 'react';
import { DoubleSide, Shape } from 'three';

import type { SketchRoom } from '../../../api/sketch-types';
import { polygonCentroid } from '../../../lib/sketch-geometry';

type Props = {
  room: SketchRoom;
  roomName: string;
  elevation: number;
  /** Floor tint resolved from the room's function tags. */
  floorColor: number;
};

/** Floating room name on a translucent chip, flat on the floor. */
function RoomLabel({ name, position }: { name: string; position: [number, number, number] }) {
  return (
    <Html position={position} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
      <span className="rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-white select-none">
        {name}
      </span>
    </Html>
  );
}

/**
 * One room's tinted floor slab + label. Walls + openings are built once at the
 * floor level (see `FloorWalls`) so adjacent rooms don't double up their shared
 * wall — this component is just the floor plate.
 */
export function RoomMesh({ room, roomName, elevation, floorColor }: Props) {
  const points = room.polygon ?? [];
  const shape = useMemo(() => {
    const s = new Shape();
    (room.polygon ?? []).forEach((p, i) => (i === 0 ? s.moveTo(p[0], p[1]) : s.lineTo(p[0], p[1])));
    return s;
  }, [room.polygon]);

  if (points.length < 3) return null;

  const [cx, cy] = polygonCentroid(points);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, elevation + 0.01, 0]} receiveShadow>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={floorColor} side={DoubleSide} roughness={0.95} />
      </mesh>
      {roomName ? <RoomLabel name={roomName} position={[cx, elevation + 0.06, -cy]} /> : null}
    </group>
  );
}
