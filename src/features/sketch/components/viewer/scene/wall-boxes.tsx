'use client';

import type { Texture } from 'three';

import type { WallBuild } from '../../../lib/wall-geometry';

import { TexturedBox } from './textured-box';

type Props = { build: WallBuild; color: number; brick: Texture };

/** Solid wall segments, window sills and lintels — brick-textured, tinted by color. */
export function WallBoxes({ build, color, brick }: Props) {
  const boxes = [...build.solids, ...build.sills, ...build.lintels];
  return (
    <group>
      {boxes.map((box, i) => (
        <TexturedBox
          key={`wall-${i}`}
          box={box}
          texture={brick}
          tile={0.5}
          color={color}
          roughness={0.95}
        />
      ))}
    </group>
  );
}
