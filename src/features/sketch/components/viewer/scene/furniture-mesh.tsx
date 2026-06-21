'use client';

import type { FurnitureItem } from '../../../api/sketch-types';
import type { ScenePalette } from '../../../lib/scene-palette';

type Props = { items: FurnitureItem[]; elevation: number; palette: ScenePalette };

/**
 * Furniture for one room — a coloured box per placement. `x/y` are floor-plane
 * metres (data y → world −z), `z` the height offset, `rot` degrees. Colours come
 * from the backend per item, falling back to a neutral.
 */
export function FurnitureMesh({ items, elevation, palette }: Props) {
  return (
    <group>
      {items.map((item, i) => {
        const w = item.w ?? 0.5;
        const d = item.d ?? 0.5;
        const h = item.h ?? 0.5;
        const x = item.x ?? 0;
        const y = item.y ?? 0;
        const z = item.z ?? 0;
        const rotationY = -((item.rot ?? 0) * Math.PI) / 180;
        return (
          <mesh
            key={`furniture-${i}`}
            position={[x, elevation + z + h / 2, -y]}
            rotation={[0, rotationY, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial
              color={item.color ?? palette.furnitureFallback}
              roughness={0.7}
              metalness={0.05}
            />
          </mesh>
        );
      })}
    </group>
  );
}
