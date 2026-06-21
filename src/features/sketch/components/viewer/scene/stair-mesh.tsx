'use client';

import { useMemo } from 'react';
import type { Texture } from 'three';

import type { SketchStair } from '../../../api/sketch-types';
import type { ScenePalette } from '../../../lib/scene-palette';
import { stairSteps, type Bounds } from '../../../lib/sketch-geometry';

import { TexturedBox } from './textured-box';

type Props = {
  stair: SketchStair;
  elevation: number;
  rise: number;
  palette: ScenePalette;
  wood: Texture;
  /** Host-room bounds, so the flight is sized to fit inside its room. */
  fit?: Bounds;
};

/** A solid wood-textured staircase, fitted to its room so it never crosses a wall. */
export function StairMesh({ stair, elevation, rise, palette, wood, fit }: Props) {
  const steps = useMemo(
    () => stairSteps(stair, elevation, rise, fit),
    [stair, elevation, rise, fit],
  );
  return (
    <group>
      {steps.map((step, i) => (
        <TexturedBox
          key={`tread-${i}`}
          box={{ position: step.position, rotationY: 0, size: step.size }}
          texture={wood}
          tile={0.4}
          color={palette.stair}
          roughness={0.8}
        />
      ))}
    </group>
  );
}
