'use client';

import { useMemo } from 'react';
import type { Texture } from 'three';

import type { SceneBox } from '../../../lib/wall-geometry';

type Props = {
  box: SceneBox;
  texture: Texture;
  /** World size (m) of one texture tile, so brick/grain scale is uniform. */
  tile: number;
  color: number;
  roughness?: number;
  metalness?: number;
};

/**
 * A box whose material is tinted by `color` and mapped with `texture` tiled at a
 * uniform world scale — the texture is cloned so each box can set its own `repeat`
 * from its dimensions (a shared texture can only hold one repeat).
 */
export function TexturedBox({
  box,
  texture,
  tile,
  color,
  roughness = 0.85,
  metalness = 0.03,
}: Props) {
  const map = useMemo(() => {
    const t = texture.clone();
    t.repeat.set(
      Math.max(1, Math.round(box.size[0] / tile)),
      Math.max(1, Math.round(box.size[1] / tile)),
    );
    t.needsUpdate = true;
    return t;
  }, [texture, tile, box.size]);

  return (
    <mesh position={box.position} rotation={[0, box.rotationY, 0]} castShadow receiveShadow>
      <boxGeometry args={box.size} />
      <meshStandardMaterial map={map} color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}
