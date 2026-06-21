'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';

import type { SketchFloor, SketchParse, SketchScene as SceneData } from '../../api/sketch-types';
import { scenePalette } from '../../lib/scene-palette';
import { createSceneTextures } from '../../lib/scene-textures';

import { FloorLayer } from './scene/floor-layer';

type Props = {
  parse: SketchParse;
  scene: SceneData;
  isDark: boolean;
  /** Index of the only storey to render, or `null`/`undefined` to show them all. */
  visibleFloor?: number | null;
};

/** Union extent of every room across floors → camera framing (data-space). */
function computeExtent(floors: SketchFloor[]): { center: [number, number]; radius: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const floor of floors) {
    for (const room of floor.rooms ?? []) {
      for (const [x, y] of room.polygon ?? []) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (!Number.isFinite(minX)) return { center: [0, 0], radius: 12 };
  return {
    center: [(minX + maxX) / 2, (minY + maxY) / 2],
    radius: Math.max(6, Math.hypot(maxX - minX, maxY - minY) / 2),
  };
}

/** Ambient + hemisphere fill and a shadow-casting key light sized to the plan. */
function SceneLights({
  cx,
  cy,
  radius,
  dist,
}: {
  cx: number;
  cy: number;
  radius: number;
  dist: number;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight intensity={0.5} />
      <directionalLight
        position={[cx + radius, radius * 2.5, -cy + radius]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-normalBias={0.05}
        shadow-camera-near={0.5}
        shadow-camera-far={dist * 12}
        shadow-camera-left={-radius * 3}
        shadow-camera-right={radius * 3}
        shadow-camera-top={radius * 3}
        shadow-camera-bottom={-radius * 3}
      />
    </>
  );
}

/** The WebGL dollhouse. Default-exported so it loads via `dynamic(..., ssr:false)`. */
export default function SketchScene({ parse, scene, isDark, visibleFloor = null }: Props) {
  const palette = scenePalette(isDark);
  const textures = useMemo(() => createSceneTextures(), []);
  const { center, radius } = useMemo(() => computeExtent(parse.floors ?? []), [parse.floors]);
  const floors = parse.floors ?? [];
  const [cx, cy] = center;
  const target: [number, number, number] = [cx, 0, -cy];
  const dist = radius * 1.8;

  return (
    <Canvas
      shadows
      camera={{
        position: [cx + dist * 0.8, dist, -cy + dist * 0.8],
        fov: 45,
        near: 0.1,
        far: dist * 12,
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={[palette.background]} />
      <SceneLights cx={cx} cy={cy} radius={radius} dist={dist} />

      {floors.map((floor, i) =>
        visibleFloor === null || visibleFloor === i ? (
          <FloorLayer
            key={floor.id ?? `floor-${i}`}
            floor={floor}
            scene={scene}
            palette={palette}
            textures={textures}
            isDark={isDark}
          />
        ) : null,
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.02, -cy]} receiveShadow>
        <planeGeometry args={[radius * 5, radius * 5]} />
        <meshStandardMaterial color={palette.ground} roughness={1} />
      </mesh>

      <OrbitControls target={target} enableDamping makeDefault maxPolarAngle={Math.PI / 2.05} />
    </Canvas>
  );
}
